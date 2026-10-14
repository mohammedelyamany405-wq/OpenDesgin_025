# أرشيف: محرك التصدير (Export Engine)

## 1. مسار البيانات (Data Flow)
```
SceneNode → sceneNodeToDesignNode() → tagNameForNode() → DesignNode → serializeElement() → HTML string
```

- كل عنصر في المشهد (SceneNode) يتحول إلى DesignNode (中间 AST)
- دالة `tagNameForNode()` تحدد وسم HTML للعنصر
- دالة `serializeElement()` تحول DesignNode إلى نص HTML نهائي

## 2. الملفات والدوال الرئيسية

| الملف | الدالة | الوظيفة |
|-------|--------|---------|
| `packages/dom-css/src/from-scene-graph.ts` | `tagNameForNode` | تحديد وسم HTML للعنصر (div/img/مخصص) |
| `packages/dom-css/src/from-scene-graph.ts` | `customHTMLTag` | قراءة الوسم المخصص من pluginData |
| `packages/dom-css/src/from-scene-graph.ts` | `sceneNodeToDesignNode` | تحويل SceneNode إلى DesignNode |
| `packages/dom-css/src/serialize.ts` | `serializeElement` | تحويل DesignNode إلى نص HTML |
| `packages/dom-css/src/html-export.ts` | `exportHTMLBundle` | API التصدير الرئيسي |

## 3. آلية القراءة من PluginData (محدّثة)

المفاتيح الموحدة (`pluginId = 'open-pencil'`):

| المفتاح | القيمة | مثال |
|---------|--------|------|
| `web-builder-tag` | string مباشرة | `header` |
| `web-builder-classes` | JSON array | `["container","flex-center"]` |
| `web-builder-layout` | JSON object | `{type:'flex',direction:'row',...}` |
| `web-builder-decorative` | `'true'` أو غائب | `'true'` |
| `web-builder-breakpoints` | JSON على عقدة الصفحة | `{tablet:768,mobile:375}` |

```typescript
function tagNameForNode(node: SceneNode): string {
  if (isDecorative(node)) return 'div'   // الزخرفي دائماً div
  const customTag = customHTMLTag(node)  // قراءة web-builder-tag
  if (customTag) return customTag
  const fill = node.fills.at(0)
  if ((fill?.type === 'IMAGE' || imageSourceURL(node)) && node.childIds.length === 0)
    return 'img'
  return 'div'
}
```

`attrsForNode` يضيف: `class` من `web-builder-classes` + `aria-hidden="true"` للزخرفي
+ دمج `web-builder-attrs` (نية المصمم تغلب fill الصورة).
`styleFromSceneNode` يطبق `web-builder-layout` (flex/grid) قبل fallback على `layoutMode`.
التسلسل يهرب الخصائص (`escapeAttr`) — ولوحة التصدير تهرب بـ `escapeAttrValue`.

## 4. تصدير اللوحة (Panel Export في WebBuilderPanel)

`generateExport` يقرأ كل عقدة طازجة عبر `readNodeMeta` (لا يعتمد على كاش التحديد):

1. بوابة الأخطاء الحرجة → منع + زر Go to Validate.
2. التحذيرات → حوار Proceed anyway / Fix first.
3. بناء HTML بالوسوم + `aria-hidden` للزخرفي.
4. بناء `<style>`:
   - تعريفات الكلاسات المستخدمة فقط (من كتالوج `classCategories`).
   - `.wb-<id>` لكل عنصر له layout معلن (flex/grid).
   - `@media (max-width)` فقط للتجاوزات المصرحة (tablet/mobile direction).

## 5. القيود والملاحظات الهامة

- **pluginId ثابت:** `open-pencil` في كل المفاتيح.
- **الافتراضي:** `div` إذا لا يوجد pluginData.
- **الأولوية:** زخرفي > وسم مخصص > image check > div.
- **لا تخمين:** media queries تُولد فقط من قيم صرح بها المصمم.
- **التوافق:** العناصر بدون pluginData تبقى div بلا كلاسات.

## 6. المرحلة 1 — تصدير النص + التعليقات + المعاينة (2026-10-08)

### الوحدات الجديدة (نقية، قابلة للاختبار)
| الملف | الدوال | الوظيفة |
|-------|--------|---------|
| `src/app/web-builder/export-format.ts` | `tagLabelAr`, `escapeText`, `escapeAttrValue`, `isVoidTag`, `shouldComment`, `elementComment` | تنسيق تسلسل HTML: هروب، ترجمة الوسم للعربية، وقاعدة التعليق |
| `src/app/web-builder/export-rules.ts` | `hasExportableContent`, `collectCriticalErrors`, `collectWarnings` | قواعد البوابة (حرج/تحذير) + كشف الصفحة الفارغة |

### مسار اللوحة (محدّث)
```
domTreeData (يقرأ node.text أيضاً) → generateExport → nodeToHtml → HTML
```

1. `readNodeMeta` يقرأ الآن `n.text`، و`buildNode` يمرّره في الشجرة.
2. `nodeToHtml` يطبع النص داخل العنصر (`escapeText`)، ويُخرج العناصر الفارغة
   (`isVoidTag`: img/br/hr…) بلا وسم إغلاق، ويُسبق كل عنصر دلالي بتعليق ثنائي.
3. `generateExport` يعيد سلسلة HTML (أو `''`) — لتمكين المعاينة.
4. `previewExport` يفتح HTML في تبويب جديد عبر `Blob` + `URL.createObjectURL`.

### فصل البناء عن البوابة (بإقرار المصمم)
- `buildExportHtml(tree)` تبني HTML/CSS نقياً من الشجرة **بلا بوابة**.
- `generateExport` = بوابة (حرج/تحذير) ثم `buildExportHtml`.
- `previewExport` = `buildExportHtml` مباشرة → يعرض ما بنيته الآن حتى لو نقص header/main/footer.

### قاعدة التعليق الثنائي
- الشكل: `<!-- EN: Name <tag> | AR: Name (اسم الوسم العربي) -->`.
- يُطبَّق على الدلالي والحاويات فقط (`tag !== 'div'`)، ويُلغى للعنصر الزخرفي.

### الحالات الحدّية (بوابة G1)
- **صفحة فارغة:** `hasExportableContent=false` → رسالة «Page has no elements to export» بلا حوار.
- **ملف قديم بلا pluginData:** يُعامل كـ `div` (السلوك القديم)، وتظهر تحذيرات وسوم ناقصة.
- **صورة inline ضخمة (> `MAX_INLINE_IMAGE_BYTES`):** تُرفَع كتحذير عند التصدير (بالإضافة لحد TagsTab عند الإدخال).
- **زخرفي بوسم أساسي:** لا يُحتسب في بوابة header/main/footer لأن المخرج يحوّله إلى `div`.

## 7. المرحلة 2 — مشروع متعدد الصفحات + ربط الصفحات (2026-10-10)

### الوحدة الجديدة (نقية، قابلة للاختبار)
| الملف | الدوال | الوظيفة |
|-------|--------|---------|
| `src/app/web-builder/project.ts` | `slugify`, `buildProjectContext`, `resolvePageHref`, `PageInput`, `ProjectContext` | تخصيص أسماء ملفات فريدة لكل صفحة + حلّ روابط الصفحات |

**قواعد التسمية:**
- `slugify` يحفظ حروف Unicode (الأسماء العربية تنجو)، يزيل التشكيل، يجمع الرموز في `-`.
- الصفحة الرئيسية (`isHome`) → `index.html` دائماً؛ اسم `index` محجوز لغيرها فلا يتصادم.
- التصادم يُحلّ بلاحقة رقمية: `about`, `about-2`, …

### مسار اللوحة (محدّث)
```
readAllPagesMeta → buildProjectContext → buildExportHtml(tree, {title,lang,desc,ctx}) → ملف
```

1. `buildNode`/`buildPageTree(pageId)` تُبنى مرة واحدة وتُعاد لكل صفحة.
2. `buildExportHtml` صار يستقبل `BuildOptions` (title/lang/description/ctx) بدل قراءة
   `pageTitle` العالمية — يسمح ببناء ملفات عدة صفحات في نداء واحد.
3. عند التصدير: `node.pageLink` يُحلّ إلى `href` نسبي عبر `resolvePageHref` (الصفحات كلها في جذر المشروع).
4. `collectProjectFiles` يبني ملفات كل الصفحات القابلة للتصدير؛ الصفحة ذات خطأ حرج تُتخطى مع سبب.
5. `createProject`: كتابة مباشرة في مجلد (`showDirectoryPicker`، يتطلب Chrome/Edge)،
   وبديل **ZIP** عبر `fflate.zipSync` عند غياب الواجهة أو إلغاء المستخدم.

### ربط الصفحات (UI)
- في `TagsTab.vue`: عند وسم عنصر `<a>` تظهر قائمة **«Page Link / اربط بصفحة»** تسرد الصفحات
  الأخرى؛ الاختيار يخزّن معرّف الصفحة الهدف في `web-builder-page-link`.
- مفتاح مشترك: `PAGE_LINK_KEY` مُصدَّر من `tag-attrs.ts` (يُستعمل في اللوحة وTagsTab).

### إعدادات مستوى الصفحة (UI)
- Page Settings في تبويب Export: **File slug** + **Home page** (checkbox)، تُحفظ ضمن `web-builder-page`.

### اختبارات
- `tests/engine/web-builder/project.test.ts`: 11/11 — التسمية، exclusivity، الرئيسية، روابط.

## 8. المرحلة 3 — تصدير التنسيق البصري (2026-10-11)

### الهدف
ضمّ الخصائص البصرية الفعلية للعناصر (ألوان، حدود، زوايا، ظلال، ضبابية، خطوط) إلى الـCSS
المولّد، ليصبح المخرج شبيهًا بالتصميم بدل الأسود-على-أبيض في المرحلتين 1 و2.

### الوحدة الجديدة (نقية، قابلة للاختبار)
| الملف | الدوال | الوظيفة |
|-------|--------|---------|
| `src/app/web-builder/export-style.ts` | `visualStyleDeclarations`, `NodeStyleSource` | تحويل خصائص العقدة البصرية إلى تصريحات CSS |

**الاعتماديات:** أنواع `Fill`/`Stroke`/`Effect`/`Color` من `@open-pencil/scene-graph`،
و`colorToCSS` من `@open-pencil/core/color` (culori — لا نعيد اختراع تحويل الألوان).

**المخرجات المدعومة:**
- **المقاسات** → `width`/`height` بالبكسل + `box-sizing: border-box`، و`overflow: hidden` عند `clipsContent`.
  (لا تُصدَّر الإحداثيات x/y للعناصر الجذرية؛ راجع «الوضع الحرّ» أدناه.)
- `SOLID` fill → `background-color` (أو `color` لعقدة `TEXT`)، والشفافية = `color.a × fill.opacity`.
- Stroke → `border: <weight>px <solid|dashed> <color>` (dashed عند وجود `dashPattern`).
- الزوايا → `border-radius` (موحّد أو أربع قيم عند `independentCorners`).
- الظلال → `box-shadow` موحّد يجمع `DROP_SHADOW` و`INNER_SHADOW` (الأخير بـ`inset`).
- الضبابية → `filter: blur()` لـ`LAYER_BLUR` و`backdrop-filter` لـ`BACKGROUND_BLUR`.
- الشفافية → `opacity` عند `opacity < 1`.
- الخطوط (TEXT فقط) → `font-family/font-size/font-weight/font-style/line-height/letter-spacing/text-align/text-transform/text-decoration`.

**قاعدة «لا تخمين»:** تُصدَّر القيم المصرَّح بها فقط. (كانت التدرجات وتعبئات الصور غير مدعومة
عن قصد في هذه المرحلة، وأُنجزت لاحقاً في المرحلة 4 — القسم 9.)

### الوضع الحرّ (Free-form placement)
المشكلة المُشخَّصة: الأشكال المركّبة (مجموعة تحتوي مستطيل الخلفية + النص) كانت تخضع لتدفّق HTML
العمودي فتظهر فوق بعضها لا متراكبة. الحلّ (استنساخ أمين للتصميم، لا استنتاج تخطيط):
- أي حاوية **بلا** تخطيط flex/grid مصرَّح به تُعلَّم `position: relative`، وأبناؤها المباشرون
  يُوضَعون `position: absolute` بـ`left/top` = إحداثياتهم المحلية (`node.x/y` نسبةً للأب).
- الحاويات **ذات** flex/grid تبقى تدفّقاً عادياً وتُحترم تصريحاتها.
- يُضاف أساس `body { margin: 0; position: relative; }` كي تنطبق الإحداثيات على الصفحة بلا هامش افتراضي.
- هذا لا يخالف قاعدة «لا تحويل من X,Y»: نحن لا نستنتج flex/grid من الإحداثيات، بل ننسخ ترتيب التصميم الحرّ عند غياب تصريح التخطيط.

### مسار اللوحة (محدّث)
`buildNode` صار يخزّن `style: visualStyleDeclarations(n)` و`x`/`y` لكل عقدة. عند بناء CSS:
تندمج تصريحات التصميم (`cssForLayout`) + التنسيق البصري + قواعد الوضع الحرّ في صنف `wb-<id>` واحد.

### قيود معلنة
- التدرجات وتعبئات الصور: أُنجزت في المرحلة 4 (القسم 9).
- الحجم ثابت من لقطة التصميم (لا سلوك responsive للحاويات الهاجّة/FILL تلقائياً).

### اختبارات
- `tests/engine/web-builder/export-style.test.ts`: 14/14 (مقاسات، ألوان، حدود، زوايا، ظلال، ضبابية، شفافية، خطوط، تخطي التدرج).

## 9. المرحلة 4 — التدرجات + صور/أصول (2026-10-13)

### الهدف
إكمال المؤجَّل في المرحلة 3: تحويل تعبئات **التدرجات** (`GRADIENT_*`) و**الصور** (`IMAGE`)
إلى CSS بدل تجاهلها.

### الوحدة المحدّثة (نقية، قابلة للاختبار)
| الملف | الإضافة | الوظيفة |
|-------|---------|---------|
| `src/app/web-builder/export-style.ts` | `visualStyleDeclarations(node, resolveImage?)`, `ImageResolver`, `fillDeclarations`, `gradientCss` | تعبئات التدرج والصور → CSS |

**دلالات التدرج (مطابقة حرفية لـ`packages/core/src/canvas/fills.ts`):**
- `gradientTransform` مصفوفة (`m00,m01,m02,m10,m11,m12`) تعيّن المربع الواحد `[0,1]`.
- **خطي:** المُصيّر يضع أول محطة عند `((m00+m02)w,(m10+m12)h)` ويسير نحو `(m02·w,m12·h)`،
  أي الاتجاه `(-m00·w, -m10·h)`. زاوية CSS (مع عقارب الساعة من الأعلى): `atan2(dx, -dy)`.
- **شعاعي:** المركز = `scale(w,h)·transform` على النقطة (0.5,0.5)، نصف القطر 0.5 → بيضاوي `rx,ry`.
- **زاوي:** `conic-gradient(from <start> at <center>)`؛ `GRADIENT_DIAMOND` → radial (المُصيّر يرسمه radial).
- تدرّج بلا `gradientStops` أو بلا `gradientTransform` = يُتخطّى (كما يفعل المُصيّر).
- شفافية كل محطة = `stop.color.a × fill.opacity` (لمطابقة `setAlphaf(fill.opacity)`).

**الصور:**
- `imageDeclarations` تُخرج `background-image: url("<resolved>")` + `background-position: center`
  + حسب `imageScaleMode`: `FILL`/`CROP`→`cover`, `FIT`→`contain`, `TILE`→`repeat`؛ و`no-repeat` لغير TILE.
- `resolveImage` واجهة حقن (`hash → cssUrl`) تُبقي الوحدة نقية وقابلة للاختبار بـ fake resolver.

### قرار الأصول
- الصور تُصدَّر **inline كـ data URL** (مضمّنة) في Preview والمشروع معاً — ملف HTML واحد قابل للنقل.
- تدويرها كملفات أصول منفصلة داخل مجلد المشروع = تحسين لاحق مُعلن.

### الاعتماديات (إعادة استخدام، بلا تكرار)
- `encodeBase64` من `@open-pencil/core/bytes`.
- `detectImageMime` — كان محلياً في `packages/core/src/io/formats/svg/defs.ts`، أُصبح مُصدَّراً
  ومُعاداً تصديره من `packages/core/src/io/formats/svg/index.ts`.

### مسار اللوحة (محدّث)
`WebBuilderPanel.vue`: `resolveImageDataUrl(hash)` يبني `data:<mime>;base64,...` من `editor.graph.images`،
ويُمرَّر إلى `visualStyleDeclarations(n, resolveImageDataUrl)` في `buildNode`.

### قيود معلنة
- الزوايا/نصف القطر شعاعياً تقريبية بحكم `objectBoundingBox`؛ الزاوية الخطية تُحسب بدقة.
- لا تصدير لـ`PATTERN`/`NOISE`/`CUSTOM`.

### اختبارات
- `tests/engine/web-builder/export-style.test.ts`: 22/22 (منها 8 جديدة: خطي/رأسي/شفافية/شعاعي/زاوي/نص/صور/بلا resolver).
- `bun test ./tests/engine/web-builder ./tests/engine/dom-css`: 82/82 ✅.
- `bun run check:vue`: نجح (exit 0) ✅.
- `bun run test:dupes`: 0 نسخ ✅ (استُخرج `gradientFrame` لتفادي تكرار مركز التدرج).
