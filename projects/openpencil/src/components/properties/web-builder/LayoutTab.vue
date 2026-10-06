<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSelectionState } from '@open-pencil/vue'
import { useEditorStore } from '@/app/editor/active-store'

import PanelSection from '@/components/ui/panel/PanelSection.vue'

const PLUGIN_ID = 'open-pencil'
const LAYOUT_KEY = 'web-builder-layout'

interface LayoutData {
  type: 'none' | 'flex' | 'grid'
  direction?: 'row' | 'column'
  justifyContent?: string
  alignItems?: string
  gap?: string
  flexWrap?: boolean
  gridTemplateColumns?: string
  gridTemplateRows?: string
  tabletDirection?: 'inherit' | 'row' | 'column'
  mobileDirection?: 'inherit' | 'row' | 'column'
  childFlexGrow?: number
  childFlexShrink?: number
  childFlexBasis?: string
  childAlignSelf?: string
}

const editor = useEditorStore()
const { selectedNode: node } = useSelectionState()

const layoutType = ref<'none' | 'flex' | 'grid'>('none')
const direction = ref<'row' | 'column'>('row')
const justifyContent = ref('flex-start')
const alignItems = ref('stretch')
const gap = ref(0)
const flexWrap = ref(false)

const gridTemplateColumns = ref('1fr 1fr 1fr')
const gridTemplateRows = ref('auto')

const childFlexGrow = ref(0)
const childFlexShrink = ref(1)
const childFlexBasis = ref('auto')
const childAlignSelf = ref('auto')

const tabletDirection = ref<'inherit' | 'row' | 'column'>('inherit')
const mobileDirection = ref<'inherit' | 'row' | 'column'>('inherit')
const directionOverrideOptions = [
  { value: 'inherit', label: 'Inherit' },
  { value: 'row', label: 'Row' },
  { value: 'column', label: 'Column' }
]

const hasChildren = computed(() => {
  if (!node.value) return false
  return node.value.childIds.length > 0
})

const justifyOptions = [
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'space-between', label: 'Space Between' },
  { value: 'space-around', label: 'Space Around' },
  { value: 'space-evenly', label: 'Space Evenly' }
]

const alignOptions = [
  { value: 'stretch', label: 'Stretch' },
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'baseline', label: 'Baseline' }
]

const alignSelfOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'baseline', label: 'Baseline' }
]

const basisOptions = ['auto', '0', '25%', '50%', '75%', '100%']

function readLayout(): LayoutData | null {
  if (!node.value) return null
  const entry = node.value.pluginData.find(
    (e) => e.pluginId === PLUGIN_ID && e.key === LAYOUT_KEY
  )
  if (!entry) return null
  try {
    return JSON.parse(entry.value) as LayoutData
  } catch {
    return null
  }
}

function writeLayout(data: LayoutData) {
  if (!node.value) return
  const pluginData = node.value.pluginData.filter(
    (e) => !(e.pluginId === PLUGIN_ID && e.key === LAYOUT_KEY)
  )
  pluginData.push({
    pluginId: PLUGIN_ID,
    key: LAYOUT_KEY,
    value: JSON.stringify(data)
  })
  editor.updateNodeWithUndo(node.value.id, { pluginData }, `Set layout`)
}

function syncFromNode() {
  const data = readLayout()
  if (!data) {
    layoutType.value = 'none'
    return
  }
  layoutType.value = data.type || 'none'
  direction.value = data.direction || 'row'
  justifyContent.value = data.justifyContent || 'flex-start'
  alignItems.value = data.alignItems || 'stretch'
  gap.value = parseInt(String(data.gap), 10) || 0
  flexWrap.value = data.flexWrap || false
  gridTemplateColumns.value = data.gridTemplateColumns || '1fr 1fr 1fr'
  gridTemplateRows.value = data.gridTemplateRows || 'auto'
  childFlexGrow.value = data.childFlexGrow ?? 0
  childFlexShrink.value = data.childFlexShrink ?? 1
  childFlexBasis.value = data.childFlexBasis || 'auto'
  childAlignSelf.value = data.childAlignSelf || 'auto'
  tabletDirection.value = data.tabletDirection || 'inherit'
  mobileDirection.value = data.mobileDirection || 'inherit'
}

function syncToNode() {
  const existing = readLayout()
  const data: LayoutData = {
    type: layoutType.value,
    ...(layoutType.value === 'flex' || layoutType.value === 'grid'
      ? {
          direction: direction.value,
          justifyContent: justifyContent.value,
          alignItems: alignItems.value,
          gap: `${gap.value}px`,
          flexWrap: flexWrap.value,
          ...(tabletDirection.value !== 'inherit' ? { tabletDirection: tabletDirection.value } : {}),
          ...(mobileDirection.value !== 'inherit' ? { mobileDirection: mobileDirection.value } : {})
        }
      : {}),
    ...(layoutType.value === 'grid'
      ? {
          gridTemplateColumns: gridTemplateColumns.value,
          gridTemplateRows: gridTemplateRows.value
        }
      : {}),
    ...(existing?.childFlexGrow !== undefined ? { childFlexGrow: existing.childFlexGrow } : {}),
    ...(existing?.childFlexShrink !== undefined ? { childFlexShrink: existing.childFlexShrink } : {}),
    ...(existing?.childFlexBasis ? { childFlexBasis: existing.childFlexBasis } : {}),
    ...(existing?.childAlignSelf && existing.childAlignSelf !== 'auto'
      ? { childAlignSelf: existing.childAlignSelf }
      : {})
  }
  writeLayout(data)
}

function saveChildLayout() {
  if (!node.value) return
  const existing = readLayout()
  const data: LayoutData = {
    type: existing?.type || 'none',
    ...(existing?.type === 'flex' || existing?.type === 'grid'
      ? {
          direction: existing.direction,
          justifyContent: existing.justifyContent,
          alignItems: existing.alignItems,
          gap: existing.gap,
          flexWrap: existing.flexWrap,
          ...(existing.tabletDirection && existing.tabletDirection !== 'inherit'
            ? { tabletDirection: existing.tabletDirection }
            : {}),
          ...(existing.mobileDirection && existing.mobileDirection !== 'inherit'
            ? { mobileDirection: existing.mobileDirection }
            : {})
        }
      : {}),
    ...(existing?.type === 'grid'
      ? {
          gridTemplateColumns: existing.gridTemplateColumns,
          gridTemplateRows: existing.gridTemplateRows
        }
      : {}),
    childFlexGrow: childFlexGrow.value,
    childFlexShrink: childFlexShrink.value,
    childFlexBasis: childFlexBasis.value,
    childAlignSelf: childAlignSelf.value
  }
  writeLayout(data)
}

function setType(type: 'none' | 'flex' | 'grid') {
  layoutType.value = type
  syncToNode()
}

function setDirection(dir: 'row' | 'column') {
  direction.value = dir
  syncToNode()
}

function onJustifyChange() {
  syncToNode()
}

function onAlignChange() {
  syncToNode()
}

function onGapChange() {
  syncToNode()
}

function onWrapChange() {
  syncToNode()
}

function onGridColumnsChange() {
  syncToNode()
}

function onGridRowsChange() {
  syncToNode()
}

const cssPreview = computed(() => {
  const lines: string[] = []
  if (layoutType.value === 'flex') {
    lines.push('display: flex;')
    lines.push(`flex-direction: ${direction.value};`)
    if (justifyContent.value !== 'flex-start')
      lines.push(`justify-content: ${justifyContent.value};`)
    if (alignItems.value !== 'stretch')
      lines.push(`align-items: ${alignItems.value};`)
    if (gap.value > 0) lines.push(`gap: ${gap.value}px;`)
    if (flexWrap.value) lines.push('flex-wrap: wrap;')
  } else if (layoutType.value === 'grid') {
    lines.push('display: grid;')
    if (gridTemplateColumns.value)
      lines.push(`grid-template-columns: ${gridTemplateColumns.value};`)
    if (gridTemplateRows.value)
      lines.push(`grid-template-rows: ${gridTemplateRows.value};`)
    if (gap.value > 0) lines.push(`gap: ${gap.value}px;`)
  }
  return lines.join('\n')
})

watch(node, syncFromNode, { immediate: true })
</script>

<template>
  <div class="layout-tab">
    <PanelSection label="Layout Type">
      <div class="layout-type-btns">
        <button
          :class="['type-btn', { active: layoutType === 'none' }]"
          @click="setType('none')"
        >
          Normal
        </button>
        <button
          :class="['type-btn', { active: layoutType === 'flex' }]"
          @click="setType('flex')"
        >
          Flex
        </button>
        <button
          :class="['type-btn', { active: layoutType === 'grid' }]"
          @click="setType('grid')"
        >
          Grid
        </button>
      </div>
    </PanelSection>

    <!-- Flex Container -->
    <PanelSection v-if="layoutType === 'flex'" label="Flex Container">
      <div class="control-group">
        <div class="control-row">
          <label>Direction</label>
          <div class="btn-group">
            <button
              :class="['dir-btn', { active: direction === 'row' }]"
              @click="setDirection('row')"
            >
              <icon-lucide-arrow-right class="size-3" />
              Row
            </button>
            <button
              :class="['dir-btn', { active: direction === 'column' }]"
              @click="setDirection('column')"
            >
              <icon-lucide-arrow-down class="size-3" />
              Column
            </button>
          </div>
        </div>

        <div class="control-row">
          <label>Justify</label>
          <select
            v-model="justifyContent"
            class="control-select"
            @change="onJustifyChange"
          >
            <option
              v-for="opt in justifyOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="control-row">
          <label>Align</label>
          <select
            v-model="alignItems"
            class="control-select"
            @change="onAlignChange"
          >
            <option
              v-for="opt in alignOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="control-row">
          <label>Gap</label>
          <div class="input-with-unit">
            <input
              type="number"
              v-model.number="gap"
              min="0"
              class="control-input"
              @change="onGapChange"
            />
            <span class="unit">px</span>
          </div>
        </div>

        <div class="control-row">
          <label>Wrap</label>
          <button
            :class="['toggle-btn', { active: flexWrap }]"
            @click="flexWrap = !flexWrap; onWrapChange()"
          >
            {{ flexWrap ? 'On' : 'Off' }}
          </button>
        </div>

        <div class="control-row">
          <label>Tablet dir</label>
          <select
            v-model="tabletDirection"
            class="control-select"
            @change="syncToNode()"
          >
            <option
              v-for="opt in directionOverrideOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="control-row">
          <label>Mobile dir</label>
          <select
            v-model="mobileDirection"
            class="control-select"
            @change="syncToNode()"
          >
            <option
              v-for="opt in directionOverrideOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
    </PanelSection>

    <!-- Grid Container -->
    <PanelSection v-if="layoutType === 'grid'" label="Grid Container">
      <div class="control-group">
        <div class="control-row">
          <label>Columns</label>
          <input
            type="text"
            v-model="gridTemplateColumns"
            class="control-input full"
            placeholder="1fr 1fr 1fr"
            @change="onGridColumnsChange"
          />
        </div>

        <div class="control-row">
          <label>Rows</label>
          <input
            type="text"
            v-model="gridTemplateRows"
            class="control-input full"
            placeholder="auto auto"
            @change="onGridRowsChange"
          />
        </div>

        <div class="control-row">
          <label>Gap</label>
          <div class="input-with-unit">
            <input
              type="number"
              v-model.number="gap"
              min="0"
              class="control-input"
              @change="onGapChange"
            />
            <span class="unit">px</span>
          </div>
        </div>
      </div>
    </PanelSection>

    <!-- Child Properties (visible when node has children and layout is flex/grid) -->
    <PanelSection
      v-if="hasChildren && layoutType !== 'none'"
      label="Child Properties"
    >
      <div class="control-group">
        <div class="control-row">
          <label>Grow</label>
          <input
            type="number"
            v-model.number="childFlexGrow"
            min="0"
            max="10"
            class="control-input"
            @change="saveChildLayout"
          />
        </div>

        <div class="control-row">
          <label>Shrink</label>
          <input
            type="number"
            v-model.number="childFlexShrink"
            min="0"
            max="10"
            class="control-input"
            @change="saveChildLayout"
          />
        </div>

        <div class="control-row">
          <label>Basis</label>
          <select
            v-model="childFlexBasis"
            class="control-select"
            @change="saveChildLayout"
          >
            <option v-for="b in basisOptions" :key="b" :value="b">
              {{ b }}
            </option>
          </select>
        </div>

        <div class="control-row">
          <label>Align Self</label>
          <select
            v-model="childAlignSelf"
            class="control-select"
            @change="saveChildLayout"
          >
            <option
              v-for="opt in alignSelfOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
    </PanelSection>

    <!-- CSS Preview -->
    <PanelSection v-if="layoutType !== 'none'" label="CSS Output">
      <pre class="css-preview">{{ cssPreview }}</pre>
    </PanelSection>
  </div>
</template>

<style scoped>
.layout-tab {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.layout-type-btns {
  display: flex;
  gap: 4px;
}

.type-btn {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;
}

.type-btn:hover {
  background: var(--bg-tertiary);
}

.type-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-row label {
  font-size: 11px;
  color: var(--text-secondary);
  min-width: 70px;
  flex-shrink: 0;
}

.btn-group {
  display: flex;
  gap: 4px;
  flex: 1;
}

.dir-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;
  flex: 1;
  justify-content: center;
}

.dir-btn:hover {
  background: var(--bg-tertiary);
}

.dir-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.control-select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  font-size: 11px;
  color: var(--text-primary);
  cursor: pointer;
}

.control-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  font-size: 11px;
  color: var(--text-primary);
  min-width: 0;
}

.control-input.full {
  flex: 1;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.input-with-unit .control-input {
  flex: 1;
}

.unit {
  font-size: 10px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.toggle-btn {
  padding: 4px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;
  min-width: 50px;
}

.toggle-btn:hover {
  background: var(--bg-tertiary);
}

.toggle-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.css-preview {
  font-family: monospace;
  font-size: 10px;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>
