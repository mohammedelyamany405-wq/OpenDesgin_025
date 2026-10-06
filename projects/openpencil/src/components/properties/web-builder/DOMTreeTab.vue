<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useEditorStore } from '@/app/editor/active-store'
import type { SceneNode } from '@open-pencil/scene-graph'
import TreeNodeItem from './TreeNodeItem.vue'

// المفاتيح المطابقة لـ WebBuilderPanel.vue
const PLUGIN_ID = 'open-pencil'
const TAG_KEY = 'web-builder-tag'

interface TreeNode {
  id: string
  name: string
  type: string
  tag: string
  decorative: boolean
  children: TreeNode[]
  isExpanded: boolean
}

interface PageTree {
  id: string
  name: string
  children: TreeNode[]
  isExpanded: boolean
}

const editor = useEditorStore()
const pagesData = ref<PageTree[]>([])
const selectedNodeId = ref<string | null>(null)
const expandedNodes = ref<Set<string>>(new Set())

// قراءة الوسم من pluginData
function getTagFromNode(node: SceneNode): string {
  console.log('🔍 [DOM Tree] getTagFromNode:', node.name, 'pluginData:', node.pluginData)
  
  const entry = node.pluginData.find(
    (e) => e.pluginId === PLUGIN_ID && e.key === TAG_KEY
  )
  if (!entry) {
    console.log('🔍 [DOM Tree] No tag entry found, returning div')
    return 'div'
  }
  console.log('🔍 [DOM Tree] Found tag:', entry.value)
  return entry.value || 'div'
}

function isDecorativeNode(node: SceneNode): boolean {
  return node.pluginData.some(
    (e) => e.pluginId === PLUGIN_ID && e.key === 'web-builder-decorative' && e.value === 'true'
  )
}

// بناء شجرة عنصر بشكل تكراري
function buildNodeTree(nodeId: string): TreeNode[] {
  const children: TreeNode[] = []
  const node = editor.graph.getNode(nodeId)
  if (!node) return children

  for (const childId of node.childIds) {
    const childNode = editor.graph.getNode(childId)
    if (!childNode || childNode.internalOnly) continue

    const treeNode: TreeNode = {
      id: childNode.id,
      name: childNode.name,
      type: childNode.type,
      tag: getTagFromNode(childNode),
      decorative: isDecorativeNode(childNode),
      children: [],
      isExpanded: expandedNodes.value.has(childNode.id)
    }
    
    // بناء الأبناء بشكل تكراري
    if (childNode.childIds.length > 0) {
      treeNode.children = buildNodeTree(childNode.id)
    }
    
    children.push(treeNode)
  }
  return children
}

// بناء الشجرة الكاملة لجميع الصفحات
function rebuildTree() {
  console.log('🔍 [DOM Tree] rebuildTree called')
  
  // 1. الحصول على جميع الصفحات
  const pages = editor.graph.getPages()
  console.log('🔍 [DOM Tree] Pages found:', pages.length)
  
  if (!pages || pages.length === 0) {
    console.log('🔍 [DOM Tree] No pages found, returning empty')
    pagesData.value = []
    return
  }
  
  // 2. لكل صفحة، بناء شجرتها
  const newPagesData: PageTree[] = pages.map(page => {
    console.log('🔍 [DOM Tree] Processing page:', page.name, 'ID:', page.id)
    
    // الحصول على عناصر الصفحة (Layers)
    const pageChildren = editor.graph.getChildren(page.id)
    console.log('🔍 [DOM Tree] Page', page.name, 'Layers:', pageChildren.length)
    
    // بناء شجرة العناصر بشكل تكراري
    const children: TreeNode[] = []
    for (const child of pageChildren) {
      if (child.internalOnly) continue
      
      const treeNode: TreeNode = {
        id: child.id,
        name: child.name,
        type: child.type,
        tag: getTagFromNode(child),
        decorative: isDecorativeNode(child),
        children: [],
        isExpanded: expandedNodes.value.has(child.id)
      }
      
      // بناء الأبناء بشكل تكراري
      if (child.childIds.length > 0) {
        treeNode.children = buildNodeTree(child.id)
        console.log('🔍 [DOM Tree]', child.name, 'Children:', treeNode.children.length)
      }
      
      children.push(treeNode)
    }
    
    console.log('🔍 [DOM Tree] Page', page.name, 'Tree built:', children.length, 'items')
    
    return {
      id: page.id,
      name: page.name,
      children,
      isExpanded: expandedNodes.value.has(page.id)
    }
  })
  
  pagesData.value = newPagesData
  console.log('🔍 [DOM Tree] Total pages:', newPagesData.length)
}

// توسيع/طي العقدة
function toggleNode(nodeId: string) {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
  rebuildTree()
}

// توسيع الكل
function expandAll() {
  function collectIds(parentId: string) {
    const parent = editor.graph.getNode(parentId)
    if (!parent) return
    for (const childId of parent.childIds) {
      expandedNodes.value.add(childId)
      collectIds(childId)
    }
  }
  
  // توسيع جميع الصفحات وأبنائها
  const pages = editor.graph.getPages()
  for (const page of pages) {
    expandedNodes.value.add(page.id)
    collectIds(page.id)
  }
  rebuildTree()
}

// طي الكل
function collapseAll() {
  expandedNodes.value.clear()
  rebuildTree()
}

// تحديد عنصر بالنقر
function selectNode(nodeId: string) {
  selectedNodeId.value = nodeId
  editor.select([nodeId])
}

// الاستماع للأحداث
let unsubscribers: (() => void)[] = []

onMounted(() => {
  console.log('🔍 [DOM Tree] Component mounted')
  console.log('🔍 [DOM Tree] Editor:', editor)
  console.log('🔍 [DOM Tree] Graph:', editor?.graph)
  
  rebuildTree()
  
  // الاستماع للأحداث لتحديث الشجرة
  unsubscribers = [
    editor.onEditorEvent('node:created', rebuildTree),
    editor.onEditorEvent('node:deleted', rebuildTree),
    editor.onEditorEvent('node:reparented', rebuildTree),
    editor.onEditorEvent('node:reordered', rebuildTree),
    editor.onEditorEvent('page:changed', rebuildTree),
    editor.onEditorEvent('selection:changed', (ids) => {
      if (ids.length === 1) {
        selectedNodeId.value = ids[0]
      } else {
        selectedNodeId.value = null
      }
    })
  ]
})

onUnmounted(() => {
  unsubscribers.forEach(unsub => unsub())
})

// مراقبة تغيير الصفحة
watch(() => editor.state.currentPageId, rebuildTree)

</script>

<template>
  <div class="dom-tree-tab">
    <!-- أزرار التحكم -->
    <div class="tree-controls">
      <button class="control-btn" @click="expandAll" title="Expand All">
        <icon-lucide-plus class="size-3" />
      </button>
      <button class="control-btn" @click="collapseAll" title="Collapse All">
        <icon-lucide-minus class="size-3" />
      </button>
      <button class="control-btn" @click="rebuildTree" title="Refresh">
        <icon-lucide-rotate-cw class="size-3" />
      </button>
    </div>

    <!-- الشجرة -->
    <div class="tree-container">
      <div v-if="pagesData.length === 0" class="empty-state">
        <p>No pages found</p>
        <p class="hint">Add pages and elements to see the DOM tree</p>
      </div>
      
      <template v-else>
        <!-- لكل صفحة -->
        <div v-for="page in pagesData" :key="page.id" class="page-node">
          <!-- رأس الصفحة -->
          <div 
            :class="['node-row page-header', { selected: selectedNodeId === page.id }]"
            @click="selectNode(page.id)"
          >
            <button 
              v-if="page.children.length > 0"
              class="expand-btn"
              @click.stop="toggleNode(page.id)"
            >
              <icon-lucide-chevron-right 
                class="size-3 transition-transform"
                :class="{ 'rotate-90': page.isExpanded }"
              />
            </button>
            <span v-else class="expand-spacer"></span>
            
            <icon-lucide-file-text class="node-icon size-3.5" />
            <span class="node-name page-name">{{ page.name }}</span>
          </div>
          
          <!-- عناصر الصفحة بشكل متداخل -->
          <div v-if="page.isExpanded && page.children.length > 0" class="node-children">
            <TreeNodeItem 
              v-for="node in page.children" 
              :key="node.id"
              :node="node"
              :depth="1"
              :selected-id="selectedNodeId"
              @select="selectNode"
              @toggle="toggleNode"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- معلومات التحديد -->
    <div v-if="selectedNodeId" class="selection-info">
      <span class="label">Selected:</span>
      <span class="node-id">{{ selectedNodeId.slice(0, 8) }}...</span>
    </div>
  </div>
</template>

<style scoped>
.dom-tree-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* أزرار التحكم */
.tree-controls {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.control-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* حاوية الشجرة */
.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

/* حالة فارغة */
.empty-state {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  padding: 20px;
}

.empty-state .hint {
  font-size: 10px;
  margin-top: 4px;
  opacity: 0.7;
}

/* عقدة الصفحة */
.page-node {
  margin-bottom: 4px;
}

.page-header {
  font-weight: 500;
}

.page-name {
  font-weight: 600;
  color: var(--text-primary);
}

/* عنصر الشجرة */
.tree-node {
  user-select: none;
}

.node-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 4px;
  transition: background 0.15s;
}

.node-row:hover {
  background: var(--bg-secondary);
}

.node-row.selected {
  background: var(--accent-color);
  color: white;
}

/* زر التوسيع */
.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 2px;
}

.expand-btn:hover {
  background: var(--bg-tertiary);
}

.expand-spacer {
  width: 16px;
  height: 16px;
}

/* أيقونة النوع */
.node-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.node-row.selected .node-icon {
  color: white;
}

/* وسم HTML */
.node-tag {
  font-family: monospace;
  font-size: 10px;
  color: var(--accent-color);
  background: rgba(59, 130, 246, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
}

.node-row.selected .node-tag {
  color: white;
  background: rgba(255, 255, 255, 0.2);
}

/* اسم العنصر */
.node-name {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* الأبناء */
.node-children {
  border-left: 1px dashed var(--border-color);
  margin-left: 8px;
}

/* معلومات التحديد */
.selection-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--border-color);
  font-size: 11px;
  color: var(--text-secondary);
}

.selection-info .label {
  font-weight: 500;
}

.selection-info .node-id {
  font-family: monospace;
  color: var(--accent-color);
}
</style>
