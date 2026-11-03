<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSelectionState } from '@open-pencil/vue'
import { useEditorStore } from '@/app/editor/active-store'

import PanelSection from '@/components/ui/panel/PanelSection.vue'
import {
  CLASS_CATEGORIES,
  escapeAttrValue,
  renderExport
} from '@/app/web-builder/html-render'
import { collectCriticalErrors, collectWarnings } from '@/app/web-builder/validate'
import DOMTreeTab from './DOMTreeTab.vue'
import PagesTab from './PagesTab.vue'
import LayoutTab from './LayoutTab.vue'
import ValidateTab from './ValidateTab.vue'
import TagsTab from './TagsTab.vue'

// State
const activeTab = ref('tags')
const classes = ref<any>({})
const layouts = ref<any>({})
const exportHtml = ref('')
const exportStatus = ref('')
const exportConfirmed = ref(false)
const pendingWarnings = ref<string[]>([])

const DECORATIVE_KEY = 'web-builder-decorative'
const BREAKPOINTS_KEY = 'web-builder-breakpoints'
const PAGE_KEY = 'web-builder-page'

const pageTitle = ref('Exported Page')
const pageLang = ref('en')
const pageDescription = ref('')

function loadPageSettings() {
  const page = editor.graph.getNode(editor.state.currentPageId)
  if (!page) return
  const entry = page.pluginData?.find(
    (e: any) => e.pluginId === 'open-pencil' && e.key === PAGE_KEY
  )
  if (!entry) {
    pageTitle.value = page.name || 'Exported Page'
    pageLang.value = 'en'
    pageDescription.value = ''
    return
  }
  try {
    const data = JSON.parse(entry.value)
    pageTitle.value = data.title || page.name || 'Exported Page'
    pageLang.value = data.lang || 'en'
    pageDescription.value = data.description || ''
  } catch {
    pageTitle.value = page.name || 'Exported Page'
  }
}

function savePageSettings() {
  const pageId = editor.state.currentPageId
  const page = editor.graph.getNode(pageId)
  if (!page) return
  const pluginData = page.pluginData.filter(
    (e: any) => !(e.pluginId === 'open-pencil' && e.key === PAGE_KEY)
  )
  pluginData.push({
    pluginId: 'open-pencil',
    key: PAGE_KEY,
    value: JSON.stringify({
      title: pageTitle.value,
      lang: pageLang.value,
      description: pageDescription.value
    })
  })
  editor.updateNodeWithUndo(pageId, { pluginData }, 'Set page settings')
}

const { selectedNode: node } = useSelectionState()
const editor = useEditorStore()

// Tabs
const tabs = [
  { id: 'tags', label: 'Tags', icon: 'icon-lucide-tag' },
  { id: 'tree', label: 'DOM Tree', icon: 'icon-lucide-network' },
  { id: 'pages', label: 'Pages', icon: 'icon-lucide-file-text' },
  { id: 'classes', label: 'Classes', icon: 'icon-lucide-palette' },
  { id: 'layout', label: 'Layout', icon: 'icon-lucide-layout-dashboard' },
  { id: 'validate', label: 'Validate', icon: 'icon-lucide-check-circle' },
  { id: 'export', label: 'Export', icon: 'icon-lucide-external-link' }
]

// CSS Classes catalog (shared with the export renderer)
const classCategories = CLASS_CATEGORIES

// Load data from pluginData
function loadPluginData() {
  const n = node.value
  if (!n) return
  
  // Load classes
  const classEntry = n.pluginData.find(
    (e: any) => e.pluginId === 'open-pencil' && e.key === 'web-builder-classes'
  )
  if (classEntry) {
    try {
      classes.value[n.id] = JSON.parse(classEntry.value)
    } catch {
      classes.value[n.id] = []
    }
  } else {
    classes.value[n.id] = []
  }
  
  // Load layout
  const layoutEntry = n.pluginData.find(
    (e: any) => e.pluginId === 'open-pencil' && e.key === 'web-builder-layout'
  )
  if (layoutEntry) {
    try {
      layouts.value[n.id] = JSON.parse(layoutEntry.value)
    } catch {
      layouts.value[n.id] = null
    }
  } else {
    layouts.value[n.id] = null
  }

}

// Save to pluginData
function savePluginData(key: string, data: any) {
  const n = node.value
  if (!n) return
  
  const pluginData = n.pluginData.filter(
    (e: any) => !(e.pluginId === 'open-pencil' && e.key === key)
  )
  pluginData.push({ 
    pluginId: 'open-pencil', 
    key: key, 
    value: typeof data === 'string' ? data : JSON.stringify(data)
  })
  editor.updateNodeWithUndo(n.id, { pluginData }, `Set ${key}`)
}

// Classes functions
const currentNodeClasses = computed(() => {
  if (!node.value) return []
  return classes.value[node.value.id] || []
})

function toggleClass(className: string) {
  if (!node.value) return
  const current = currentNodeClasses.value
  const index = current.indexOf(className)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(className)
  }
  classes.value[node.value.id] = [...current]
  savePluginData('web-builder-classes', current)
}

function readNodeMeta(n: any): { tag: string; classes: string[]; layout: any; decorative: boolean; attrs: Record<string, any> } {
  const tagEntry = n.pluginData?.find(
    (e: any) => e.pluginId === 'open-pencil' && e.key === 'web-builder-tag'
  )
  const classEntry = n.pluginData?.find(
    (e: any) => e.pluginId === 'open-pencil' && e.key === 'web-builder-classes'
  )
  const layoutEntry = n.pluginData?.find(
    (e: any) => e.pluginId === 'open-pencil' && e.key === 'web-builder-layout'
  )
  const decEntry = n.pluginData?.find(
    (e: any) => e.pluginId === 'open-pencil' && e.key === DECORATIVE_KEY
  )
  let cls: string[] = []
  try {
    if (classEntry) {
      const parsed = JSON.parse(classEntry.value)
      if (Array.isArray(parsed)) cls = parsed
    }
  } catch { cls = [] }
  let layout: any = null
  try {
    if (layoutEntry) layout = JSON.parse(layoutEntry.value)
  } catch { layout = null }
  const attrsEntry = n.pluginData?.find(
    (e: any) => e.pluginId === 'open-pencil' && e.key === 'web-builder-attrs'
  )
  let attrs: Record<string, any> = {}
  try {
    if (attrsEntry) {
      const parsed = JSON.parse(attrsEntry.value)
      if (parsed && typeof parsed === 'object') attrs = parsed
    }
  } catch { attrs = {} }
  return {
    tag: tagEntry?.value || 'div',
    classes: cls,
    layout,
    decorative: decEntry?.value === 'true',
    attrs
  }
}

function readPageBreakpoints(page: any): { tablet: number; mobile: number } {
  const entry = page.pluginData?.find(
    (e: any) => e.pluginId === 'open-pencil' && e.key === BREAKPOINTS_KEY
  )
  if (!entry) return { tablet: 768, mobile: 375 }
  try {
    const data = JSON.parse(entry.value)
    return { tablet: data.tablet || 768, mobile: data.mobile || 375 }
  } catch {
    return { tablet: 768, mobile: 375 }
  }
}

// DOM Tree - build from editor graph (fresh pluginData for every node)
const domTreeData = computed(() => {
  if (!editor?.graph) return null

  function buildNode(id: string): any {
    const n = editor.graph.getNode(id)
    if (!n || n.internalOnly) return null

    const meta = readNodeMeta(n)

    // Get children using graph.getChildren()
    const children = editor.graph.getChildren(id)

    return {
      id: n.id,
      name: n.name,
      type: n.type,
      tag: meta.tag,
      classes: meta.classes,
      layout: meta.layout,
      decorative: meta.decorative,
      attrs: meta.attrs,
      text: n.type === 'TEXT' ? n.text : '',
      hasImageFill: n.fills?.some((f: { type: string }) => f.type === 'IMAGE') ?? false,
      children: children.map((child: any) => buildNode(child.id)).filter(Boolean) || []
    }
  }

  // Get current page
  const pageId = editor.state.currentPageId
  const page = editor.graph.getNode(pageId)
  if (!page) return null

  // Get page children
  const pageChildren = editor.graph.getChildren(pageId)

  return {
    name: page.name,
    breakpoints: readPageBreakpoints(page),
    children: pageChildren.map((child: any) => buildNode(child.id)).filter(Boolean) || []
  }
})

// Export
function generateExport() {
  const tree = domTreeData.value
  if (!tree) {
    exportStatus.value = 'No data to export'
    return
  }

  const critical = collectCriticalErrors(tree.children || [])
  if (critical.length > 0) {
    exportHtml.value = ''
    exportConfirmed.value = false
    pendingWarnings.value = []
    exportStatus.value = `Export blocked: ${critical.length} critical error(s). Fix them in Validate tab. (${critical[0]})`
    return
  }

  if (!exportConfirmed.value) {
    const warnings = collectWarnings(tree.children || [])
    if (warnings.length > 0) {
      pendingWarnings.value = warnings
      exportStatus.value = `${warnings.length} warning(s) found. Proceed or fix them first.`
      return
    }
  }
  pendingWarnings.value = []
  exportConfirmed.value = false

  const { body, css } = renderExport(tree.children || [], tree.breakpoints)

  loadPageSettings()
  const escTitle = escapeAttrValue(pageTitle.value || 'Exported Page')
  const escLang = escapeAttrValue(pageLang.value || 'en')
  const escDesc = escapeAttrValue(pageDescription.value || '')

  let html = `<!DOCTYPE html>\n<html lang="${escLang}">\n<head>\n`
  html += '  <meta charset="UTF-8">\n'
  html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
  if (escDesc) html += `  <meta name="description" content="${escDesc}">\n`
  html += `  <title>${escTitle}</title>\n`
  if (css) html += `  <style>\n${css}  </style>\n`
  html += '</head>\n<body>\n'
  html += body
  html += '</body>\n</html>'

  exportHtml.value = html
  exportStatus.value = 'HTML generated!'
}

function proceedWithWarnings() {
  exportConfirmed.value = true
  generateExport()
}

// Copy to clipboard
function copyToClipboard() {
  navigator.clipboard.writeText(exportHtml.value)
  exportStatus.value = 'Copied to clipboard!'
}

onMounted(() => {
  loadPluginData()
  loadPageSettings()
})

watch(node, () => {
  loadPluginData()
})

watch(activeTab, (tab) => {
  if (tab === 'export') loadPageSettings()
})
</script>

<template>
  <div class="web-builder-panel">
    <!-- Tab Navigation -->
    <div class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
        :title="tab.label"
      >
        <component :is="tab.icon" class="tab-icon size-3" />
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    
    <!-- Tab Content -->
    <div class="tab-content">
      
      <!-- ==================== TAGS TAB ==================== -->
      <div v-if="activeTab === 'tags'" class="tab-panel">
        <TagsTab />
      </div>
      
      <!-- ==================== DOM TREE TAB ==================== -->
      <div v-if="activeTab === 'tree'" class="tab-panel">
        <DOMTreeTab />
      </div>
      
      <!-- ==================== PAGES TAB ==================== -->
      <div v-if="activeTab === 'pages'" class="tab-panel">
        <PagesTab />
      </div>
      
      <!-- ==================== CLASSES TAB ==================== -->
      <div v-if="activeTab === 'classes'" class="tab-panel">
        <PanelSection label="CSS Classes">
          <div v-if="currentNodeClasses.length > 0" class="applied-classes">
            <div class="section-label">Applied:</div>
            <div class="class-tags">
              <span v-for="cls in currentNodeClasses" :key="cls" class="class-tag">
                {{ cls }}
                <button class="remove-btn" @click="toggleClass(cls)">×</button>
              </span>
            </div>
          </div>
          
          <div class="class-categories">
            <div v-for="cat in classCategories" :key="cat.category" class="class-group">
              <div class="group-label">{{ cat.category }}</div>
              <div class="class-items">
                <button
                  v-for="item in cat.items"
                  :key="item.name"
                  :class="['class-btn', { active: currentNodeClasses.includes(item.name) }]"
                  @click="toggleClass(item.name)"
                  :title="item.css"
                >
                  {{ item.name }}
                </button>
              </div>
            </div>
          </div>
        </PanelSection>
      </div>
      
      <!-- ==================== LAYOUT TAB ==================== -->
      <div v-if="activeTab === 'layout'" class="tab-panel">
        <LayoutTab />
      </div>
      
      <!-- ==================== VALIDATE TAB ==================== -->
      <div v-if="activeTab === 'validate'" class="tab-panel">
        <ValidateTab />
      </div>
      
      <!-- ==================== EXPORT TAB ==================== -->
      <div v-if="activeTab === 'export'" class="tab-panel">
        <PanelSection label="Page Settings">
          <div class="page-settings">
            <div class="ps-row">
              <label>Title</label>
              <input v-model="pageTitle" class="attr-input" type="text" @change="savePageSettings" />
            </div>
            <div class="ps-row">
              <label>Lang</label>
              <input v-model="pageLang" class="attr-input" type="text" @change="savePageSettings" />
            </div>
            <div class="ps-row">
              <label>Description</label>
              <input v-model="pageDescription" class="attr-input" type="text" placeholder="Meta description" @change="savePageSettings" />
            </div>
          </div>
        </PanelSection>
        <PanelSection label="Export HTML/CSS">
          <button class="export-btn" @click="generateExport">
            Generate HTML
          </button>
          
          <div v-if="exportStatus" class="export-status">
            {{ exportStatus }}
            <button
              v-if="exportStatus.startsWith('Export blocked')"
              class="copy-btn"
              @click="activeTab = 'validate'"
            >
              Go to Validate
            </button>
          </div>

          <div v-if="pendingWarnings.length > 0" class="warnings-box">
            <div class="section-label">Warnings ({{ pendingWarnings.length }}):</div>
            <div v-for="(w, idx) in pendingWarnings.slice(0, 8)" :key="idx" class="issue warning">
              {{ w }}
            </div>
            <div v-if="pendingWarnings.length > 8" class="issue warning">
              ...and {{ pendingWarnings.length - 8 }} more
            </div>
            <div class="warnings-actions">
              <button class="copy-btn" @click="proceedWithWarnings">Proceed anyway</button>
              <button class="copy-btn" @click="activeTab = 'validate'">Fix first</button>
            </div>
          </div>
          
          <div v-if="exportHtml" class="export-preview">
            <div class="preview-header">
              <span>HTML Output</span>
              <button class="copy-btn" @click="copyToClipboard">Copy</button>
            </div>
            <pre class="code-preview">{{ exportHtml }}</pre>
          </div>
        </PanelSection>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.web-builder-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Tab Navigation */
.tab-nav {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  padding: 4px 8px;
  gap: 2px;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s;
  border-radius: 4px;
  min-width: 40px;
}

.tab-btn:hover {
  opacity: 0.8;
  background: var(--bg-secondary);
}

.tab-btn.active {
  opacity: 1;
  background: var(--bg-secondary);
  color: var(--accent-color);
}

.tab-icon {
  font-size: 14px;
}

.tab-label {
  font-size: 9px;
  margin-top: 2px;
  white-space: nowrap;
}

/* Tab Content */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.tab-panel {
  min-height: 150px;
}

/* Current Tag Display */
.current-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  margin-bottom: 12px;
}

.tag-name {
  font-weight: 600;
}

.tag-tag {
  color: var(--accent-color);
  font-family: monospace;
}

.tag-ar {
  color: var(--text-secondary);
  font-size: 11px;
}

.decorative-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-secondary);
  padding: 6px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  margin-bottom: 12px;
  cursor: pointer;
}

/* Tag Groups */
.tag-group {
  margin-bottom: 12px;
}

.group-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.group-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-btn, .class-btn, .layout-btn {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.tag-btn:hover, .class-btn:hover, .layout-btn:hover {
  background: var(--bg-tertiary);
}

.tag-btn.active, .class-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

/* Tree View */
.tree-view {
  font-family: monospace;
  font-size: 12px;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
}

.node-icon {
  font-size: 12px;
}

.node-name {
  font-weight: 500;
}

.node-tag {
  color: var(--text-secondary);
  font-size: 10px;
}

/* Classes */
.applied-classes {
  margin-bottom: 12px;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.section-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.class-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.class-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--accent-color);
  color: white;
  border-radius: 12px;
  font-size: 11px;
}

.remove-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  line-height: 1;
}

/* Layout */
.current-layout {
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  margin-bottom: 12px;
}

.layout-type {
  font-weight: 600;
  text-transform: capitalize;
  margin-bottom: 4px;
}

.layout-props {
  font-size: 11px;
  color: var(--text-secondary);
}

.layout-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* Validation */
.validate-btn, .export-btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background: var(--accent-color);
  color: white;
  cursor: pointer;
  font-size: 12px;
  margin-bottom: 12px;
}

.validate-btn:hover, .export-btn:hover {
  opacity: 0.9;
}

.validation-result {
  padding: 8px;
  border-radius: 4px;
}

.result-status {
  font-weight: 600;
  margin-bottom: 8px;
}

.result-status.success {
  color: #22c55e;
}

.result-status.error {
  color: #ef4444;
}

.issues-list {
  font-size: 11px;
}

.issue {
  padding: 4px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
}

.issue.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.issue.warning {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
}

.warnings-box {
  margin-top: 8px;
  padding: 8px;
  border: 1px solid rgba(234, 179, 8, 0.4);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.warnings-actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.page-settings {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 4px;
}

.ps-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-secondary);
}

.ps-row label {
  width: 70px;
  flex-shrink: 0;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 10px;
}

.ps-row .attr-input {
  flex: 1;
  font-size: 12px;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
}

/* Export */
.export-status {
  font-size: 11px;
  color: #22c55e;
  margin-bottom: 8px;
}

.export-preview {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: var(--bg-secondary);
  font-size: 11px;
  font-weight: 600;
}

.copy-btn {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  cursor: pointer;
  font-size: 10px;
}

.copy-btn:hover {
  background: var(--bg-secondary);
}

.code-preview {
  padding: 8px;
  margin: 0;
  font-size: 10px;
  font-family: monospace;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  background: var(--bg-primary);
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  padding: 20px;
}
</style>
