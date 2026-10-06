# أرشيف: تبويب Tags (التسمية + الخصائص)

المرجع: https://www.w3schools.com/tags/default.asp

## 1. البنية (4 أقسام)

| القسم | الوظيفة |
|-------|---------|
| Element Name | صندوق كتابة اسم العنصر — يعيد تسمية العقدة في Layers بصيغة `Name-Tag` |
| HTML Tag | عرض الوسم الحالي + Decorative + فئات الوسوم (ترتيب حسب نوع العقدة) |
| Tag Attributes | حقول خصائص الوسم المختار + الخصائص العامة (`id`, `title`) |

## 2. التسمية (Name-Tag)

- الكتابة في الصندوق + Enter/Blur → `updateNodeWithUndo(id, {name})`.
- الصيغة: `base-tag` (مثال: `Home` + `button` ← `Home-button`).
- عند تغيير التحديد: يعرض الاسم الأساسي (يجرد اللاحقة `-tag` إن طابقت الوسم الحالي).
- عند تغيير الوسم ووجود اسم: يعيد التسمية تلقائيا باللاحقة الجديدة.

## 3. كتالوج الخصائص (`src/app/web-builder/tag-attrs.ts`)

- `AVAILABLE_TAGS`: نفس فئات السابق + `a` (Link) في Text.
- `GLOBAL_ATTRS`: `id`, `title` لكل وسم.
- `TAG_ATTRS`: لكل وسم حقوله (text/select/boolean/number/file-image/url).
  - `img`: src (ملف أو URL) + alt + loading.
  - `video`: src + poster + controls/autoplay/loop/muted.
  - `a`: href + target + rel.
  - `form`: action + method + target.
  - `input`: type + name + placeholder + value + required.
  - `button`: type + name. `select`: name + multiple + required.
  - `textarea`: name + rows + cols + placeholder + required.

## 4. صور محلية (Browse)

- `<input type="file" accept="image/*,video/*">` + FileReader → data URL.
- الحد: 1.5MB (`MAX_INLINE_IMAGE_BYTES`) — الأكبر يطلب URL بدلا من التضمين.
- معاينة مصغرة + اسم الملف والحجم + زر Clear.
- بديل: لصق URL مباشرة في نفس الخاصية.
- التخزين: `web-builder-attrs` JSON — القيمة الفارغة/False تُحذف من الكائن.

## 5. التصدير

- اللوحة: `attrsToString` مع هروب `&"<>'` — Boolean الحقيقي يخرج اسما عاريا (`controls`).
- الزخرفي يتجاهل الخصائص ويصدر `div aria-hidden`.
- مسار dom-css: `attrsForNode` يدمج `web-builder-attrs` — نية المصمم تغلب fill الصورة.
- فحص: `img` بلا `src` ولا image-fill ← تحذير (Validate + حوار التصدير).

## 6. الملفات

| الملف | الدور |
|-------|-------|
| `src/app/web-builder/tag-attrs.ts` | الكتالوج + المفاتيح + الحد |
| `src/components/properties/web-builder/TagsTab.vue` | التبويب الجديد الكامل |
| `src/components/properties/web-builder/WebBuilderPanel.vue` | يستورد TagsTab (حذف منطق Tags القديم) |
