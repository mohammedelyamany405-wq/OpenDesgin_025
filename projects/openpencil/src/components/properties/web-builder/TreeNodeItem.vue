<script setup lang="ts">
import { computed } from 'vue'

interface TreeNode {
  id: string
  name: string
  type: string
  tag: string
  decorative: boolean
  children: TreeNode[]
  isExpanded: boolean
}

const props = defineProps<{
  node: TreeNode
  depth: number
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [nodeId: string]
  toggle: [nodeId: string]
}>()

const paddingLeft = computed(() => `${props.depth * 16}px`)

// خريطة أيقونات HTML tags
const tagIconMap: Record<string, string> = {
  'div': 'layout-dashboard',
  'section': 'layout-dashboard',
  'header': 'layout-dashboard',
  'footer': 'layout-dashboard',
  'nav': 'layout-dashboard',
  'main': 'layout-dashboard',
  'article': 'layout-dashboard',
  'aside': 'layout-dashboard',
  'h1': 'type',
  'h2': 'type',
  'h3': 'type',
  'h4': 'type',
  'h5': 'type',
  'h6': 'type',
  'p': 'type',
  'span': 'type',
  'strong': 'type',
  'em': 'type',
  'img': 'image',
  'video': 'video',
  'audio': 'music',
  'button': 'mouse-pointer-click',
  'input': 'text-cursor-input',
  'textarea': 'text-cursor-input',
  'select': 'text-cursor-input',
  'form': 'text-cursor-input',
  'a': 'link',
  'ul': 'list',
  'ol': 'list',
  'li': 'list',
  'table': 'table',
  'tr': 'table-row',
  'td': 'table-cell',
  'th': 'table-cell',
  'thead': 'table',
  'tbody': 'table',
  'tfoot': 'table',
  'blockquote': 'quote',
  'pre': 'code',
  'code': 'code',
  'hr': 'minus',
  'br': 'corner-down-left',
}

// خريطة أيقونات SceneNode types
const typeIconMap: Record<string, string> = {
  'FRAME': 'square',
  'GROUP': 'group',
  'COMPONENT': 'component',
  'INSTANCE': 'copy',
  'TEXT': 'type',
  'RECTANGLE': 'square',
  'ELLIPSE': 'circle',
  'VECTOR': 'pen-tool',
  'BOOLEAN_OPERATION': 'blend',
  'SECTION': 'layout-dashboard',
  'LINE': 'minus',
  'STAR': 'star',
  'POLYGON': 'pentagon',
  'SLICE': 'scissors',
}

// الحصول على اسم الأيقونة
function getIconName(type: string, tag: string): string {
  // أولاً: تحقق من خريطة الـ tag (للعناصر المصنفة)
  if (tag && tagIconMap[tag]) {
    return tagIconMap[tag]
  }
  // ثانياً: تحقق من خريطة الـ type
  return typeIconMap[type] || 'square'
}
</script>

<template>
  <div class="tree-node">
    <!-- العقدة -->
    <div 
      :class="['node-row', { selected: selectedId === node.id }]"
      :style="{ paddingLeft }"
      @click="emit('select', node.id)"
    >
      <button 
        v-if="node.children.length > 0"
        class="expand-btn"
        @click.stop="emit('toggle', node.id)"
      >
        <icon-lucide-chevron-right 
          class="size-3 transition-transform"
          :class="{ 'rotate-90': node.isExpanded }"
        />
      </button>
      <span v-else class="expand-spacer"></span>
      
      <component
        :is="`icon-lucide-${getIconName(node.type, node.tag)}`"
        class="node-icon size-3"
      />
      <span class="node-tag">&lt;{{ node.decorative ? 'div' : node.tag }}&gt;</span>
      <span class="node-name">{{ node.name }}</span>
      <span
        v-if="node.decorative"
        class="node-badge decorative"
        title="Decorative - aria-hidden, skipped in validation"
      >D</span>
      <span
        v-else-if="node.tag === 'div' && node.children.length === 0"
        class="node-badge untagged"
        title="Untagged - set a tag in Tags tab"
      >!</span>
    </div>
    
    <!-- الأبناء بشكل متداخل -->
    <div v-if="node.isExpanded && node.children.length > 0" class="node-children">
      <TreeNodeItem 
        v-for="child in node.children" 
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :selected-id="selectedId"
        @select="emit('select', $event)"
        @toggle="emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
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

.node-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.node-row.selected .node-icon {
  color: white;
}

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

.node-name {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-badge {
  font-size: 9px;
  font-weight: 700;
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.node-badge.untagged {
  color: #eab308;
  background: rgba(234, 179, 8, 0.15);
}

.node-badge.decorative {
  color: var(--text-secondary);
  background: var(--bg-tertiary);
}

.node-children {
  border-left: 1px dashed var(--border-color);
  margin-left: 8px;
}
</style>
