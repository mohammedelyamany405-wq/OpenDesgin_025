<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref } from 'vue'
import { useEventListener, useUrlSearchParams } from '@vueuse/core'
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'

import { exposeCollaborationActions } from '@/app/browser-bridge'
import { startMCPRuntime, stopMCPRuntime } from '@/app/automation/mcp/runtime'
import { COLLAB_KEY, useCollab } from '@/app/collab/use'
import { createDemoShapes } from '@/app/demo/document'
import { createSampleDocument } from '@/app/demo/sample/document'
import type { SampleIds } from '@/app/demo/sample/document'
import { useKeyboard } from '@/app/shell/keyboard/use'
import { openFileFromPath, useEditorMenu } from '@/app/shell/menu/use'
import {
  activeTab,
  createDocumentInCurrentTab,
  createHomeTab,
  createTab,
  getActiveStore,
  tabCount
} from '@/app/tabs'
import { isTauri } from '@/app/tauri/env'
import FontStatusBanner from '@/components/font-status/FontStatusBanner.vue'
import RenameSelectionDialog from '@/components/selection/RenameSelectionDialog.vue'
import SafariBanner from '@/components/SafariBanner.vue'
import TabBar from '@/components/TabBar.vue'
import EditorWorkspace from '@/components/editor/EditorWorkspace.vue'
import HomeWorkspace from '@/components/home/HomeWorkspace.vue'

const route = useRoute()
const params = useUrlSearchParams('history')
const createdInitialTab = tabCount() === 0
const shouldCreateHome =
  route.path === '/' &&
  !('test' in params) &&
  !route.meta.demo &&
  (isTauri() || 'recent-files' in params)
let firstTab = activeTab.value
if (!firstTab) firstTab = shouldCreateHome ? createHomeTab() : createTab()

if (createdInitialTab && route.meta.demo && !('test' in params)) {
  void createDemoShapes(firstTab.store)
}

const samplePageIds = ref<SampleIds | null>(null)
const useBuiltSample = 'build' in params

if (createdInitialTab && route.meta.sample && !('test' in params) && useBuiltSample) {
  samplePageIds.value = createSampleDocument(firstTab.store)
}

async function loadSampleDocument(): Promise<void> {
  const store = firstTab?.store
  if (!store) return
  try {
    const response = await fetch('/web-builder-sample.fig', { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const file = new File([await response.arrayBuffer()], 'web-builder-sample.fig', {
      type: 'application/octet-stream'
    })
    await store.openFigFile(file)
    const pages = store.graph.getPages()
    const home = pages.find((page) => page.name === 'Home')
    const about = pages.find((page) => page.name === 'About')
    if (home && about) samplePageIds.value = { homeId: home.id, aboutId: about.id }
  } catch (error) {
    console.error('[Sample]', error)
  }
}

function switchSamplePage(page: 'home' | 'about'): void {
  const ids = samplePageIds.value
  const store = activeTab.value?.store
  if (!ids || !store) return
  void store
    .switchPage(page === 'home' ? ids.homeId : ids.aboutId)
    .then(() => store.fitCurrentPageToViewport())
}

function downloadSample(): void {
  void activeTab.value?.store.saveFigFileAs()
}

function documentTitle(): string | undefined {
  if (route.meta.demo) return 'Demo'
  if (route.meta.sample) return 'Sample'
  return undefined
}

useHead({ title: documentTitle() })
useKeyboard()
useEditorMenu()

const collab = useCollab(getActiveStore)
provide(COLLAB_KEY, collab)
exposeCollaborationActions(collab)

useEventListener(
  document,
  'wheel',
  (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) event.preventDefault()
  },
  { passive: false }
)

const fileAssociationCleanup = ref<(() => void) | null>(null)

interface PendingOpenFile {
  path: string
}

async function openPendingAssociatedFiles(): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  const files = await invoke<PendingOpenFile[]>('take_pending_open')
  for (const file of files) await openFileFromPath(file.path)
}

async function bindAssociatedFileOpen(): Promise<void> {
  if (!isTauri()) return
  const { listen } = await import('@tauri-apps/api/event')
  fileAssociationCleanup.value = await listen('open-associated-files', () => {
    void openPendingAssociatedFiles().catch((error) => console.error('[Open With]', error))
  })
  await openPendingAssociatedFiles()
}

onMounted(async () => {
  if (createdInitialTab && route.meta.sample && !('test' in params) && !useBuiltSample)
    void loadSampleDocument()
  await startMCPRuntime(getActiveStore)

  try {
    await bindAssociatedFileOpen()
  } catch (error) {
    console.error('[Open With]', error)
  }
})

onUnmounted(() => {
  void stopMCPRuntime()
  fileAssociationCleanup.value?.()
})
</script>

<template>
  <div data-test-id="editor-root" class="flex h-screen w-screen flex-col">
    <SafariBanner />
    <FontStatusBanner />
    <RenameSelectionDialog />
    <TabBar />
    <HomeWorkspace v-show="activeTab?.kind === 'home'" @new-document="createDocumentInCurrentTab" />
    <EditorWorkspace v-if="activeTab?.kind !== 'home'" />
    <div
      v-if="route.meta.sample"
      class="fixed bottom-4 right-4 z-50 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg"
    >
      <span class="font-semibold text-slate-700">Web Builder sample</span>
      <button
        class="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
        @click="switchSamplePage('home')"
      >
        Home
      </button>
      <button
        class="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100"
        @click="switchSamplePage('about')"
      >
        About
      </button>
      <button
        class="rounded-md bg-blue-600 px-2 py-1 font-semibold text-white hover:bg-blue-700"
        @click="downloadSample"
      >
        Download .fig
      </button>
    </div>
  </div>
</template>
