<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useEditorStore } from '@/app/editor/active-store'
import type { SceneNode } from '@open-pencil/scene-graph'

const editor = useEditorStore()

// Reactive state
const pages = ref<SceneNode[]>([])
const currentPageId = ref<string>('')
const editingPageId = ref<string | null>(null)
const editName = ref('')

// قراءة جميع الصفحات
function loadPages() {
  const allPages = editor.graph.getPages()
  pages.value = allPages
  currentPageId.value = editor.state.currentPageId
  
  console.log('📄 [Pages Tab] Loaded pages:', allPages.length)
  allPages.forEach(p => {
    console.log('📄 [Pages Tab] -', p.name, '(ID:', p.id, ')')
  })
}

// تحديد صفحة نشطة
function selectPage(pageId: string) {
  console.log('🔄 [Pages Tab] Switching to page:', pageId)
  editor.switchPage(pageId)
  currentPageId.value = pageId
}

// إضافة صفحة جديدة
function addPage() {
  const newName = `Page ${pages.value.length + 1}`
  console.log('➕ [Pages Tab] Adding page:', newName)
  
  const newPageId = editor.addPage(newName)
  console.log('✅ [Pages Tab] Page added with ID:', newPageId)
  
  loadPages()
}

// حذف صفحة
function deletePage(pageId: string) {
  if (pages.value.length <= 1) {
    console.log('⚠️ [Pages Tab] Cannot delete last page')
    return
  }
  
  const page = pages.value.find(p => p.id === pageId)
  console.log('🗑️ [Pages Tab] Deleting page:', page?.name)
  
  editor.deletePage(pageId)
  loadPages()
}

// بدء إعادة التسمية
function startRename(page: SceneNode) {
  console.log('✏️ [Pages Tab] Start renaming:', page.name)
  editingPageId.value = page.id
  editName.value = page.name
}

// حفظ الاسم الجديد
function savePageName(pageId: string) {
  const newName = editName.value.trim()
  if (!newName) {
    editingPageId.value = null
    return
  }
  
  console.log('✏️ [Pages Tab] Renaming to:', newName)
  editor.renamePage(pageId, newName)
  
  editingPageId.value = null
  loadPages()
}

// إلغاء التعديل
function cancelRename() {
  editingPageId.value = null
}

const BREAKPOINTS_KEY = 'web-builder-breakpoints'
const tabletBp = ref(768)
const mobileBp = ref(375)

function loadBreakpoints() {
  const page = editor.graph.getNode(editor.state.currentPageId)
  if (!page) return
  const entry = page.pluginData.find(
    (e) => e.pluginId === 'open-pencil' && e.key === BREAKPOINTS_KEY
  )
  if (!entry) {
    tabletBp.value = 768
    mobileBp.value = 375
    return
  }
  try {
    const data = JSON.parse(entry.value)
    tabletBp.value = data.tablet || 768
    mobileBp.value = data.mobile || 375
  } catch {
    tabletBp.value = 768
    mobileBp.value = 375
  }
}

function saveBreakpoints() {
  const pageId = editor.state.currentPageId
  const page = editor.graph.getNode(pageId)
  if (!page) return
  const pluginData = page.pluginData.filter(
    (e) => !(e.pluginId === 'open-pencil' && e.key === BREAKPOINTS_KEY)
  )
  pluginData.push({
    pluginId: 'open-pencil',
    key: BREAKPOINTS_KEY,
    value: JSON.stringify({ tablet: tabletBp.value, mobile: mobileBp.value })
  })
  editor.updateNodeWithUndo(pageId, { pluginData }, 'Set breakpoints')
}

// الاستماع للأحداث
let unsubscribers: (() => void)[] = []

onMounted(() => {
  console.log('✅ [Pages Tab] Component loaded')
  loadPages()
  
  unsubscribers = [
    editor.onEditorEvent('page:changed', () => {
      console.log('📄 [Pages Tab] Page changed event')
      loadPages()
      loadBreakpoints()
    }),
    editor.onEditorEvent('node:created', () => loadPages()),
    editor.onEditorEvent('node:deleted', () => loadPages())
  ]
  loadBreakpoints()
})

onUnmounted(() => {
  unsubscribers.forEach(unsub => unsub())
})

// مراقبة تغيير الصفحة
watch(() => editor.state.currentPageId, (newId) => {
  currentPageId.value = newId
  loadBreakpoints()
})
</script>

<template>
  <div class="pages-tab">
    <!-- رأس القسم -->
    <div class="pages-header">
      <span class="section-label">Pages</span>
      <button class="add-btn" @click="addPage" title="Add Page">
        <icon-lucide-plus class="size-3" />
      </button>
    </div>

    <!-- قائمة الصفحات -->
    <div class="pages-list">
      <div v-if="pages.length === 0" class="empty-state">
        <p>No pages found</p>
      </div>
      
      <div
        v-for="page in pages"
        :key="page.id"
        :class="['page-item', { active: page.id === currentPageId }]"
        @click="selectPage(page.id)"
      >
        <!-- أيقونة الصفحة -->
        <icon-lucide-file-text class="page-icon size-3.5" />
        
        <!-- اسم الصفحة (قابل للتعديل) -->
        <input
          v-if="editingPageId === page.id"
          v-model="editName"
          class="page-name-input"
          @blur="savePageName(page.id)"
          @keyup.enter="savePageName(page.id)"
          @keyup.escape="cancelRename"
          @click.stop
          autofocus
        />
        <span
          v-else
          class="page-name"
          @dblclick.stop="startRename(page)"
        >
          {{ page.name }}
        </span>
        
        <!-- أزرار الإجراءات -->
        <div class="page-actions">
          <button
            class="action-btn delete-btn"
            :disabled="pages.length <= 1"
            @click.stop="deletePage(page.id)"
            title="Delete Page"
          >
            <icon-lucide-trash-2 class="size-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- معلومات الصفحة الحالية -->
    <div class="current-page-info">
      <span class="info-label">Current:</span>
      <span class="info-value">{{ pages.find(p => p.id === currentPageId)?.name || 'None' }}</span>
    </div>

    <!-- نقاط التوقف للصفحة الحالية -->
    <div class="breakpoints-info">
      <span class="section-label">Breakpoints (px)</span>
      <div class="bp-row">
        <label>Tablet</label>
        <input
          type="number"
          v-model.number="tabletBp"
          min="320"
          class="bp-input"
          @change="saveBreakpoints"
        />
      </div>
      <div class="bp-row">
        <label>Mobile</label>
        <input
          type="number"
          v-model.number="mobileBp"
          min="320"
          class="bp-input"
          @change="saveBreakpoints"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pages-tab {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

/* رأس القسم */
.pages-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.add-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

/* قائمة الصفحات */
.pages-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  font-size: 11px;
  padding: 16px;
}

/* عنصر الصفحة */
.page-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.page-item:hover {
  background: var(--bg-secondary);
}

.page-item.active {
  background: var(--accent-color);
  color: white;
}

/* أيقونة الصفحة */
.page-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.page-item.active .page-icon {
  color: white;
}

/* اسم الصفحة */
.page-name {
  flex: 1;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-name-input {
  flex: 1;
  font-size: 12px;
  padding: 2px 4px;
  border: 1px solid var(--accent-color);
  border-radius: 3px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
}

/* أزرار الإجراءات */
.page-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.page-item:hover .page-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* معلومات الصفحة الحالية */
.current-page-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-top: 1px solid var(--border-color);
  font-size: 11px;
  color: var(--text-secondary);
}

.info-label {
  font-weight: 500;
}

.info-value {
  color: var(--accent-color);
  font-weight: 600;
}

/* نقاط التوقف */
.breakpoints-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 8px;
  border-top: 1px solid var(--border-color);
}

.bp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-secondary);
}

.bp-input {
  width: 80px;
  font-size: 11px;
  padding: 2px 6px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
}
</style>
