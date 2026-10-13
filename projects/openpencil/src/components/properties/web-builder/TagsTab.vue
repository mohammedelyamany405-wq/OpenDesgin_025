<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSelectionState } from '@open-pencil/vue'
import { useEditorStore } from '@/app/editor/active-store'

import PanelSection from '@/components/ui/panel/PanelSection.vue'
import {
  AVAILABLE_TAGS,
  GLOBAL_ATTRS,
  TAG_ATTRS,
  ATTRS_KEY,
  TAG_KEY,
  DECORATIVE_KEY,
  PAGE_LINK_KEY,
  PLUGIN_ID,
  MAX_INLINE_IMAGE_BYTES,
  type AttrField
} from '@/app/web-builder/tag-attrs'

const editor = useEditorStore()
const { selectedNode: node } = useSelectionState()

const selectedTag = ref('')
const baseName = ref('')
const isDecorative = ref(false)
const attrs = ref<Record<string, any>>({})
const pageLink = ref('')
const fileError = ref('')
const fileInfo = ref('')

function savePluginData(key: string, data: any) {
  const n = node.value
  if (!n) return
  const pluginData = n.pluginData.filter(
    (e: any) => !(e.pluginId === PLUGIN_ID && e.key === key)
  )
  pluginData.push({
    pluginId: PLUGIN_ID,
    key,
    value: typeof data === 'string' ? data : JSON.stringify(data)
  })
  editor.updateNodeWithUndo(n.id, { pluginData }, `Set ${key}`)
}

function renameNode(name: string) {
  const n = node.value
  if (!n) return
  const trimmed = name.trim()
  if (!trimmed || trimmed === n.name) return
  editor.updateNodeWithUndo(n.id, { name: trimmed }, 'Rename element')
}

function load() {
  const n = node.value
  if (!n) {
    selectedTag.value = ''
    baseName.value = ''
    isDecorative.value = false
    attrs.value = {}
    pageLink.value = ''
    fileInfo.value = ''
    return
  }
  const tagEntry = n.pluginData.find(
    (e: any) => e.pluginId === PLUGIN_ID && e.key === TAG_KEY
  )
  selectedTag.value = tagEntry?.value || ''

  const decEntry = n.pluginData.find(
    (e: any) => e.pluginId === PLUGIN_ID && e.key === DECORATIVE_KEY
  )
  isDecorative.value = decEntry?.value === 'true'

  const attrsEntry = n.pluginData.find(
    (e: any) => e.pluginId === PLUGIN_ID && e.key === ATTRS_KEY
  )
  try {
    attrs.value = attrsEntry ? JSON.parse(attrsEntry.value) : {}
    if (typeof attrs.value !== 'object' || attrs.value === null) attrs.value = {}
  } catch {
    attrs.value = {}
  }

  const linkEntry = n.pluginData.find(
    (e: any) => e.pluginId === PLUGIN_ID && e.key === PAGE_LINK_KEY
  )
  pageLink.value = linkEntry?.value || ''

  // Base name = layer name without the trailing "-tag" suffix
  if (selectedTag.value && n.name.endsWith(`-${selectedTag.value}`)) {
    baseName.value = n.name.slice(0, -(selectedTag.value.length + 1))
  } else {
    baseName.value = n.name
  }
  fileInfo.value = ''
  fileError.value = ''
}

function layerName(base: string, tag: string): string {
  const b = base.trim()
  if (!b) return ''
  return tag ? `${b}-${tag}` : b
}

function setTag(tag: string) {
  selectedTag.value = tag
  savePluginData(TAG_KEY, tag)
  if (baseName.value.trim()) renameNode(layerName(baseName.value, tag))
}

function applyName() {
  const target = layerName(baseName.value, selectedTag.value)
  if (target) renameNode(target)
}

function toggleDecorative() {
  isDecorative.value = !isDecorative.value
  savePluginData(DECORATIVE_KEY, isDecorative.value ? 'true' : 'false')
}

function setAttr(field: AttrField, value: any) {
  const next = { ...attrs.value }
  if (value === '' || value === null || value === undefined || value === false) {
    delete next[field.name]
  } else {
    next[field.name] = value
  }
  attrs.value = next
  savePluginData(ATTRS_KEY, next)
}

function onFilePicked(event: Event, fieldName: string) {
  fileError.value = ''
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > MAX_INLINE_IMAGE_BYTES) {
    fileError.value = `File too large (${Math.round(file.size / 1024)} KB). Max ${Math.round(MAX_INLINE_IMAGE_BYTES / 1024)} KB for inline embed — use a URL instead.`
    input.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = String(reader.result || '')
    setAttr({ name: fieldName } as AttrField, dataUrl)
    fileInfo.value = `${file.name} (${Math.round(file.size / 1024)} KB, embedded)`
  }
  reader.onerror = () => {
    fileError.value = 'Could not read file.'
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function clearAttr(fieldName: string) {
  setAttr({ name: fieldName } as AttrField, '')
  fileInfo.value = ''
}

const otherPages = computed(() => {
  const currentId = editor.state.currentPageId
  return editor.graph
    .getPages()
    .filter((p: any) => p.id !== currentId)
    .map((p: any) => ({ id: p.id, name: p.name }))
})

function setPageLink(value: string) {
  pageLink.value = value
  const n = node.value
  if (!n) return
  if (!value) {
    const pluginData = n.pluginData.filter(
      (e: any) => !(e.pluginId === PLUGIN_ID && e.key === PAGE_LINK_KEY)
    )
    editor.updateNodeWithUndo(n.id, { pluginData }, 'Clear page link')
    return
  }
  savePluginData(PAGE_LINK_KEY, value)
}

const currentElement = computed(() => {
  for (const group of AVAILABLE_TAGS) {
    const found = group.items.find((i) => i.tag === selectedTag.value)
    if (found) return found
  }
  return null
})

const orderedTagGroups = computed(() => {
  const type = node.value?.type || ''
  const order: Record<string, number> = { Containers: 0, Text: 1, Media: 2, Forms: 3 }
  if (type === 'TEXT') {
    order.Text = 0
    order.Containers = 1
    order.Media = 2
    order.Forms = 3
  } else if (type === 'FRAME' || type === 'GROUP' || type === 'SECTION') {
    order.Containers = 0
    order.Text = 1
    order.Media = 2
    order.Forms = 3
  }
  return [...AVAILABLE_TAGS].sort((a, b) => (order[a.category] ?? 9) - (order[b.category] ?? 9))
})

const attrFields = computed<AttrField[]>(() => {
  if (!selectedTag.value) return []
  return [...GLOBAL_ATTRS, ...(TAG_ATTRS[selectedTag.value] || [])]
})

const srcPreview = computed(() => {
  const src = attrs.value.src
  if (typeof src === 'string' && src.startsWith('data:image')) return src
  return ''
})

onMounted(load)
watch(node, load)
</script>

<template>
  <div class="tags-tab">
    <PanelSection label="Element Name">
      <div class="name-row">
        <input
          v-model="baseName"
          class="name-input"
          type="text"
          placeholder="Element name (e.g. Home)"
          @keyup.enter="applyName"
          @blur="applyName"
        />
      </div>
      <div v-if="node" class="layer-preview">
        Layers name: <span class="mono">{{ node.name }}</span>
      </div>
      <div v-else class="layer-preview dim">Select an element to name it.</div>
    </PanelSection>

    <PanelSection label="HTML Tag">
      <div v-if="currentElement" class="current-tag">
        <span class="tag-name">{{ currentElement.label }}</span>
        <span class="tag-tag">&lt;{{ currentElement.tag }}&gt;</span>
        <span class="tag-ar">{{ currentElement.nameAr }}</span>
      </div>

      <label class="decorative-row">
        <input type="checkbox" :checked="isDecorative" @change="toggleDecorative" />
        <span>Decorative / عنصر زخرفي (aria-hidden, skipped in validation)</span>
      </label>

      <div class="tag-groups">
        <div v-for="group in orderedTagGroups" :key="group.category" class="tag-group">
          <div class="group-label">{{ group.category }}</div>
          <div class="group-items">
            <button
              v-for="item in group.items"
              :key="item.tag"
              :class="['tag-btn', { active: selectedTag === item.tag }]"
              @click="setTag(item.tag)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>
    </PanelSection>

    <PanelSection v-if="selectedTag === 'a'" label="Page Link / اربط بصفحة">
      <div class="attr-row">
        <select
          class="attr-input"
          :value="pageLink"
          @change="setPageLink(($event.target as HTMLSelectElement).value)"
        >
          <option value="">— no link —</option>
          <option v-for="p in otherPages" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <div class="link-hint">
          Resolves to the target page's file at export (relative href).
        </div>
      </div>
    </PanelSection>

    <PanelSection v-if="selectedTag" label="Tag Attributes">
      <div v-if="fileError" class="file-error">{{ fileError }}</div>
      <div v-for="field in attrFields" :key="field.name" class="attr-row">
        <label class="attr-label">{{ field.label }}</label>

        <input
          v-if="field.type === 'text' || field.type === 'url' || field.type === 'number'"
          :type="field.type === 'number' ? 'number' : 'text'"
          class="attr-input"
          :placeholder="field.placeholder || ''"
          :value="attrs[field.name] ?? ''"
          @change="setAttr(field, ($event.target as HTMLInputElement).value)"
        />

        <select
          v-else-if="field.type === 'select'"
          class="attr-input"
          :value="attrs[field.name] ?? ''"
          @change="setAttr(field, ($event.target as HTMLSelectElement).value)"
        >
          <option value="">—</option>
          <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
        </select>

        <button
          v-else-if="field.type === 'boolean'"
          :class="['toggle-btn', { active: !!attrs[field.name] }]"
          @click="setAttr(field, !attrs[field.name])"
        >
          {{ attrs[field.name] ? 'On' : 'Off' }}
        </button>

        <div v-else-if="field.type === 'file-image'" class="file-col">
          <div v-if="srcPreview" class="img-preview">
            <img :src="srcPreview" alt="preview" />
          </div>
          <div class="file-row">
            <label class="file-btn">
              Browse...
              <input type="file" accept="image/*,video/*" hidden @change="onFilePicked($event, field.name)" />
            </label>
            <button v-if="attrs[field.name]" class="file-clear" @click="clearAttr(field.name)">Clear</button>
          </div>
          <input
            class="attr-input"
            type="text"
            placeholder="...or paste image/video URL"
            :value="typeof attrs[field.name] === 'string' && !String(attrs[field.name]).startsWith('data:') ? attrs[field.name] : ''"
            @change="setAttr(field, ($event.target as HTMLInputElement).value)"
          />
          <div v-if="fileInfo" class="file-info">{{ fileInfo }}</div>
        </div>
      </div>
    </PanelSection>
    <PanelSection v-else label="Tag Attributes">
      <div class="layer-preview dim">Pick a tag first to see its attributes.</div>
    </PanelSection>
  </div>
</template>

<style scoped>
.tags-tab {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-row {
  display: flex;
  gap: 6px;
}

.name-input {
  flex: 1;
  font-size: 12px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
}

.layer-preview {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 6px;
}

.layer-preview.dim {
  opacity: 0.7;
}

.mono {
  font-family: monospace;
  color: var(--accent-color);
}

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

.tag-btn {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.tag-btn:hover {
  background: var(--bg-tertiary);
}

.tag-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.attr-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.attr-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.attr-input {
  font-size: 12px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
  width: 100%;
}

.toggle-btn {
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 11px;
  align-self: flex-start;
}

.toggle-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.file-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-row {
  display: flex;
  gap: 6px;
}

.file-btn {
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 11px;
}

.file-btn:hover {
  background: var(--bg-tertiary);
}

.file-clear {
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 11px;
  color: var(--text-secondary);
}

.img-preview img {
  max-width: 100%;
  max-height: 120px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.file-info {
  font-size: 10px;
  color: var(--accent-color);
  font-family: monospace;
}

.file-error {
  font-size: 11px;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 6px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.link-hint {
  font-size: 10px;
  color: var(--text-secondary);
}
</style>
