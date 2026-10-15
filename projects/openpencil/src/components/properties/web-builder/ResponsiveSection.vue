<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSelectionState } from '@open-pencil/vue'
import { useEditorStore } from '@/app/editor/active-store'
import {
  readResponsive,
  type LayoutResponsiveSource,
  type ResponsiveDevice,
  type ResponsiveOverrides
} from '@/app/web-builder/responsive'

import PanelSection from '@/components/ui/panel/PanelSection.vue'

const PLUGIN_ID = 'open-pencil'
const LAYOUT_KEY = 'web-builder-layout'

const editor = useEditorStore()
const { selectedNode: node } = useSelectionState()

const activeDevice = ref<'desktop' | 'tablet' | 'mobile'>('tablet')

const overrides = ref<Record<ResponsiveDevice, ResponsiveOverrides>>({ tablet: {}, mobile: {} })

const deviceOptions = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'mobile', label: 'Mobile' }
] as const

const directionOptions = [
  { value: '', label: 'Inherit' },
  { value: 'row', label: 'Row' },
  { value: 'column', label: 'Column' }
]

const widthOptions = [
  { value: '', label: 'Inherit' },
  { value: 'auto', label: 'Auto' },
  { value: 'full', label: 'Full width' }
]

const justifyOptions = [
  { value: '', label: 'Inherit' },
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'space-between', label: 'Space Between' },
  { value: 'space-around', label: 'Space Around' },
  { value: 'space-evenly', label: 'Space Evenly' }
]

const alignOptions = [
  { value: '', label: 'Inherit' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'flex-start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'End' },
  { value: 'baseline', label: 'Baseline' }
]

const currentDevice = computed<ResponsiveDevice>(
  () => (activeDevice.value === 'mobile' ? 'mobile' : 'tablet')
)
const current = computed<ResponsiveOverrides>(() => overrides.value[currentDevice.value])

function findLayoutEntry() {
  const n = node.value
  if (!n) return undefined
  return n.pluginData.find((e) => e.pluginId === PLUGIN_ID && e.key === LAYOUT_KEY)
}

function readLayout(): Record<string, unknown> {
  const entry = findLayoutEntry()
  if (!entry) return {}
  try {
    const parsed = JSON.parse(entry.value)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

function normalize(source: ResponsiveOverrides | undefined): ResponsiveOverrides {
  return {
    direction: source?.direction,
    hidden: source?.hidden ?? false,
    width: source?.width,
    justifyContent: source?.justifyContent ?? '',
    alignItems: source?.alignItems ?? '',
    gap: source?.gap ?? '',
    gridTemplateColumns: source?.gridTemplateColumns ?? ''
  }
}

function clean(source: ResponsiveOverrides): ResponsiveOverrides {
  const result: ResponsiveOverrides = {}
  if (source.direction) result.direction = source.direction
  if (source.hidden) result.hidden = true
  if (source.width) result.width = source.width
  if (source.justifyContent) result.justifyContent = source.justifyContent
  if (source.alignItems) result.alignItems = source.alignItems
  if (source.gap) result.gap = source.gap
  if (source.gridTemplateColumns) result.gridTemplateColumns = source.gridTemplateColumns
  return result
}

function syncFromNode() {
  const map = readResponsive(readLayout() as LayoutResponsiveSource)
  overrides.value = { tablet: normalize(map.tablet), mobile: normalize(map.mobile) }
}

function save() {
  const n = node.value
  if (!n) return
  const layout = readLayout()
  const tablet = clean(overrides.value.tablet)
  const mobile = clean(overrides.value.mobile)
  const responsive: Record<string, ResponsiveOverrides> = {}
  if (Object.keys(tablet).length > 0) responsive.tablet = tablet
  if (Object.keys(mobile).length > 0) responsive.mobile = mobile

  delete layout.responsive
  delete layout.tabletDirection
  delete layout.mobileDirection
  if (Object.keys(responsive).length > 0) layout.responsive = responsive

  const pluginData = n.pluginData.filter(
    (e) => !(e.pluginId === PLUGIN_ID && e.key === LAYOUT_KEY)
  )
  pluginData.push({ pluginId: PLUGIN_ID, key: LAYOUT_KEY, value: JSON.stringify(layout) })
  editor.updateNodeWithUndo(n.id, { pluginData }, 'Set responsive overrides')
}

function toggleHidden() {
  current.value.hidden = !current.value.hidden
  save()
}

function setGap(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) {
    current.value.gap = ''
    save()
    return
  }
  current.value.gap = /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed
  save()
}

watch(node, syncFromNode, { immediate: true })
watch(activeDevice, syncFromNode)
</script>

<template>
  <PanelSection label="Responsive">
    <div class="responsive-tab">
      <div class="device-btns">
        <button
          v-for="dev in deviceOptions"
          :key="dev.value"
          :class="['device-btn', { active: activeDevice === dev.value }]"
          @click="activeDevice = dev.value"
        >
          {{ dev.label }}
        </button>
      </div>

      <p v-if="activeDevice === 'desktop'" class="hint">
        Desktop هو التصميم الأساسي. عدّله من أقسام Layout أعلاه، ثم صرّح بتجاوزات
        Tablet و Mobile هنا.
      </p>

      <div v-else class="control-group">
        <div class="control-row">
          <label>Direction</label>
          <select v-model="current.direction" class="control-select" @change="save">
            <option v-for="opt in directionOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="control-row">
          <label>Hidden</label>
          <button
            :class="['toggle-btn', { active: current.hidden }]"
            @click="toggleHidden"
          >
            {{ current.hidden ? 'On' : 'Off' }}
          </button>
        </div>

        <div class="control-row">
          <label>Width</label>
          <select v-model="current.width" class="control-select" @change="save">
            <option v-for="opt in widthOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="control-row">
          <label>Justify</label>
          <select v-model="current.justifyContent" class="control-select" @change="save">
            <option v-for="opt in justifyOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="control-row">
          <label>Align</label>
          <select v-model="current.alignItems" class="control-select" @change="save">
            <option v-for="opt in alignOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="control-row">
          <label>Gap</label>
          <div class="input-with-unit">
            <input
              type="text"
              :value="current.gap"
              class="control-input"
              placeholder="inherit"
              @change="setGap(($event.target as HTMLInputElement).value)"
            />
            <span class="unit">px</span>
          </div>
        </div>

        <div class="control-row">
          <label>Grid Columns</label>
          <input
            type="text"
            v-model="current.gridTemplateColumns"
            class="control-input"
            placeholder="inherit"
            @change="save"
          />
        </div>

        <p class="hint">
          القيم الفارغة (Inherit) ترث إعدادات Desktop بلا تغيير.
        </p>
      </div>
    </div>
  </PanelSection>
</template>

<style scoped>
.responsive-tab {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-btns {
  display: flex;
  gap: 4px;
}

.device-btn {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;
}

.device-btn:hover {
  background: var(--bg-tertiary);
}

.device-btn.active {
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
  min-width: 80px;
  flex-shrink: 0;
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

.hint {
  margin: 0;
  font-size: 10px;
  line-height: 1.5;
  color: var(--text-secondary);
}
</style>
