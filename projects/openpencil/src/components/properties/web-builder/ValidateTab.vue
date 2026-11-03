<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useEditorStore } from '@/app/editor/active-store'
import type { SceneNode } from '@open-pencil/scene-graph'
import type { ExportNode } from '@/app/web-builder/html-render'
import { validateExportTree, type ValidationIssue } from '@/app/web-builder/validate'

import PanelSection from '@/components/ui/panel/PanelSection.vue'

const PLUGIN_ID = 'open-pencil'
const TAG_KEY = 'web-builder-tag'
const LAYOUT_KEY = 'web-builder-layout'
const ATTRS_KEY = 'web-builder-attrs'
const DECORATIVE_KEY = 'web-builder-decorative'

const editor = useEditorStore()
const issues = ref<ValidationIssue[]>([])
const status = ref<'idle' | 'success' | 'error'>('idle')
const lastRun = ref('')

function pluginValue(node: SceneNode, key: string): string | undefined {
  return node.pluginData.find((e) => e.pluginId === PLUGIN_ID && e.key === key)?.value
}

function getTag(node: SceneNode): string {
  return pluginValue(node, TAG_KEY) || 'div'
}

function isDecorative(node: SceneNode): boolean {
  return pluginValue(node, DECORATIVE_KEY) === 'true'
}

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function sceneToExport(node: SceneNode): ExportNode {
  const children = node.childIds
    .map((id) => editor.graph.getNode(id))
    .filter((child): child is SceneNode => !!child && !child.internalOnly)
    .map(sceneToExport)
  const layout = parseJson<{ type?: 'none' | 'flex' | 'grid' }>(pluginValue(node, LAYOUT_KEY), {})
  return {
    id: node.id,
    name: node.name,
    tag: getTag(node),
    decorative: isDecorative(node),
    attrs: parseJson<Record<string, unknown>>(pluginValue(node, ATTRS_KEY), {}),
    layout,
    hasImageFill: node.fills.some((f) => f.type === 'IMAGE'),
    children
  }
}

function collectAllNodes(pageId: string): SceneNode[] {
  const result: SceneNode[] = []
  function walk(parentId: string) {
    const parent = editor.graph.getNode(parentId)
    if (!parent) return
    for (const childId of parent.childIds) {
      const node = editor.graph.getNode(childId)
      if (!node || node.internalOnly) continue
      result.push(node)
      if (node.childIds.length > 0) walk(node.id)
    }
  }
  walk(pageId)
  return result
}

function selectUntagged() {
  const pageId = editor.state.currentPageId
  if (!pageId) return
  const ids = collectAllNodes(pageId)
    .filter((n) => !isDecorative(n) && getTag(n) === 'div' && n.childIds.length === 0)
    .map((n) => n.id)
  if (ids.length > 0) editor.select(ids)
}

function runValidation() {
  const pageId = editor.state.currentPageId
  if (!pageId) {
    issues.value = [{ type: 'error', message: 'No active page' }]
    status.value = 'error'
    return
  }

  const page = editor.graph.getNode(pageId)
  if (!page) {
    issues.value = [{ type: 'error', message: 'No active page' }]
    status.value = 'error'
    return
  }

  const tree = page.childIds
    .map((id) => editor.graph.getNode(id))
    .filter((child): child is SceneNode => !!child && !child.internalOnly)
    .map(sceneToExport)

  if (tree.length === 0) {
    issues.value = [{ type: 'warning', message: 'Page is empty — nothing to validate' }]
    status.value = 'success'
    lastRun.value = new Date().toLocaleTimeString()
    return
  }

  const found = validateExportTree(tree)
  issues.value = found
  status.value = found.some((i) => i.type === 'error') ? 'error' : 'success'
  lastRun.value = new Date().toLocaleTimeString()
}

function selectNode(nodeId?: string) {
  if (!nodeId) return
  editor.select([nodeId])
}

let unsubscribers: (() => void)[] = []

onMounted(() => {
  runValidation()
  unsubscribers = [
    editor.onEditorEvent('page:changed', runValidation)
  ]
})

onUnmounted(() => {
  unsubscribers.forEach((unsub) => unsub())
})

watch(() => editor.state.currentPageId, runValidation)
</script>

<template>
  <PanelSection label="Smart Validation">
    <button class="validate-btn" @click="runValidation">
      Run Validation
    </button>
    <button class="validate-btn secondary" @click="selectUntagged">
      Select untagged
    </button>

    <div v-if="lastRun" class="last-run">Last run: {{ lastRun }}</div>

    <div v-if="status !== 'idle'" :class="['result-status', status]">
      {{ status === 'success' ? 'PASSED' : 'FAILED' }}
      <span class="counts">({{ issues.filter(i => i.type === 'error').length }} errors, {{ issues.filter(i => i.type === 'warning').length }} warnings)</span>
    </div>

    <div v-if="issues.length > 0" class="issues-list">
      <div
        v-for="(issue, idx) in issues"
        :key="idx"
        :class="['issue', issue.type, { clickable: issue.nodeId }]"
        @click="selectNode(issue.nodeId)"
      >
        <span class="badge">{{ issue.type === 'error' ? 'ERROR' : 'WARN' }}</span>
        <span class="msg">{{ issue.message }}</span>
      </div>
    </div>
    <div v-else-if="status !== 'idle'" class="no-issues">
      No issues found!
    </div>
  </PanelSection>
</template>

<style scoped>
.validate-btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background: var(--accent-color);
  color: white;
  cursor: pointer;
  font-size: 12px;
  margin-bottom: 8px;
}

.validate-btn:hover {
  opacity: 0.9;
}

.validate-btn.secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.last-run {
  font-size: 10px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.result-status {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 12px;
}

.result-status.success {
  color: #22c55e;
}

.result-status.error {
  color: #ef4444;
}

.counts {
  font-weight: 400;
  font-size: 11px;
  color: var(--text-secondary);
}

.issues-list {
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.issue {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  padding: 4px 8px;
  border-radius: 4px;
  line-height: 1.4;
}

.issue.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.issue.warning {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
}

.issue.clickable {
  cursor: pointer;
}

.issue.clickable:hover {
  filter: brightness(0.95);
}

.badge {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  background: currentColor;
  flex-shrink: 0;
  margin-top: 1px;
}

.badge::after {
  content: attr(data-text);
}

.issue.error .badge {
  background: rgba(239, 68, 68, 0.2);
}

.issue.warning .badge {
  background: rgba(234, 179, 8, 0.2);
}

.no-issues {
  font-size: 11px;
  color: #22c55e;
  padding: 8px;
  text-align: center;
}
</style>
