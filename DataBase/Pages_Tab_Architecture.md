# أرشيف: Pages Tab

## 1. الـ API المستخدم

### قراءة الصفحات
```typescript
// SceneGraph level
editor.graph.getPages(): SceneNode[]

// Returns array of SceneNode objects where type === 'CANVAS'
// Each node has: id, name, childIds, type
```

### إضافة صفحة
```typescript
// Editor level
editor.addPage(name?: string): string

// Returns the new page ID
// Default name: "Page X" (where X = pages.length + 1)
// Auto-switches to the new page
```

### حذف صفحة
```typescript
// Editor level
editor.deletePage(pageId: string): void

// Cannot delete last page (no-op if pages.length <= 1)
// Auto-switches to adjacent page if deleting current page
```

### إعادة تسمية صفحة
```typescript
// Editor level
editor.renamePage(pageId: string, name: string): void

// Updates page name in SceneGraph
```

### التبديل بين الصفحات
```typescript
// Editor level
editor.switchPage(pageId: string): Promise<void>

// Validates page is CANVAS type
// Saves current viewport, switches, restores new viewport
// Emits 'page:changed' event
```

### الصفحة الحالية
```typescript
// State
editor.state.currentPageId: string

// Read via computed
const currentPageId = computed(() => editor.state.currentPageId)
```

## 2. الملفات المعدّلة

| الملف | التعديل |
|-------|---------|
| `src/components/properties/web-builder/PagesTab.vue` | إنشاء مكون جديد لإدارة الصفحات |
| `src/components/properties/web-builder/WebBuilderPanel.vue` | استيراد PagesTab + تحديث أيقونات التبويبات |

## 3. التحديات والحلول

### التحدي 1: قراءة الصفحات بشكل تفاعلي
**المشكلة:** `editor.graph.getPages()` لا يتحدث تلقائياً عند تغيير الصفحات.
**الحل:** استخدام `editor.onEditorEvent('page:changed', loadPages)` للاستماع للأحداث.

### التحدي 2: منع حذف الصفحة الأخيرة
**المشكلة:** إذا حُذفت الصفحة الأخيرة، يتكسر المحرر.
**الحل:** التحقق من `pages.length <= 1` قبل الحذف.

### التحدي 3: إعادة التسمية Inline
**المشكلة:** تحتاج input يظهر عند النقر المزدوج ويختفي عند الحفظ.
**الحل:** استخدام `editingPageId` لتحديد الصفحة قيد التعديل + `v-if` لإظهار/إخفاء input.

## 4. معايير النجاح

- [x] يمكن إضافة صفحة جديدة
- [x] يمكن حذف صفحة (مع منع حذف الأخيرة)
- [x] يمكن إعادة تسمية صفحة (dblclick)
- [x] يمكن التبديل بين الصفحات
- [x] تحديث لحظي في DOM Tree
- [x] أزرار تظهر دائماً (bug fix)

## 5. كيفية الاستخدام

1. افتح تبويب "Pages" في Web Builder Panel
2. اضغط "+" لإضافة صفحة جديدة
3. انقر على صفحة للتبديل إليها
4. انقر مزدوج على الاسم لإعادة التسمية
5. انقر على 🗑️ لحذف الصفحة (الزر معطل للصفحة الأخيرة)

## 6. الأحداث المستمعة

- `page:changed` — تحديث قائمة الصفحات
- `node:created` — تحديث عند إضافة عناصر
- `node:deleted` — تحديث عند حذف عناصر

## 7. الملفات المرجعية

- `packages/core/src/editor/pages.ts` — إجراءات الصفحات
- `packages/scene-graph/src/index.ts` — بنية SceneGraph
- `src/components/PagesPanel.vue` — UI الحالي للصفحات
- `packages/vue/src/primitives/PageList/` — SDK المكونات

## 8. نقاط التوقف (Breakpoints لكل صفحة)

- التخزين: `web-builder-breakpoints` على عقدة الصفحة: `{tablet:768, mobile:375}`.
- الواجهة: حقلا Tablet/Mobile تحت معلومات الصفحة الحالية، حفظ عبر `updateNodeWithUndo`.
- الاستهلاك: `domTreeData` يقرأها في `tree.breakpoints` ويستخدمها التصدير في `@media`.
