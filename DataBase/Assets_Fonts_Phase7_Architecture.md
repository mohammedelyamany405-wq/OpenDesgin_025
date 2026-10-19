# المرحلة 7 — الأصول والخطوط (Assets & Fonts)

## الهدف
إخراج مشروع ويب **قابل للنشر** لا يعتمد على بيانات ضخمة داخل HTML:
1. الصور تُصدَّر كملفات حقيقية تحت `assets/images/` بدل `data:` URL (في وضع المشروع/ZIP).
2. الخطوط المستخدمة في النص تُضمَّن كـ`@font-face`:
   - **inline** (معاينة/HTML مفرد): الخط نفسه base64 داخل الصفحة.
   - **external** (مشروع/ZIP): ملفات تحت `assets/fonts/` مع روابط نسبية.
3. عدم كسر المعاينة السريعة: تبقى الصور والخطوط مضمّنة في وضع `inline`.

## النطاق
- لا تغيير على بنية شجرة DOM أو التصنيف/التخطيط/الاستجابة.
- لا تغيير على حفظ `.fig` أو صيغة الملف.
- لا خطوط ويب خارجية (Google Fonts/CDN) — كل شيء محلي من خطوط المشروع.

## وحدة نقية جديدة: `src/app/web-builder/export-assets.ts`
| التصدير | الوظيفة |
|---|---|
| `ExportAssetMode` | `'inline' \| 'external'` |
| `ExportAssetFile` | `{ path, bytes }` |
| `ResolvedFont` | family/style/weight/italic/format/extension/bytes |
| `imageExtension(mime)` | png/jpg/webp/gif/avif، والافتراضي png |
| `imageAssetPath(hash, bytes)` | `assets/images/<hash>.<ext>` بكشف النوع من البايتات |
| `fontFormat(bytes)` | يقرأ بصمة الملف: `ttf/otf/woff/woff2` |
| `fontMime(format)` | MIME المناسب لـ`@font-face` |
| `fontAssetPath(font)` | `assets/fonts/<family>-<style>.<ext>` عبر `cssClassSlug` |
| `parseImageDataURL(value)` | يفكّ `data:image/*;base64,...` أو يعيد `null` |
| `ExportAssetStore` | يجمع الملفات مرة واحدة: يمنع تكرار المتطابق ويضيف `-2`, `-3` عند تصادم مسار ببايتات مختلفة |
| `inlineImageResolver(graph)` | صورة `data:` من `graph.images` |
| `externalImageResolver(graph, store)` | يكتب الصورة في المخزن ويعيد مسارها |
| `rewriteImageAttrs(attrs, mode, store)` | يحوّل `src="data:..."` إلى مسار أصل (external فقط) |
| `loadExportFonts(graph, nodeIds)` | يجمع الخطوط الفعلية لكل صفحات المشروع ويحمّلها من `fontManager` |
| `fontFaceCSS(fonts, mode, store?)` | يبني قواعد `@font-face` (base64 أو مسار) |
| `pageNodeIds(graph, pageIds)` | الجذور المباشرة للصفحات (الجمع بعدها recursive داخل `collectGraphFontKeys`) |

## تدفّق التصدير في اللوحة
- `buildPageTree(pageId, assets)` يستخدم `TreeAssets = { mode, store, resolveImage }`:
  - `inlineAssets()`: مخزن مؤقت + `inlineImageResolver` (للمعاينة و«Generate HTML»).
  - `externalAssets(store)`: مخزن مشترك + `externalImageResolver` (للمشروع/ZIP).
  - `attrs` تمرّ عبر `rewriteImageAttrs`، وتعبئات الصور عبر `visualStyleDeclarations`.
- `generateExport()` و`previewExport()` أصبحا **async**: يحمّلان الخطوط ثم يمرّران
  `fontCSS` إلى `buildExportHtml`، فيتصدّر CSS قبل `body` (كي تعمل الخطوط).
- `collectProjectFiles()` أصبح **async**:
  1. يجمع خطوط كل الصفحات ويضيف ملفاتها إلى المخزن (`external`).
  2. يبني كل صفحة بمخزن الأصول المشترك ويكتب مسارات الصور.
  3. يضيف ملفات الأصول إلى نتيجة المشروع بعد صفحات HTML.
- `createProject()` يكتب الملفات المتداخلة عبر `writeProjectFile` (يُنشئ المجلدات تدريجياً)،
  وإلا ينزّل ZIP. `downloadZip` يتعامل مع `string | Uint8Array`.
- `ProjectFile = { name, content: string | Uint8Array }`.

## قرارات
- **المخزن المشترك**: مصدر واحد للحقيقة يضمن ألا تُكتب الصورة/الخط مرتين، ومسار التصادم
  لا يُفقد صورة (يُلحق `-2` بدل الاستبدال).
- **الخطوط تُجمع من كل الصفحات** في المشروع (لا الصفحة الحالية فقط) لأن ملفات HTML تتشارك مجلد الأصول.
- **inline للمعاينة** يحافظ على تجربة «ملف HTML واحد» بلا مجلدات.
- **external للمشروع** يعطي حجماً أصغر للصفحات وقابلية تخزين مؤقت للأصول.
- `font-display: swap` لتجنّب نص غير مرئي.
- أسماء ملفات الخطوط مبنية على `cssClassSlug` (أحرف صغيرة، مسافات ← `-`) لتوافق أنظمة الملفات.

## التحقق (2026-10-19)
- `tests/engine/web-builder/export-assets.test.ts`: **14 اختباراً** تغطي المسارات، بصمات الخطوط،
  `parseImageDataURL`، المخزن (تكرار/تصادم/ترتيب)، الحلّالين، `rewriteImageAttrs`،
  `fontFaceCSS` (inline/external)، و`pageNodeIds`.
- `bun test ./tests/engine/web-builder`: **104/104** ✅.
- `bun run check:vue`: exit 0 ✅.
- `bun run test:dupes`: 0 نسخ ✅.
- oxlint للوحدة والاختبار: 0 أخطاء؛ `WebBuilderPanel.vue` بلا تشخيصات جديدة (53 مقابل 55 قبل التعديل).
- تحقق حيّ على `/sample` عبر Playwright:
  - Generate HTML: `4 font faces embedded`، أربع قواعد `@font-face` بخط Inter base64.
  - Create Project (مجلد وهمي): كُتب `index.html` (15,225 بايت)، `about.html` (10,533)،
    وأربعة ملفات `assets/fonts/inter-*.ttf`، وروابط HTML كلها نسبية إلى `assets/fonts/`.
  - لا أخطاء صفحة.

## القيود المعروفة
- نموذج `/sample` الحالي لا يحتوي صوراً، لذا مسار صور المشروع مغطّى باختبارات الوحدة فقط
  حتى يُضاف عنصر بصورة إلى النموذج أو تصميم المصمم.
- ملف `WebBuilderPanel.vue` ما زال يتجاوز 600 سطر (دَين قائم)؛ استخراج جمع المشروع
  إلى وحدة مستقلة مرشّح لمرحلة لاحقة.
