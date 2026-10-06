<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useEditorStore } from '@/app/editor/active-store'
import type { SceneNode } from '@open-pencil/scene-graph'

import PanelSection from '@/components/ui/panel/PanelSection.vue'

const PLUGIN_ID = 'open-pencil'
const TAG_KEY = 'web-builder-tag'
const LAYOUT_KEY = 'web-builder-layout'

interface Issue {
  type: 'error' | 'warning'
  message: string
  nodeId?: string
  nodeName?: string
}

const editor = useEditorStore()
const issues = ref<Issue[]>([])
const status = ref<'idle' | 'success' | 'error'>('idle')
const lastRun = ref('')

function getTag(node: SceneNode): string {
  const entry = node.pluginData.find(
    (e) => e.pluginId === PLUGIN_ID && e.key === TAG_KEY
  )
  return entry?.value || 'div'
}

function isDecorative(node: SceneNode): boolean {
  return node.pluginData.some(
    (e) => e.pluginId === PLUGIN_ID && e.key === 'web-builder-decorative' && e.value === 'true'
  )
}

function selectUntagged() {
  const pageId = editor.state.currentPageId
  if (!pageId) return
  const ids = collectAllNodes(pageId)
    .filter((n) => !isDecorative(n) && getTag(n) === 'div' && n.childIds.length === 0)
    .map((n) => n.id)
  if (ids.length > 0) editor.select(ids)
}

function getLayoutType(node: SceneNode): string {
  const entry = node.pluginData.find(
    (e) => e.pluginId === PLUGIN_ID && e.key === LAYOUT_KEY
  )
  if (!entry) return 'none'
  try {
    const data = JSON.parse(entry.value)
    return data.type || 'none'
  } catch {
    return 'none'
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

function runValidation() {
  const found: Issue[] = []
  const pageId = editor.state.currentPageId
  if (!pageId) {
    issues.value = [{ type: 'error', message: 'No active page' }]
    status.value = 'error'
    return
  }

  const nodes = collectAllNodes(pageId)
  if (nodes.length === 0) {
    issues.value = [{ type: 'warning', message: 'Page is empty — nothing to validate' }]
    status.value = 'success'
    lastRun.value = new Date().toLocaleTimeString()
    return
  }

  const tags = nodes.map(getTag)

  // 1. Essential semantic tags
  for (const essential of ['header', 'main', 'footer']) {
    if (!tags.includes(essential)) {
      found.push({ type: 'error', message: `Missing essential tag: <${essential}>` })
    }
  }

  // 2. Only one h1 per page
  const h1Count = tags.filter((t) => t === 'h1').length
  if (h1Count > 1) {
    found.push({ type: 'error', message: `Multiple <h1> tags found (${h1Count}) — keep only one per page` })
  }

  // 3. Per-node checks (decorative nodes are skipped entirely)
  const defaultNames = /^(rectangle|ellipse|frame|group|text)/i
  for (const node of nodes) {
    if (isDecorative(node)) continue
    const tag = getTag(node)
    const layout = getLayoutType(node)
    const hasChildren = node.childIds.length > 0

    // Untagged leaf
    if (tag === 'div' && !hasChildren) {
      found.push({
        type: 'warning',
        message: `Element "${node.name}" has no specific tag (defaults to <div>)`,
        nodeId: node.id,
        nodeName: node.name
      })
    }

    // Container without declared layout
    if (hasChildren && layout === 'none' && ['div', 'section', 'main', 'header', 'footer', 'nav', 'article', 'aside'].includes(tag)) {
      found.push({
        type: 'warning',
        message: `Container "${node.name}" <${tag}> has children but no Flex/Grid declared`,
        nodeId: node.id,
        nodeName: node.name
      })
    }

    // img cannot have children
    if (tag === 'img' && hasChildren) {
      found.push({
        type: 'error',
        message: `Element "${node.name}" is <img> but has children — <img> must be a leaf`,
        nodeId: node.id,
        nodeName: node.name
      })
    }

    // Interactive elements should be renamed
    if ((tag === 'button' || tag === 'a') && defaultNames.test(node.name)) {
      found.push({
        type: 'warning',
        message: `Element <${tag}> still has default name "${node.name}" — rename it for clarity`,
        nodeId: node.id,
        nodeName: node.name
      })
    }

    // img without src
    if (tag === 'img' && !hasChildren) {
      const entry = node.pluginData.find(
        (e) => e.pluginId === PLUGIN_ID && e.key === 'web-builder-attrs'
      )
      let src = ''
      try {
        src = entry ? String(JSON.parse(entry.value).src || '') : ''
      } catch { src = '' }
      const hasImageFill = node.fills.some((f: any) => f.type === 'IMAGE')
      if (!src && !hasImageFill) {
        found.push({
          type: 'warning',
          message: `Image "${node.name}" has no src — pick a file or URL in Tags tab`,
          nodeId: node.id,
          nodeName: node.name
        })
      }
    }
  }

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
