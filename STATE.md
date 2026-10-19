# STATE — مصنع التعديلات المحلية

آخر تحديث: 2026-10-19
المرحلة الحالية: المرحلة 7 — الأصول والخطوط — كود مكتمل ومُتحقَّق، بانتظار الإقرار البصري.
المرحلة 6: كود مكتمل ومُلتزم (`503d086`)؛ النموذج التجريبي مُلتزم (`8ae9ad0`) بانتظار الإقرار البصري.
المرحلة 5: **مُغلقة** بتوجيه المصمم للمتابعة (2026-10-13) — Responsive للمقاسات الثلاثة.
المرحلة 4: **مُقَرّة ومُغلقة** بإقرار المصمم (2026-10-13) — التدرجات + الصور.
المرحلة 3: مُغلقة (التنسيق البصري + الوضع الحرّ) — أُقِرّت ضمن المرحلة 4.
المرحلة 1: مُقَرّة بصرياً من المصمم (2026-10-11) — تصدير النص + التعليقات + Preview يعمل.
المرحلة 2: مُقَرّة بصرياً (2026-10-11) — قائمة «اربط بصفحة» تعمل (لقطة: Rectangle موسّم <a> مرتبط بـ Aboutus).

## المرحلة 7 — الأصول والخطوط (2026-10-19) — بانتظار الإقرار البصري

### الهدف (اختيار المصمم)

تصدير مشروع قابل للنشر: الصور كملفات `assets/images/*`، والخطوط المستخدمة كـ`@font-face`
(مضمّنة في المعاينة، وملفات `assets/fonts/*` في مشروع/ZIP). التصميم: `DataBase/Assets_Fonts_Phase7_Architecture.md`.

### المنجز (كود)

- `src/app/web-builder/export-assets.ts` (جديد): مسارات الأصول، كشف صيغة الخط،
  `parseImageDataURL`، `ExportAssetStore` (منع التكرار + تجنّب تصادم المسارات)،
  حلّالا الصور inline/external، `rewriteImageAttrs`، `loadExportFonts`، `fontFaceCSS`، `pageNodeIds`.
- `WebBuilderPanel.vue`: `buildPageTree/buildNode` يحملان `TreeAssets`؛
  `inlineAssets()`/`externalAssets(store)`؛ `generateExport`/`previewExport` async مع خطوط؛
  `collectProjectFiles()` async يجمع خطوط كل الصفحات + ملفات الأصول؛
  `ProjectFile{name, content: string|Uint8Array}`؛ كتابة مجلدات متداخلة؛ ZIP يدعم البايتات.
- أُزيل `domTreeData` غير المستخدم، وأُصلحت تسميات `URL/CSS` لتوافق oxlint.

### التحقق

- `tests/engine/web-builder/export-assets.test.ts` (جديد): **14 اختباراً**.
- `bun test ./tests/engine/web-builder`: **104/104** ✅.
- `bun run check:vue`: exit 0 ✅. `bun run test:dupes`: 0 نسخ ✅.
- oxlint: الوحدة والاختبار 0 أخطاء؛ اللوحة بلا تشخيصات جديدة (53 مقابل 55 قبل التعديل).
- Playwright على `/sample`: Generate HTML = 4 خطوط base64؛
  Create Project (مجلد وهمي) = `index.html` + `about.html` + 4 ملفات `assets/fonts/inter-*.ttf`
  وروابط نسبية صحيحة، بلا أخطاء صفحة.

### المطلوب من المصمم

1. اختر عنصراً فيه نص ← Export ← **Generate HTML** وتأكد أن الخط يظهر بلا إنترنت.
2. **Create Project** (مجلد) أو ZIP، وافتح `index.html` من المجلد: يجب أن تظهر الخطوط.
3. إن أضفت صورة بتعبئة IMAGE لاحقاً، تحقق من ظهورها تحت `assets/images/` في المشروع.
4. أقرّ بصرياً لإغلاق المرحلة 7.

### نقطة التوقف

- الكود مكتمل ومُتحقَّق؛ بانتظار إقرار المصمم.
- بعد الإقرار: تحويل `/sample` إلى ملف `.fig` ثابت، ثم الرفع وإرسال رابط المعاينة.

### النموذج الثابت `/sample` (2026-10-19)

- وُلِّد `public/web-builder-sample.fig` (115KB) من النموذج الحالي عبر زر Download .fig.
- `WorkspaceView.vue` صار يحمّل الملف عبر `fetch('/web-builder-sample.fig')` ثم `store.openFigFile`،
  ويحدّد صفحتي Home/About للتنقل. لم يبقَ البناء البرمجي هو المسار الافتراضي.
- للإبقاء على إمكانية إعادة التوليد: `/sample?build=1` يبني النموذج من الكود، ثم Download .fig
  لاستبدال الملف في `public/`.
- تحقق حيّ: طلب الملف 200، صفحتا Home/About تعملان، تنزيل `.fig` من جديد = 115KB، بلا أخطاء صفحة.
- **تم الدفع** إلى `origin/261007-chore-phase0-baseline` (كوميتات `4fcd0a1` و`5f9c22e`).
- رابط المعاينة: `https://1420-a0f68bd7b936f16b.monkeycode-ai.live/sample` (فحص: 200، والملف 200 بحجم 116,966 بايت).

### إصلاح «لم يفتح النموذج» (2026-10-19)
- السبب: فتح الملف كان يستغرق ~12 ثانية بلا أي مؤشر، فيظهر المحرر فارغًا ويظن المصمم أنه لا يعمل.
- الحل:
  - تراكب تحميل عربي («جارٍ فتح النموذج الثابت…») + رسالة خطأ مع زر إعادة المحاولة (Teleport إلى body).
  - تمرير `{ worker: false }` لملف النموذج الصغير: تجاوز بدء عامل التحليل الذي كان يستهلك ~8 ثوانٍ.
  - `refreshDocumentFontStatus()` بعد التحميل لإزالة تحذير «4 font faces unavailable» الكاذب.
  - تقديم نسخة الإنتاج (`vite build` + `vite preview` على المنفذ 1420) بدل خادم التطوير البطيء.
- النتيجة: التحميل الكامل 5–10 ثوانٍ مع مؤشر واضح، بلا أخطاء، وبلا تحذير خطوط.
- إضافة إلى API: `ParseFigFileOptions.worker?: boolean` (افتراضيًا يعمل العامل).

---

## النموذج التجريبي `/sample` (2026-10-19) — جاهز للمراجعة البصرية

### الهدف

نموذج واقعي يُظهر كل قدرات Web Builder على صفحتين (Home/About) بدل الأشكال المجرّدة:
وسوم دلالية، Flex، أصناف قابلة لإعادة الاستخدام، تجاوزات صريحة للتابلت/الموبايل،
روابط صفحات، وتنزيل ملف `.fig` جاهز للمتابعة. لا يغيّر الإقلاع الافتراضي؛ يُحمَّل فقط
عبر المسار المخصص `/sample`، ومن ملف `public/web-builder-sample.fig` الثابت (وليس بناءً برمجياً).

### المنجز

- `src/app/demo/sample/palette.ts`: ألوان النموذج + تعبئات/حدود/ظلال مشتركة.
- `src/app/demo/sample/web.ts`: ثوابت مفاتيح pluginData، مساعدا `frame()`/`text()`،
  و`setPageMeta`/`setBreakpoints`/`setStyleClasses`.
- `src/app/demo/sample/chrome.ts`: هيدر وفوتر مشتركان (nav + brand + copyright).
- `src/app/demo/sample/home.ts`: Hero + 3 كروت + CTA.
- `src/app/demo/sample/about.ts`: مقدمة + قصة + كارت قيم.
- `src/app/demo/sample/shared.ts`: هياكل الأقسام/المحتوى/الكروت، والتصريحات المتجاوبة.
- `src/app/demo/sample/document.ts`: بناء الصفحتين + الميتاداتا + الأصناف + `computeAllLayouts`.
- `src/router.ts`: مسار `/sample` (`meta.sample`).
- `src/views/WorkspaceView.vue`: تحميل `web-builder-sample.fig` + شريط Home/About/Download .fig
  (`?build=1` يعيد البناء من الكود لتوليد نسخة جديدة).
- `tests/engine/web-builder/sample.test.ts`: 8 اختبارات (بنية/ميتاداتا/أصناف/روابط/تجاوب).

### قرارات

- نقاط التوقف في النموذج: Tablet=768، Mobile=480 (ليشمل الموبايلات الشائعة 390px).
- أضيف إلى مخطط Responsive: `height:'auto'` و`padding` — لأن الأقسام ذات الارتفاع
  الثابت كانت تتداخل/تُقصّ على المقاس الأصغر. طُبّقا أيضاً في واجهة `ResponsiveSection`.
- Desktop مضغوط بصرياً: ارتفاع قسم الميزات 640 (بدل 1080) لإزالة الفراغ الكبير.
- النموذج يستخدم `textAutoResize:'HEIGHT'` و`lineHeight` رقمياً، وخط Inter.

### التحقق

- `bun test ./tests/engine/web-builder`: **90/90** ✅.
- `bun run check:vue`: نجح (exit 0) ✅.
- `bun run test:dupes`: 0 نسخ ✅.
- oxlint للملفات المعدّلة/الجديدة: 0 أخطاء ✅.
- تصدير فعلي عبر Playwright: Home ~14.3KB، About ~9.9KB، warnings=[]، page errors=[].
- لقطات Desktop/Tablet/Mobile للصفحتين: لا تداخل، لا قصّ، الهيدر يخفي الـnav على الموبايل،
  والفوتر يتراص عمودياً.

### المطلوب من المصمم

1. افتح `/sample`، تنقّل بين Home/About، وراجع اللقطات (Desktop/Tablet/Mobile).
2. اضغط **Download .fig** وتأكد من فتح الملف في OpenPencil مع بقاء الطبقات والأصناف.
3. أقرّ بصرياً (أو اطلب تعديلاً) لإغلاق المرحلة 6.

### نقطة التوقف

- النموذج مكتمل ومُتحقَّق ومُلتزم محلياً (`8ae9ad0`).
- لم يُدفع شيء إلى الريموت بانتظار موافقة المصمم.

---

## المرحلة 6 — نظام Classes منظم (2026-10-13) — كود مكتمل، بانتظار الإقرار البصري

### الهدف (اختيار المصمم)

تقليل تكرار CSS ورفع القراءة: أسماء أصناف من اسم الطبقة، دمج القواعد المتطابقة،
وحفظ التنسيق البصري كصنف قابل لإعادة الاستخدام. التصميم: `DataBase/Classes_Phase6_Architecture.md`.

### المنجز (كود)

- `class-catalog.ts` (جديد): نُقل كتالوج الأصناف الجاهزة من اللوحة + `catalogClassCSS`/`catalogClassNames`.
- `class-names.ts` (جديد): `cssClassSlug` (يدعم العربية)، `createClassNamer` (تفرّد + أسماء محجوزة)،
  و`createRuleClassRegistry` (صنف واحد لكل مجموعة قواعد متطابقة).
- `style-classes.ts` (جديد): تخزين أصناف الصفحة في `web-builder-style-classes`، قراءة/إضافة/حذف/css.
- `export-style.ts`: أُضيف `visualOnlyDeclarations` (بلا مقاس) — يُستخدم لحفظ الأصناف.
- `ClassesTab.vue` (جديد): «Applied» + «My Classes» (تطبيق/حذف) + حقل حفظ + الكتالوج.
- `WebBuilderPanel.vue`: التصدير يولّد أسماء من اسم الطبقة بدل `wb-<id>`، يدمج القواعد المتطابقة،
  ويُخرج أصناف «أصنافي» المستخدمة بعد قواعد العناصر (فتتغلب عليها)، قبل `@media`.

### قرارات

- أسماء الأصناف من `node.name`؛ الاسم الفارغ ← `el`، والبدء برقم ← `el-...`.
- دمج القواعد مفتاحه (القواعد الأساسية + التابلت + الموبايل) — المواضع الحرّة المختلفة لا تُدمج.
- الصنف المخصص يتغلب على قواعد العنصر (ترتيب CSS)؛ تعديل بصري بعد تطبيق صنف لا يظهر
  ما دام الصنف يحدد نفس الخاصية — يُزال الصنف للتحرير الحر.
- حفظ الصنف يستثني الصور (لا تكرار data URL في سجل الصفحة) والمقاس/التخطيط/الموضع.

### التحقق

- `bun test ./tests/engine/web-builder`: **90/90** ✅ (تشمل اختبارات النموذج الجديدة).
- `bun run check:vue`: نجح (exit 0) ✅.
- `bun run test:dupes`: 0 نسخ ✅.
- oxlint: الملفات الجديدة 0 أخطاء؛ اللوحة بلا تشخيصات جديدة (56→56 قبل/بعد) ✅.

### الاختبار البصري المطلوب من المصمم (المرحلة 6)

1. اختر عنصراً منسّقاً (كارت بتعبئة/حدود/استدارة) ← تبويب **Classes**.
2. اكتب اسماً (مثل `card`) ← **Save current style**؛ تحقق من ظهوره في My Classes وتطبيقه.
3. اختر عنصراً آخر ← اضغط الصنف `card`؛ يجب أن يكتسب مظهره البصري.
4. ثبّت عنصرين متطابقتين ← Export ← Preview: تحقق من عدم وجود `wb-` في الكود،
   ومن ظهور اسم مفهوم (`card`)، ومن قاعدة CSS واحدة مشتركة للعنصرين.
5. سلّم لقطة/كود للإقرار.

### نقطة التوقف

- الكود مكتمل ومُتحقَّق؛ بانتظار الإقرار البصري من المصمم.
- لم يُدفع شيء إلى الريموت.

---

## المرحلة 5 — الاستجابة للمقاسات الثلاثة (Responsive) — مُغلقة

### القرار (بإقرار المصمم)

منهج **التصريح الصريح لكل مقاس** (لا سلوك مرن تلقائي) — مطابقةً لقاعدة «لا تخمين».
التصميم الكامل: `DataBase/Responsive_Phase5_Architecture.md`.

### المنجز (كود)

- وحدة نقية جديدة `src/app/web-builder/responsive.ts`: `readResponsive(layout)` (يقرأ `responsive`
  ويحوّل الحقول القديمة `tabletDirection`/`mobileDirection`) و`responsiveDeclarations(overrides)`.
- مكوّن جديد `ResponsiveSection.vue`: أزرار Desktop/Tablet/Mobile، ولكل مقاس صرّح بـ
  Direction / Hidden / Width / Justify / Align / Gap / Grid Columns (الفارغ = Inherit).
- `LayoutTab.vue`: حُذفت صفوف Tablet dir / Mobile dir القديمة، وأصبحت كتاباته تحفظ `responsive`.
- `WebBuilderPanel.vue`: `buildExportHtml` يُخرج تجاوزات Tablet/Mobile المُصرَّح بها فقط داخل
  `@media (max-width: ...)` (الموبايل بعد التابلت)، ويُضيف صنف `wb-<id>` لأي عنصر له تجاوز.
  قاعدة أمان: `img, svg { max-width: 100%; height: auto; }`.

### التحقق

- `tests/engine/web-builder/responsive.test.ts`: 8/8 ✅ (قراءة/ترحيل/تصريحات).
- `bun test ./tests/engine/web-builder ./tests/engine/dom-css`: **90/90** ✅ (لا انحدار).
- `bun run check:vue`: نجح (exit 0) ✅.
- `bun run test:dupes`: 0 نسخ ✅.

### الاختبار البصري المطلوب من المصمم (المرحلة 5)

1. صمّم حاوية Flex فيها 3 كروت (Desktop: صف واحد).
2. تبويب Layout ← قسم **Responsive** ← Tablet: Direction=Column؛ Mobile: Direction=Column + Width=Full.
3. تبويب Export ← **Preview**: صغّر نافذة المتصفح — يجب أن تتراص الكروت عمودياً بعرض الشاشة.
4. جرّب Hidden=On لأحد العناصر على Mobile للتأكد من اختفائه.
5. سلّم لقطة للإقرار.

### نقطة التوقف

- **مُغلقة بتوجيه المصمم للمتابعة إلى المرحلة التالية (2026-10-13).**
- نطاق المرحلة 6 حُدِّد لاحقاً من المصمم: «نظام Classes منظم».
- لم يُدفع شيء إلى الريموت.

---

## المرحلة 4 — التدرجات + صور/أصول (2026-10-13) — مُغلقة

### الإغلاق

- **مُقَرّة ومُغلقة بإقرار المصمم المباشر (2026-10-13)** — «نعم يا صديقي أغلق المرحلة الرابعة».
- لا توجد خطة موثّقة للمرحلة 5؛ نطاقها يُحدَّد من المصمم قبل البدء.

### الهدف

إكمال المؤجَّل في المرحلة 3: تحويل تعبئات **التدرجات** (`GRADIENT_*`) و**الصور** (`IMAGE`)
إلى CSS بدل تجاهلها، بحيث يقترب المخرج من التصميم.

### المنجز (كود)

- `src/app/web-builder/export-style.ts`:
  - نوع `ImageResolver` (`(hash) => cssUrl | undefined`).
  - `visualStyleDeclarations(node, resolveImage?)` صار يستدعي `fillDeclarations` (تُرجع `string[]`).
  - **التدرجات:** `linearGradientCss` (زاوية دقيقة من مصفوفة المُصيّر: `angle = atan2(-m00*w, m10*h)`)،
    `radialGradientCss` (مركز ونصفا قطري من `scale(w,h)*transform` على النقطة 0.5,0.5 ونصف قطر 0.5)،
    `angularGradientCss` (conic بـ`from`)، و`GRADIENT_DIAMOND` → radial (المُصيّر يرسمه radial فعلاً).
    تُطابق دلالات `packages/core/src/canvas/fills.ts` حرفياً. تدرّج بلا stops أو بلا transform = يُتخطّى.
  - **الصور:** `imageDeclarations` تنتج `background-image: url("...")` + `background-position: center`
    - `background-size`/`background-repeat` حسب `imageScaleMode` (FILL/CROP→cover, FIT→contain, TILE→repeat).
  - ألوان المحطات تُضرب شفافيتها في `fill.opacity` لمطابقة `setAlphaf` في المُصيّر.
  - النصوص تبقى solid فقط (تُتخطّى تدرجات/صور النص).
- `packages/core/src/io/formats/svg/defs.ts`: تصدير `detectImageMime` (كان محلياً).
- `packages/core/src/io/formats/svg/index.ts`: إعادة تصديره (لا تكرار لالتقاط نوع الصورة).
- `WebBuilderPanel.vue`: `resolveImageDataUrl(hash)` يبني `data:<mime>;base64,...` من `editor.graph.images`
  عبر `encodeBase64` + `detectImageMime`، ويُمرَّر إلى `visualStyleDeclarations` في `buildNode`.

### قرار

- الصور تُصدَّر **inline كـ data URL** (مضمّنة) في Preview والمشروع معاً — ملف HTML واحد قابل للنقل.
  (تدويرها كملفات أصول منفصلة داخل مجلد المشروع = تحسين لاحق.)
- زوايا/نصف قطر CSS تقريبية بحكم طبيعة `objectBoundingBox`؛ الزاوية الخطية هي الخاصية المهيمنة وتُحسب بدقة.

### التحقق

- `tests/engine/web-builder/export-style.test.ts`: **22/22** ✅ (8 اختبارات جديدة للتدرجات/الصور).
- `bun test ./tests/engine/web-builder ./tests/engine/dom-css`: **82/82** ✅ (لا انحدار).
- `bun run check:vue`: نجح (exit 0) ✅.
- `bun run test:dupes`: **0 نسخ** ✅ (استُخرج `gradientFrame` لتفادي تكرار مركز التدرج).

### الاختبار البصري المطلوب من المصمم (المرحلة 4)

1. صمّم شكلاً بتعبئة **تدرّج خطي** (بمحور أفقي ورأسي) وشكلاً بتعبئة **صورة**.
2. تبويب Export ← **Preview**: يجب أن يظهر التدرّج والصورة في مكانهما.
3. سلّم لقطة للإقرار (أو صف الاتجاه إن ظهر معكوساً — التصحيح سطر واحد).

### نقطة التوقف (نهاية جلسة 2026-10-13)

- المرحلة 4 **مُغلقة**. الاختبارات + check:vue + test:dupes خضراء.
- الخطوة التالية: تحديد نطاق المرحلة 5 من المصمم.
- لم يُدفع شيء إلى الريموت (بانتظار موافقة المصمم).

---

## المرحلة 3 — تصدير التنسيق البصري (2026-10-11)

### الهدف (بإقرار المصمم على النطاق)

ضمّ الخصائص البصرية للعناصر إلى CSS: ألوان (Fill SOLID)، حدود (Stroke)، زوايا (Radius)،
ظلال (Drop/Inner)، ضبابية (Blur)، وخطوط (Typography) — ليصبح المخرج شبيهًا بالتصميم.

### المنجز (كود)

- وحدة نقية جديدة `src/app/web-builder/export-style.ts`:
  - `visualStyleDeclarations(node)` + واجهة `NodeStyleSource`.
  - تعتمد `colorToCSS` من `@open-pencil/core/color` وأنواع `Fill/Stroke/Effect/Color` من `@open-pencil/scene-graph`.
  - تغطي: **المقاسات (width/height + box-sizing + overflow)**، fill→background/color، stroke→border،
    radius، box-shadow (drop+inner)، blur، opacity، typography.
- `WebBuilderPanel.vue`: `buildNode` يخزّن `style` و`x`/`y` لكل عقدة، و`nodeToHtml` يدمج:
  تصريحات التخطيط المصرَّح به + التنسيق البصري + **قواعد الوضع الحرّ** في صنف `wb-<id>` واحد.
- **إصلاح علّة «التنسيقات لم تُطبَّق»** (تشخيص المصمم أقرّه): السبب كان غياب المقاسات فتنكمش
  العناصر الفارغة إلى ارتفاع صفر. أُضيف تصدير `width/height` بالبكسل.
- **الوضع الحرّ (Free-form)**: الحاوية بلا flex/grid مصرَّح به → `position: relative` وأبناؤها
  `position: absolute` بإحداثياتهم المحلية، فيتراكب مستطيل الزر مع نصّه كما في التصميم.
  (لا يخالف قاعدة «لا تحويل من X,Y»: نسخ ترتيب حرّ لا استنتاج flex/grid.) أُضيف `body { margin:0; position:relative }`.

### قرار «لا تخمين»

- تُصدَّر القيم المصرَّح بها فقط. **أُنجز في المرحلة 4:** التدرجات (`GRADIENT_*`) وتعبئات الصور
  (كانت مؤجّلة هنا). الإحداثيات (X/Y) تُنقل كما هي في الوضع الحرّ (قاعدة «لا تحويل من X,Y»).

### التحقق

- `tests/engine/web-builder/export-style.test.ts`: 14/14 ✅
- `bun test ./tests/engine/web-builder ./tests/engine/dom-css`: **74/74** ✅ (لا انحدار)
- `bun run check:vue`: نجح (exit 0) ✅

### الاختبار البصري المطلوب من المصمم (المرحلة 3)

1. صمّم عناصر بألوان/زوايا/ظلال، وعنصر نصي بخط ولون وحجم (مثل زر «Group-button»).
2. تبويب Export ← **Preview**: يجب أن تظهر الألوان والزوايا والظلال والخط، ويتراكب المستطيل مع النص.
3. سلّم لقطة للإقرار.

الفرع: `261007-chore-phase0-baseline`

## المرحلة 2 — مشروع متعدد الصفحات + ربط الصفحات (2026-10-10)

### الهدف

تحويل التصدير من صفحة واحدة إلى **مشروع كامل**: لكل صفحة ملف HTML باسم slug،
وربط عناصر `<a>` بصفحات أخرى يُحلّ إلى مسار نسبي.

### المنجز (كود)

- وحدة نقية جديدة `src/app/web-builder/project.ts`:
  - `slugify` (يحفظ Unicode العربي، يزيل التشكيل، يمنع الفراغ)، `PageInput`، `ProjectContext`.
  - `buildProjectContext`: يخصّص slug فريداً لكل صفحة، الصفحة الرئيسية = `index.html`،
    ويُحجز اسم `index` كي لا تصطدم صفحة غير رئيسية بالرئيسية.
  - `resolvePageHref(pageId, ctx)`: يُرجع اسم ملف الصفحة الهدف (روابط نسبية في جذر المشروع).
- `src/app/web-builder/tag-attrs.ts`: إضافة `PAGE_LINK_KEY = 'web-builder-page-link'`.
- `src/global.d.ts`: تعريف `window.showDirectoryPicker`.
- `WebBuilderPanel.vue`:
  - فصل `buildNode`/`buildPageTree(pageId)` لبناء شجرة أي صفحة.
  - `readPageMeta` + `readAllPagesMeta` لقراءة إعدادات كل الصفحات.
  - `buildExportHtml(tree, options)` صار يستقبل `{title, lang, description, ctx}` ويحلّ
    `node.pageLink` إلى `href` عبر `resolvePageHref` قبل التصدير.
  - `collectProjectFiles`: يبني ملفات كل الصفحات القابلة للتصدير، ويتخطى صفحات بها خطأ حرج.
  - `createProject`: كتابة مباشرة في مجلد عبر `showDirectoryPicker`، مع **بديل ZIP**
    عبر `fflate.zipSync` عند عدم توفّر الواجهة. زر **Create Project** أُضيف.
  - Page Settings: حقول **File slug** + **Home page** (checkbox) تُحفظ في `web-builder-page`.
- `TagsTab.vue`: قائمة منسدلة **«Page Link / اربط بصفحة»** تظهر عند وسم `<a>`، تسرد
  الصفحات الأخرى وتربط `PAGE_LINK_KEY` بمعرّف الصفحة الهدف.

### التحقق (بيئة Linux + bun 1.4.2)

- `tests/engine/web-builder/` (export-format + export-rules + project): **33/33** ✅
- `bun run check:vue`: نجح (exit 0) ✅
- خادم المعاينة (Vite) يخدم الوحدات المحدّثة عبر HMR بنجاح.

### الاختبار البصري المطلوب من المصمم (المرحلة 2)

1. أنشئ صفحتين على الأقل (مثلاً `Home` و`About`)، فعّل **Home page** على الأولى.
2. على صفحة `About` ضع نصاً موسوماً `h1`، وفي `Home` أضف عنصراً وسمه `<a>` واربطه بـ `About`.
3. تبويب Export ← **Preview**: يظهر الرابط `href="about.html"`.
4. **Create Project**: اختر مجلداً ← يُكتب `index.html` + `about.html` (أو ZIP بديل).
5. سلّم لقطة للإقرار.

## المرحلة 1 — تصدير النص + التعليقات + المعاينة (2026-10-08)

### الفجوة التي عولجت

- تصدير اللوحة (`generateExport` في `WebBuilderPanel.vue`) كان **يتجاهل النص كلياً**:
  أي نص داخل `node.text` لم يظهر في HTML المولّد. هذه أخطر فجوة في المحرّك.

### المنجز (كود)

- وحدة جديدة نقية `src/app/web-builder/export-format.ts`:
  - `tagLabelAr` (ترجمة الوسم للعربية من `tag-attrs.ts`)، `escapeText`، `escapeAttrValue`،
    `isVoidTag`، `shouldComment`، `elementComment`.
  - التعليق الثنائي: `<!-- EN: Name <tag> | AR: Name (اسم الوسم العربي) -->`.
  - قاعدة التعليق: الدلالي والحاويات فقط (`tag !== 'div'`)، ويُلغى للعنصر الزخرفي.
- `WebBuilderPanel.vue`:
  - `readNodeMeta` يقرأ الآن `n.text`، و`buildNode` يمرّره كـ `text` في شجرة DOM.
  - `nodeToHtml` أصبح: يطبع النص داخل العنصر، ويُخرج العناصر الفارغة (`img`…) بلا وسم إغلاق،
    ويُسبق كل عنصر دلالي بتعليقه الثنائي. حُذفت دالة الهروب المحلية لتفادي التكرار.
  - `generateExport` يعيد الآن سلسلة HTML (أو `''`) لتمكين المعاينة.
  - `previewExport` جديدة: تولّد ثم تفتح HTML في تبويب جديد عبر Blob URL، مع رسائل عربية
    عند حجب النوافذ المنبثقة. زر **Preview** أُضيف بجانب **Generate HTML**.
- وحدة قواعد نقية جديدة `src/app/web-builder/export-rules.ts` (استُخرجت من اللوحة لأجل الاختبار):
  - `collectCriticalErrors` (بوابة header/main/footer + h1 واحد + img بلا أبناء)، مع تصحيح:
    العنصر الزخرفي لا يُحتسب كوسم أساسي (لأن المخرج يحوّله إلى `div`).
  - `collectWarnings` (وسم ناقص، حاوية بلا Flex/Grid، اسم افتراضي، img بلا src، **صورة inline ضخمة**).
  - `hasExportableContent` لكشف الصفحة الفارغة.
- معالجة حالات الحدّية (بوابة G1):
  - صفحة فارغة → «Page has no elements to export» بلا حوار تصدير.
  - ملف قديم بلا pluginData → يُعامل كـ `div` مع تحذيرات (السلوك القائم، موثّق).
  - صورة > `MAX_INLINE_IMAGE_BYTES` → تحذير عند التصدير.

### قرار (بإقرار المصمم — 2026-10-08)

- زر **Preview** يتجاوز بوابة الأخطاء الحرجة/التحذيرات ويعرض البنية والنص الحاليَّين **دائماً**
  (للمراجعة أثناء العمل التدريجي)، بينما يبقى **Generate HTML** صارماً.
- التنفيذ: فُصل بناء HTML في `buildExportHtml(tree)` مستقلة عن البوابة؛ `generateExport` يطبّق
  البوابة ثم يستدعيها، و`previewExport` يستدعيها مباشرة.

### التحقق (بيئة Linux + bun 1.4.2)

- `tests/engine/web-builder/export-format.test.ts`: 7/7 ✅
- `tests/engine/web-builder/export-rules.test.ts`: 15/15 ✅
- `bun test ./tests/engine/web-builder ./tests/engine/dom-css`: **49/49** ✅ (لا انحدار)
- `bun run check:vue`: نجح (exit 0) ✅
- خادم المعاينة (Vite) يخدم الوحدات المحدّثة عبر HMR بنجاح.

### معاينة حيّة (هذه الجلسة)

- الرابط: https://1420-a0f68bd7b936f16b.monkeycode-ai.live (Vite :1420، Terminal `term_1791488260517_10`).
- جسر أتمتة MCP حيّ: `127.0.0.1:7600` + مقبس، 114 أداة (منها `render`، `get_selection`، `get_page_tree`).
  بانتظار فتح المصمم للرابط لربط المتصفح ثم المراقبة من الخلف.
- لزم تعديل `vite/server.ts`: إضافة `allowedHosts: ['.monkeycode-ai.live']`.

### ملاحظة التنسيق

- لم يُشغَّل `oxfmt` على `WebBuilderPanel.vue` (كان سيعيد تنسيق الملف كاملاً = تشويش المراجعة).
  الفرق مقتصر على 39 إضافة / 17 حذفاً في مواضع الميزة فقط. دَين التنسيق القديم للملف قائم كما هو.

### الاختبار البصري المطلوب من المصمم

1. شغّل من `OpenPencil.bat`، وافتح مشروعاً فيه عنصر نصي (مثل `Test2`).
2. حدّد العنصر النصي، وسمِّه من تبويب Tags (مثلاً `h1`)، واكتب نصاً ظاهراً.
3. تبويب Export ← **Generate HTML**: يجب أن يظهر النص داخل الوسم + تعليق ثنائي فوقه.
4. تبويب Export ← **Preview**: يُفتح تبويب HTML أسود على أبيض (بلا ألوان/خطوط — مقصود في هذه المرحلة).
5. سلّم لقطة للنتيجة للإقرار، أو صف الخلل.

### القيود المعلنة لهذه المرحلة

- المعاينة **بنية ونص فقط**: لا ألوان ولا خطوط ولا صور مصمّمة بعد (تأتي في مرحلة لاحقة).
- صفحة واحدة فقط (الصفحة الحالية). تعدد الصفحات = المرحلة 2.

## المرحلة 0 — توحيد المصدر وخط الأساس (2026-10-07)

### اكتشاف حاسم — المصدر

- المستودع الحالي (origin: `github.com/mohammedelyamany405-wq/OpenDesgin_025`) ليس
  مستودع OpenPencil، بل لقطة واحدة `868ff25` بعنوان "snapshot: whole ExProject folder".
- لا يحتوي تاريخ OpenPencil ولا الوسوم: `commit 6faba6e` و`tag web-builder-v0.0`
  غير موجودين محلياً ولا على الريموت (`git ls-remote --tags` فارغ).
- النتيجة: نقطة الرجوع v0.0 موجودة فعلياً على جهاز Windows فقط. مطلوب قرار من المصمم
  حول مصدر الحقيقة (دفع تاريخ OpenPencil + الوسوم، أو اعتماد اللقطة مصدراً).

### المنجز

- تصحيح `DataBase/Tags_Batches.md`: حذف 6 صفوف مكررة (كانت تكرر "لم تبدأ" بعد "تمت").
- حسم صلاحيات `packages/cli/bin/openpencil.js`: أُعيدت إلى `100644`
  (البناء يغيّرها إلى `100755`، وهي حميدة لكنها تُلوّث شجرة العمل).
- فرع عمل: `261007-chore-phase0-baseline`.

### خط الأساس (بيئة تحقق Linux + bun 1.4.2)

- `bun install`: 1992 حزمة ✅
- `bun run build:packages`: نجح ✅
- `bun run check:vue`: نجح (exit 0) ✅
- `bun test ./tests/engine/dom-css`: 27/27 ✅
- `bun run test:unit` (الكامل): لا يكتمل في هذه البيئة — اختبارات تعتمد على أصول
  `.fig/.pen` (LFS) وبيئة متصفح (IndexedDB) واختبار CLI eval يعلّق. ثُبّت `git-lfs`
  وسُحبت الأصول، لكن بعض الاختبارات الثقيلة لا تنتهي. ليست انحداراً في الكود.

### القرار المطلوب

1. مصدر الحقيقة: هل يدفع المصمم تاريخ OpenPencil + الوسوم إلى المستودع، أم نعتمد اللقطة؟
2. المزامنة: فروع على `OpenDesgin_025` (موصى به) بدل النقل اليدوي.

### نقطة التوقف (نهاية جلسة 2026-10-07)

- العمل موقوف هنا بقرار المصمم. المرحلة 0 منجزة محلياً على الفرع
  `261007-chore-phase0-baseline` (commit `2b8d22f` + وسم `phase0-baseline`).
- لم يُدفع شيء إلى الريموت بعد (بانتظار موافقة المصمم).

معلّق بانتظار المصمم:

1. الموافقة على دفع الفرع والوسم إلى `OpenDesgin_025`.
2. حسم مصدر الحقيقة (تاريخ OpenPencil + وسم v0.0 مفقودان هنا).
3. لقطة تشغيل `OpenPencil.bat` على مشروع خط أساس (مثل `Test2`) لإقرار خط الأساس البصري.

الخطوة التالية عند الاستئناف:

- إغلاق المرحلة 0 (الإقرار البصري + قرار المصدر)، ثم بدء المرحلة 1:
  تصدير نص العناصر + تعليقات عربي/إنجليزي (الدلالي والحاويات فقط) + زر Preview لصفحة واحدة.

---

نقطة الرجوع السابقة (على جهاز Windows): tag `web-builder-v0.0` على commit `6faba6e` في projects/openpencil
التسجيل الكامل: snapshots/web-builder-v0.0/RESTORE.md

── تطوير Tags (النقطة 1 من ورقة المصمم) ──
✓ صندوق الاسم: تسمية Layers بصيغة Name-Tag + إعادة تسمية تلقائية مع الوسم
✓ كتالوج خصائص لكل وسم (tag-attrs.ts) + Link مضاف + id/title عامة
✓ صور محلية: Browse + معاينة + حد 1.5MB + بديل URL
✓ التصدير يشمل الخصائص (لوحة + dom-css) مع هروب سليم
✓ تحذير img بلا src في Validate وحوار التصدير
✓ استخراج TagsTab.vue + أرشفة Tags_Tab_Architecture.md
✓ bun run check:vue ✅ + tsc dom-css ✅ + build:packages ✅

## مرحلة المناقشة الحالية

الموضوع: Web Builder Classifier — تحويل Prototypes ← HTML5/CSS3
الحالة: تم بناء Layout Tab بنجاح + تعديل Export Engine
الملف المرجعي: DISCUSSION.md

### ملخص التحسينات المقترحة

1. ربط Pages بـ Frames (كل صفحة لها Breakpoints خاصة)
2. إضافة Breakpoint لكل Style في Tab Styles
3. تحديد الأخطاء الحرجة في Smart Validation
4. التحقق من عدم تداخل Grid/Flex
5. توحيد ملفات JSON في ملف واحد

---

### المنجز السابق (للمرجعية):

── البيئة ──

- ضبط Ollama (KEEP_ALIVE=-1, FLASH_ATTENTION=1, KV_CACHE_TYPE=q8_0, GPU_OVERHEAD=2GB, OLLAMA_ORIGINS=*)
- إنشاء سقالة المصنع + commits (90f4cb0, 9b4562c)
- استنساخ OpenPencil 0.14.0 (MIT) في projects/openpencil
- تثبيت Bun 1.4.0 + bun install (1976 حزمة)
- bun run build:packages ✅ + bun run dev على :1420 ✅

── ربط المصنع ──

- مزوّد Ollama (local) внутри OpenPencil (commits: b31f587, 2a4c072)
- خادم أتمتة MCP يعمل على 7600

── ميزة Web Builder في OpenPencil ──

- pluginData بدلاً من sidecar JSON
- 32 عنصر HTML في كتالوج (elements.ts)
- WebBuilderSection.vue في Inspector
- bun run check ✅ (0 أخطاء)
- Git commit f5ad2a9

── إصلاح إضافة Figma القديمة ──

- 10 إصلاحات (F1–F10) في FIXES.md
- npx tsc --noEmit ✅ + npm run build ✅
- Git commit d4b617f

النموذج: qwen2.5-coder:14b (12GB VRAM)
ملاحظات: لا exe — نسخة الويب تكفي. التغليف مؤجّل.

المنجز (تسلسلي):
── البيئة ──

- ضبط Ollama (KEEP_ALIVE=-1, FLASH_ATTENTION=1, KV_CACHE_TYPE=q8_0, GPU_OVERHEAD=2GB, OLLAMA_ORIGINS=*)
- إنشاء سقالة المصنع + commits (90f4cb0, 9b4562c)
- استنساخ OpenPencil 0.14.0 (MIT) في projects/openpencil
- تثبيت Bun 1.4.0 + bun install (1976 حزمة)
- bun run build:packages ✅ + bun run dev على :1420 ✅

── ربط المصنع ──

- مزوّد Ollama (local) внутри OpenPencil (commits: b31f587, 2a4c072)
- خادم أتمتة MCP يعمل على 7600

── إصلاح إضافة Figma القديمة ──

- تحليل WebExtention + كتابة FIXES.md (10 إصلاحات F1–F10)
- إصلاح الأخطاء الحرجة: neural links, React export, classification race condition
- npx tsc --noEmit ✅ + npm run build ✅
- Git commit d4b617f في مستودع WebExtention

── ميزة Web Builder في OpenPencil ──

- بحث: معرّفات العناصر غير ثابتة عبر الحفظ/إعادة الفتح (تتحول إلى Figma GUIDs)
- قرار: التخزين في node.pluginData (مفتاح 'web-builder') بدلاً من sidecar JSON
- إنشاء كتالوج 32 عنصر HTML (src/app/web-builder/elements.ts) من elements.json
- إنشاء WebBuilderSection.vue (قائمة منسدلة في Inspector)
- تسجيل القسم في DesignPanel.vue
- bun run check ✅ (0 أخطاء)
- Git commit f5ad2a9

النCommit الملتزمة في OpenPencil (3 commits ahead):
f5ad2a9 feat(design): add Web Builder HTML-tag classification section
2a4c072 fix(ai): use 127.0.0.1 for Ollama local provider
b31f587 feat(ai): add Ollama (local) OpenAI-compatible provider

نقطة الاستئناف (الجلسة معلّقة — نكمل غداً):
✓ الميزة مبنية ومُلتزمة وجاهزة للمصادقة البصرية
✓ المحرّك + أولاما يعملان
✓ bun run check:vue ✅

── إصلاح DOM Tree ──
✓ إصلاح مشكلة قراءة Pages فقط (بدون Layers)
✓ إنشاء TreeNodeItem.vue للمكون المتكرر
✓ تحديث DOMTreeTab.vue لقراءة جميع الصفحات
✓ استبدال الإيموجي بأيقونات Lucide
✓ إصلاح visibility: WebBuilderPanel يظهر دائماً (لا يختفي عند عدم التحديد)
✓ bun run check:vue ✅

── بناء Pages Tab ──
✓ إنشاء PagesTab.vue مع الوظائف: عرض/إضافة/حذف/إعادة تسمية/تبديل
✓ تكامل مع DOM Tree (يتحدث عند تغيير الصفحة)
✓ تحديث WebBuilderPanel.vue (إضافة PagesTab + أيقونات Lucide)
✓ تحديث OpenPencil.bat على سطح المكتب
✓ إنشاء DataBase/Pages_Tab_Architecture.md
✓ bun run check:vue ✅

── إصلاح حرج: SplitterGroup Recursion ──
✓ إصلاح "Maximum recursive updates exceeded in component <SpliterGroup>"
✓ السبب 1: WebBuilderPanel كان مكرراً في 3 كتل شرطية (multi-select, single-select, no-selection)
✓ الحل 1: نقل WebBuilderPanel خارج جميع الكتل الشرطية (سطر 188)
✓ السبب 2: أيقونات Dinamikia تستخدم 'lucide/tag' → 'icon-lucide/tag' (فاصلة غير صالحة)
✓ الحل 2: تغيير إلى 'icon-lucide-tag' (بدون فاصلة)
✓ bun run check:vue ✅
✓ Git commits: aaee245, a68b0e1, 37f93af, 5ae66c6, dcc305f

── بناء Layout Tab ──
✓ إنشاء LayoutTab.vue مع: Type Selector (Normal/Flex/Grid)
✓ Flex Container: direction, justify, align, gap, wrap
✓ Grid Container: columns, rows, gap
✓ Child Properties: grow, shrink, basis, align-self
✓ CSS Preview مدمج
✓ تعديلExport Engine لقراءة web-builder-layout من pluginData
✓ إزالة الكود القديم من WebBuilderPanel
✓ bun run check:vue ✅

── بناء Validate Tab ──
✓ إنشاء ValidateTab.vue: essential tags + h1 واحد + img leaf + حاوية بدون Flex/Grid + أسماء افتراضية
✓ النقر على المشكلة يحدد العنصر في Canvas
✓ ربطه في WebBuilderPanel وحذف runValidation القديم
✓ إنشاء DataBase/Validate_Tab_Architecture.md
✓ bun run check:vue ✅ (نظيف)

── ربط Validate بالتصدير ──
✓ بوابة تصدير في generateExport: منع التصدير عند خطأ حرج
✓ نفس قواعد Validate الحرجة (header/main/footer + h1 واحد + img leaf)
✓ زر Go to Validate عند المنع + مسح exportHtml
✓ تحديث DataBase/Validate_Tab_Architecture.md
✓ bun run check:vue ✅ (نظيف)

── إكمال v0.0 ──
✓ تصدير CSS كامل: تعريفات الكلاسات المستخدمة + wb-<id> لكل layout معلن + <style> + media queries للتجاوزات المصرحة فقط
✓ Breakpoints لكل صفحة (web-builder-breakpoints + UI في PagesTab)
✓ تجاوز الاتجاه Tablet/Mobile في LayoutTab (inherit افتراضي = لا إخراج)
✓ Decorative: checkbox في Tags + aria-hidden + تجاهل في Validate + div إجباري في dom-css
✓ ترتيب الوسوم حسب نوع العنصر (TEXT أولا للنصوص)
✓ حوار تحذيرات التصدير: Proceed anyway / Fix first (تأكيد لمرة واحدة)
✓ زر Select untagged + شارات DOM (! صفراء و D رمادية)
✓ كلاسات + aria-hidden في مسار dom-css (attrsForNode)
✓ قراءة pluginData طازجة لكل عقدة في التصدير (إصلاح فقدان كلاسات غير المحدد)
✓ bun run check:vue ✅ + tsc dom-css ✅
✓ أرشفة: Export/Layout/Pages/Validate docs

المؤجل لـ v0.1 (بقرار معلن):

- أدوات Canvas سياقية (Section/Group/Text في Toolbar) — تتطلب جراحة في tool registry
- BEM naming للكلاسات المولدة + توليد CSS من geometry
- جسر Webstudio (بحث موجود، مركون)

التالي: اختبارك الشامل ثم مناقشة التطويرات

ملاحظات التشغيل:

- تشغيل المحرّك: شغّل OpenPencil-Dev.bat أو: cd projects/openpencil; bun run dev
- bun على PATH: C:\Users\Administrator\.bun\bin\bun.exe
- أولاما: OLLAMA_ORIGINS=* + KEEP_ALIVE=-1

أوامر الاستئناف:
cd G:\ForWork\ExProject\projects\openpencil
bun run build:packages # إن تغيرت الحزم
bun run dev # http://localhost:1420
bun run check:vue # فحص TypeScript للأكواد

النموذج: qwen2.5-coder:14b (12GB VRAM)
ملاحظات: لا exe — نسخة الويب تكفي. التغليف مؤجّل.
