<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSelectionState } from '@open-pencil/vue'
import { useEditorStore } from '@/app/editor/active-store'

import PanelSection from '@/components/ui/panel/PanelSection.vue'
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

// CSS Classes catalog
const classCategories = [
  { category: 'Layout', items: [
    { name: 'container', css: 'max-width: 1200px; margin: 0 auto; padding: 0 20px' },
    { name: 'flex-center', css: 'display: flex; justify-content: center; align-items: center' },
    { name: 'grid-2', css: 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px' },
    { name: 'grid-3', css: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px' }
  ]},
  { category: 'Text', items: [
    { name: 'heading-1', css: 'font-size: 32px; font-weight: bold; line-height: 1.2' },
    { name: 'heading-2', css: 'font-size: 24px; font-weight: bold; line-height: 1.3' },
    { name: 'body-text', css: 'font-size: 16px; line-height: 1.6' },
    { name: 'small-text', css: 'font-size: 14px; color: #666' }
  ]},
  { category: 'Spacing', items: [
    { name: 'p-1', css: 'padding: 8px' },
    { name: 'p-2', css: 'padding: 16px' },
    { name: 'p-3', css: 'padding: 24px' },
    { name: 'm-1', css: 'margin: 8px' },
    { name: 'm-2', css: 'margin: 16px' }
  ]},
  { category: 'Colors', items: [
    { name: 'bg-primary', css: 'background-color: #3b82f6' },
    { name: 'bg-secondary', css: 'background-color: #6b7280' },
    { name: 'text-white', css: 'color: #ffffff' },
    { name: 'text-dark', css: 'color: #1f2937' }
  ]},
  { category: 'Effects', items: [
    { name: 'shadow-sm', css: 'box-shadow: 0 1px 2px rgba(0,0,0,0.05)' },
    { name: 'shadow-md', css: 'box-shadow: 0 4px 6px rgba(0,0,0,0.1)' },
    { name: 'rounded', css: 'border-radius: 8px' },
    { name: 'rounded-full', css: 'border-radius: 9999px' }
  ]}
]

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

function escapeAttrValue(value: string): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function attrsToString(attrs: Record<string, any>): string {
  const parts: string[] = []
  for (const [name, value] of Object.entries(attrs)) {
    if (value === '' || value === null || value === undefined || value === false) continue
    if (value === true) {
      parts.push(name)
    } else {
      parts.push(`${name}="${escapeAttrValue(String(value))}"`)
    }
  }
  return parts.length > 0 ? ' ' + parts.join(' ') : ''
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
    if (!n) return null

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

// Export gate: critical errors block export (same rules as ValidateTab)
function collectCriticalErrors(tree: any): string[] {
  const errors: string[] = []
  const allNodes: any[] = []
  function collect(node: any) {
    allNodes.push(node)
    node.children?.forEach(collect)
  }
  tree.children?.forEach(collect)

  const tags = allNodes.map((n) => n.tag || 'div')
  for (const essential of ['header', 'main', 'footer']) {
    if (!tags.includes(essential)) {
      errors.push(`Missing essential tag: <${essential}>`)
    }
  }
  const h1Count = tags.filter((t) => t === 'h1').length
  if (h1Count > 1) {
    errors.push(`Multiple <h1> tags found (${h1Count}) — keep only one per page`)
  }
  for (const n of allNodes) {
    if ((n.tag || 'div') === 'img' && n.children?.length > 0) {
      errors.push(`Element "${n.name}" is <img> but has children`)
    }
  }
  return errors
}

function cssForClass(className: string): string {
  for (const cat of classCategories) {
    const found = cat.items.find((i) => i.name === className)
    if (found) return found.css
  }
  return ''
}

function sanitizeId(id: string): string {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '-')
}

function cssForLayout(layout: any): string[] {
  if (!layout || (layout.type !== 'flex' && layout.type !== 'grid')) return []
  const rules: string[] = []
  if (layout.type === 'flex') {
    rules.push('display: flex;')
    rules.push(`flex-direction: ${layout.direction || 'row'};`)
    if (layout.justifyContent && layout.justifyContent !== 'flex-start')
      rules.push(`justify-content: ${layout.justifyContent};`)
    if (layout.alignItems && layout.alignItems !== 'stretch')
      rules.push(`align-items: ${layout.alignItems};`)
    if (layout.gap && layout.gap !== '0px') rules.push(`gap: ${layout.gap};`)
    if (layout.flexWrap) rules.push('flex-wrap: wrap;')
  } else {
    rules.push('display: grid;')
    if (layout.gridTemplateColumns)
      rules.push(`grid-template-columns: ${layout.gridTemplateColumns};`)
    if (layout.gridTemplateRows)
      rules.push(`grid-template-rows: ${layout.gridTemplateRows};`)
    if (layout.gap && layout.gap !== '0px') rules.push(`gap: ${layout.gap};`)
  }
  return rules
}

function collectWarnings(tree: any): string[] {
  const warnings: string[] = []
  const defaultNames = /^(rectangle|ellipse|frame|group|text)/i
  function check(node: any) {
    if (!node.decorative) {
      const tag = node.tag || 'div'
      const hasChildren = node.children?.length > 0
      if (tag === 'div' && !hasChildren) {
        warnings.push(`Element "${node.name}" has no specific tag`)
      }
      if (
        hasChildren &&
        (!node.layout || node.layout.type === 'none') &&
        ['div', 'section', 'main', 'header', 'footer', 'nav', 'article', 'aside'].includes(tag)
      ) {
        warnings.push(`Container "${node.name}" has children but no Flex/Grid declared`)
      }
      if ((tag === 'button' || tag === 'a') && defaultNames.test(node.name)) {
        warnings.push(`Element <${tag}> still has default name "${node.name}"`)
      }
      if (tag === 'img' && !node.attrs?.src) {
        warnings.push(`Image "${node.name}" has no src — pick a file or URL in Tags tab`)
      }
    }
    node.children?.forEach(check)
  }
  tree.children?.forEach(check)
  return warnings
}

// Export
function generateExport() {
  const tree = domTreeData.value
  if (!tree) {
    exportStatus.value = 'No data to export'
    return
  }

  const critical = collectCriticalErrors(tree)
  if (critical.length > 0) {
    exportHtml.value = ''
    exportConfirmed.value = false
    pendingWarnings.value = []
    exportStatus.value = `Export blocked: ${critical.length} critical error(s). Fix them in Validate tab. (${critical[0]})`
    return
  }

  if (!exportConfirmed.value) {
    const warnings = collectWarnings(tree)
    if (warnings.length > 0) {
      pendingWarnings.value = warnings
      exportStatus.value = `${warnings.length} warning(s) found. Proceed or fix them first.`
      return
    }
  }
  pendingWarnings.value = []
  exportConfirmed.value = false

  const usedClasses = new Map<string, string>()
  const layoutRules: string[] = []
  const tabletRules: string[] = []
  const mobileRules: string[] = []
  const bp = tree.breakpoints || { tablet: 768, mobile: 375 }

  function nodeToHtml(node: any, indent: number = 0): string {
    const spaces = '  '.repeat(indent)
    const decorative = !!node.decorative
    const tag = decorative ? 'div' : node.tag || 'div'
    const aria = decorative ? ' aria-hidden="true"' : ''
    const extraAttrs = decorative ? '' : attrsToString(node.attrs || {})

    const cls: string[] = [...(node.classes || [])]
    for (const c of node.classes || []) {
      if (!usedClasses.has(c)) {
        const css = cssForClass(c)
        if (css) usedClasses.set(c, css)
      }
    }

    const rules = cssForLayout(node.layout)
    if (rules.length > 0) {
      const wbClass = `wb-${sanitizeId(node.id)}`
      cls.push(wbClass)
      layoutRules.push(`.${wbClass} { ${rules.join(' ')} }`)
      if (node.layout.tabletDirection && node.layout.tabletDirection !== 'inherit') {
        tabletRules.push(`.${wbClass} { flex-direction: ${node.layout.tabletDirection}; }`)
      }
      if (node.layout.mobileDirection && node.layout.mobileDirection !== 'inherit') {
        mobileRules.push(`.${wbClass} { flex-direction: ${node.layout.mobileDirection}; }`)
      }
    }

    const classAttr = cls.length > 0 ? ` class="${cls.join(' ')}"` : ''

    if (node.children?.length > 0) {
      const childrenHtml = node.children.map((c: any) => nodeToHtml(c, indent + 1)).join('\n')
      return `${spaces}<${tag}${classAttr}${aria}${extraAttrs}>\n${childrenHtml}\n${spaces}</${tag}>`
    } else {
      return `${spaces}<${tag}${classAttr}${aria}${extraAttrs}></${tag}>`
    }
  }

  let body = ''
  tree.children?.forEach((child: any) => {
    body += nodeToHtml(child, 1) + '\n'
  })

  let css = ''
  usedClasses.forEach((def, name) => {
    css += `.${name} { ${def} }\n`
  })
  if (layoutRules.length > 0) css += layoutRules.join('\n') + '\n'
  if (tabletRules.length > 0) {
    css += `@media (max-width: ${bp.tablet}px) {\n  ${tabletRules.join('\n  ')}\n}\n`
  }
  if (mobileRules.length > 0) {
    css += `@media (max-width: ${bp.mobile}px) {\n  ${mobileRules.join('\n  ')}\n}\n`
  }

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
