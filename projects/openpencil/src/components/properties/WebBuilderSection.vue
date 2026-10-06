<script setup lang="ts">
import { computed } from 'vue'

import { useEditor, useSelectionState } from '@open-pencil/vue'

import AppGroupedSelect from '@/components/ui/AppGroupedSelect.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'
import {
  WEB_BUILDER_ELEMENTS,
  WEB_BUILDER_KEY,
  WEB_BUILDER_PLUGIN_ID
} from '@/app/web-builder/elements'

import type { WebBuilderElement } from '@/app/web-builder/elements'

const { selectedNode: node } = useSelectionState()
const editor = useEditor()

const DEFAULT_VALUE = '01_button'

const groups = computed(() => {
  const map = new Map<string, WebBuilderElement[]>()
  for (const e of WEB_BUILDER_ELEMENTS) {
    const list = map.get(e.category) ?? []
    list.push(e)
    map.set(e.category, list)
  }
  return Array.from(map.entries()).map(([category, items]) => ({
    label: category,
    items: items.map((e) => ({ value: e.id, label: `${e.name} · ${e.tag}` }))
  }))
})

const currentId = computed(() => {
  const entry = node.value?.pluginData.find(
    (e) => e.pluginId === WEB_BUILDER_PLUGIN_ID && e.key === WEB_BUILDER_KEY
  )
  return entry?.value ?? DEFAULT_VALUE
})

const currentElement = computed(
  () => WEB_BUILDER_ELEMENTS.find((e) => e.id === currentId.value) ?? null
)

const displayValue = computed(() => {
  if (currentElement.value) return `${currentElement.value.name} · ${currentElement.value.tag}`
  return '—'
})

function setTag(id: string) {
  const n = node.value
  if (!n) return
  const pluginData = n.pluginData.filter(
    (e) => !(e.pluginId === WEB_BUILDER_PLUGIN_ID && e.key === WEB_BUILDER_KEY)
  )
  pluginData.push({ pluginId: WEB_BUILDER_PLUGIN_ID, key: WEB_BUILDER_KEY, value: id })
  editor.updateNodeWithUndo(n.id, { pluginData }, 'Set HTML tag')
}
</script>

<template>
  <PanelSection label="Web Builder">
    <AppGroupedSelect
      :model-value="currentId"
      :groups="groups"
      :display-value="displayValue"
      label="HTML tag"
      data-property="web-builder-tag"
      @update:model-value="setTag"
    />
    <p v-if="currentElement" class="mt-1 text-[11px] text-muted">
      {{ currentElement.nameAr }} · {{ currentElement.category }}
    </p>
  </PanelSection>
</template>
