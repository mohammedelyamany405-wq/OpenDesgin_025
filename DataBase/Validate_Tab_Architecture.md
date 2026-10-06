# أرشيف: تبويب Validate (Smart Validation)

## 1. الهدف
فحص دلالي + تقني قبل التصدير، بدون تخمين:
- أخطاء حرجة تمنع التصدير النظيف
- تحذيرات لا تمنع لكن تتطلب إصلاحا

## 2. قواعد الفحص

| # | القاعدة | النوع | المنطق |
|---|---------|-------|--------|
| 1 | غياب `header` / `main` / `footer` | error | لا يوجد الوسم في أي عنصر بالصفحة |
| 2 | أكثر من `h1` واحد | error | `h1` واحد فقط لكل صفحة |
| 3 | عنصر ورقي `div` بدون أبناء وبدون وسم | warning | `tag === 'div'` + leaf |
| 4 | حاوية لها أبناء بدون Flex/Grid معلن | warning | `layout === 'none'` + container |
| 5 | `img` له أبناء | error | `img` يجب أن يكون leaf |
| 7 | `img` بلا `src` ولا image-fill | warning | اختر ملفا أو URL من Tags |
| 6 | `button` / `a` باسم افتراضي | warning | الاسم يبدأ بـ Rectangle/Ellipse/Frame/Group/Text |

## 3. آلية القراءة

```typescript
const PLUGIN_ID = 'open-pencil'
const TAG_KEY = 'web-builder-tag'
const LAYOUT_KEY = 'web-builder-layout'

// الوسم مخزن string مباشرة
const tag = node.pluginData.find(
  (e) => e.pluginId === PLUGIN_ID && e.key === TAG_KEY
)?.value || 'div'

// التخطيط مخزن JSON
const layout = JSON.parse(entry.value).type // none | flex | grid
```

- جمع كل العقد عبر المشي التكراري من `currentPageId` باستخدام `graph.getNode` + `childIds`.
- تجاهل `internalOnly`.

## 4. التحديث والتفاعل

- تشغيل يدوي بزر `Run Validation`.
- تشغيل تلقائي عند `onMounted` وعند `page:changed` و `currentPageId` watch.
- النقر على أي issue له `nodeId` يحدد العنصر في Canvas عبر `editor.select([nodeId])`.
- العقد الزخرفية (`web-builder-decorative = 'true'`) تُتجاهل تماما في الفحص.
- زر `Select untagged` يحدد كل الأوراق غير المصنفة دفعة واحدة ليراها المصمم على Canvas.
- شارات DOM Tree: `!` صفراء للورقة غير المصنفة، `D` رمادية للزخرفي (TreeNodeItem.vue).

## 5. الملفات

| الملف | الدور |
|-------|-------|
| `src/components/properties/web-builder/ValidateTab.vue` | المكون الجديد الكامل |
| `src/components/properties/web-builder/WebBuilderPanel.vue` | استيراد `ValidateTab` وحذف `runValidation` القديم و `validationResult` |

## 6. بوابة التصدير (Export Gate)

- `generateExport` في `WebBuilderPanel` يفحص الأخطاء الحرجة أولا عبر `collectCriticalErrors`.
- نفس قواعد Validate الحرجة: غياب `header/main/footer`، تكرار `h1`، `img` له أبناء.
- عند وجود خطأ حرج: يمسح `exportHtml` ويعرض رسالة منع + زر `Go to Validate`.
- التحذيرات (warnings) لا تمنع التصدير.

## 7. ملاحظات (v0.0 مكتملة)

- `bun run check:vue` + `tsc` لحزمة dom-css نظيفان.
- التصدير الآن: بوابة أخطاء + حوار تحذيرات + `<style>` كامل + media queries.
- حوار التحذيرات: `Proceed anyway` يستهلك تأكيدا لمرة واحدة ثم يعيد الضبط.
