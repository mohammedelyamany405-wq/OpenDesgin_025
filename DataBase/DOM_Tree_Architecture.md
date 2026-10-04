# أرشيف: تبويب DOM Tree (مُصلح - الإصدار 2)

## 1. المشكلةPreviously وأ solvedت

### المشكلة: العرض المتداخل (Recursive Rendering)
- **المشكلة:** `TreeNodeItem` كان معرّف في `<script>` منفصل
- **النتيجة:** Vue لا يعرف كيف يعرض العناصر بشكل متداخل
- **الحل:** إزالة المكون المنفصل واستخدام `v-for` مباشرة في القالب

## 2. الحل المطبق

### بدلاً من:
```vue
<!-- ❌ هذا لا يعمل بشكل صحيح -->
<script lang="ts">
const TreeNodeItem = {
  name: 'TreeNodeItem',
  template: `
    <TreeNodeItem v-for="child in node.children" />
  `
}
</script>
```

### استخدمنا:
```vue
<!-- ✅ هذا يعمل بشكل صحيح -->
<div v-for="node in treeData" :key="node.id">
  <!-- العقدة الرئيسية -->
  <div class="node-row">{{ node.name }}</div>
  
  <!-- الأبناء -->
  <div v-if="node.isExpanded && node.children.length > 0">
    <div v-for="child in node.children" :key="child.id">
      <!-- ابن مباشر -->
      <div class="node-row" style="paddingLeft: 16px">{{ child.name }}</div>
      
      <!-- أبناء الابن -->
      <div v-if="child.isExpanded && child.children.length > 0">
        <div v-for="grandchild in child.children" :key="grandchild.id">
          <div class="node-row" style="paddingLeft: 32px">{{ grandchild.name }}</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 3. API المستخدم

### قراءة Scene Graph
```typescript
const editor = useEditorStore()

// الصفحة الحالية
const pageId = editor.state.currentPageId

// أبناء الصفحة
const children = editor.graph.getChildren(pageId)

// عنصر واحد
const node = editor.graph.getNode(nodeId)

// أبناء عنصر
const nodeChildren = editor.graph.getChildren(nodeId)
```

### قراءة pluginData
```typescript
function getTagFromNode(node: SceneNode): string {
  const entry = node.pluginData.find(
    (e) => e.pluginId === 'open-pencil' && e.key === 'web-builder-tag'
  )
  if (!entry) return 'div'
  return entry.value || 'div'
}
```

## 4. التحديث اللحظي

### الأحداث
```typescript
editor.onEditorEvent('node:created', rebuildTree)
editor.onEditorEvent('node:deleted', rebuildTree)
editor.onEditorEvent('node:reparented', rebuildTree)
editor.onEditorEvent('node:reordered', rebuildTree)
editor.onEditorEvent('page:changed', rebuildTree)
editor.onEditorEvent('selection:changed', (ids) => {
  // ids هو string[]
})
```

## 5. الملفات

| الملف | الوظيفة |
|-------|---------|
| `src/components/properties/web-builder/DOMTreeTab.vue` | المكون الرئيسي |
| `src/components/properties/web-builder/WebBuilderPanel.vue` | يستورد DOMTreeTab |

## 6. ملاحظات تقنية

- **المستوى الأقصى للtobr:** 3 مستويات (Desktop → Rectangle → ...)
- **لا نستخدم recursive components:** لتجنب مشاكل Vue مع الأسماء
- **التحديث:** يتحقق من `isExpanded` قبل عرض الأبناء
