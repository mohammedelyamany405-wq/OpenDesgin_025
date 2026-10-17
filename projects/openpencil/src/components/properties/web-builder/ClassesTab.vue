<script setup lang="ts">
import { ref, computed } from 'vue'
import { classCatalog } from '@/app/web-builder/class-catalog'
import type { StyleClass } from '@/app/web-builder/style-classes'

import PanelSection from '@/components/ui/panel/PanelSection.vue'

const { applied, styleClasses, canSave } = defineProps<{
  applied: string[]
  styleClasses: StyleClass[]
  canSave: boolean
}>()

const emit = defineEmits<{
  toggle: [name: string]
  save: [name: string]
  remove: [name: string]
}>()

const newName = ref('')

const hasName = computed(() => newName.value.trim().length > 0)

function save() {
  const name = newName.value.trim()
  if (!canSave || !name) return
  emit('save', name)
  newName.value = ''
}
</script>

<template>
  <PanelSection label="CSS Classes">
    <div v-if="applied.length > 0" class="applied-classes">
      <div class="section-label">Applied:</div>
      <div class="class-tags">
        <span v-for="cls in applied" :key="cls" class="class-tag">
          {{ cls }}
          <button class="remove-btn" @click="emit('toggle', cls)">×</button>
        </span>
      </div>
    </div>

    <div class="my-classes">
      <div class="group-label">My Classes</div>
      <p v-if="styleClasses.length === 0" class="hint">
        احفظ تنسيق العنصر الحالي كصنف لإعادة استخدامه على عناصر أخرى.
      </p>
      <div v-else class="class-items">
        <div v-for="item in styleClasses" :key="item.name" class="my-class-row">
          <button
            :class="['class-btn', { active: applied.includes(item.name) }]"
            :title="item.declarations.join('; ')"
            @click="emit('toggle', item.name)"
          >
            {{ item.name }}
          </button>
          <button class="delete-btn" title="Delete class" @click="emit('remove', item.name)">
            ×
          </button>
        </div>
      </div>
      <div class="save-row">
        <input
          v-model="newName"
          class="name-input"
          type="text"
          placeholder="class-name"
          @keydown.enter="save"
        />
        <button class="save-btn" :disabled="!canSave || !hasName" @click="save">
          Save current style
        </button>
      </div>
    </div>

    <div class="class-categories">
      <div v-for="cat in classCatalog" :key="cat.category" class="class-group">
        <div class="group-label">{{ cat.category }}</div>
        <div class="class-items">
          <button
            v-for="item in cat.items"
            :key="item.name"
            :class="['class-btn', { active: applied.includes(item.name) }]"
            :title="item.css"
            @click="emit('toggle', item.name)"
          >
            {{ item.name }}
          </button>
        </div>
      </div>
    </div>
  </PanelSection>
</template>

<style scoped>
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

.my-classes {
  margin-bottom: 12px;
}

.class-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.my-class-row {
  display: flex;
  align-items: stretch;
  gap: 2px;
}

.delete-btn {
  padding: 0 6px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}

.delete-btn:hover {
  background: var(--bg-tertiary);
}

.save-row {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.name-input {
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  font-size: 11px;
  color: var(--text-primary);
}

.save-btn {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  font-size: 11px;
  cursor: pointer;
}

.save-btn:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.group-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.class-group {
  margin-bottom: 10px;
}

.class-btn {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.class-btn:hover {
  background: var(--bg-tertiary);
}

.class-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.hint {
  margin: 0 0 6px;
  font-size: 10px;
  line-height: 1.5;
  color: var(--text-secondary);
}
</style>
