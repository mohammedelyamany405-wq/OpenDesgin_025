# أرشيف: الاستجابة للمقاسات الثلاثة (Responsive — المرحلة 5)

## الهدف
جعل مخرج التصدير متجاوباً على ثلاثة مقاسات — **Desktop / Tablet / Mobile** — بحيث
يُصرّح المصمم صراحةً بما يتغيّر على المقاسين الأصغر، بينما يبقى Desktop المرجع الأساسي.

## قرار المنهج (بإقرار المصمم — 2026-10-13)
**التصريح الصريح لكل مقاس** (لا سلوك مرن تلقائي). السبب: مطابقة القاعدة الذهبية «لا تخمين»:
لا يتحرك أي عنصر على Tablet/Mobile إلا ما صرّح به المصمم. الاستثناء الوحيد قاعدة أمان
واحدة لا تخمين فيها: الصور لا تتجاوز عرض شاشتها.

## نقاط التوقف (Breakpoints)
- محفوظة لكل صفحة في `web-builder-breakpoints` بصيغة `{ tablet: number, mobile: number }`.
- الافتراضيات: Tablet = 768px، Mobile = 375px.
- تبقى القيم قابلة للتعديل من تبويب Pages (موجود مسبقاً).

## نموذج البيانات
تُخزَّن التجاوزات داخل نفس مفتاح التخطيط `web-builder-layout` (توافقاً مع البنية القائمة)
في حقل `responsive` مستقل عن حقول Desktop:

```ts
type ResponsiveDevice = 'tablet' | 'mobile'

interface ResponsiveOverrides {
  direction?: 'row' | 'column'        // flex-direction
  hidden?: boolean                    // display: none عند true
  width?: 'auto' | 'full'             // width: auto | 100%
  height?: 'auto'                     // height: auto (يُحرّر ارتفاع الكانفاس الثابت)
  padding?: string                    // padding (مثال "72px 0")
  justifyContent?: string             // justify-content
  alignItems?: string                 // align-items
  gap?: string                        // gap (مثال "12px")
  gridTemplateColumns?: string        // grid-template-columns
}

interface LayoutData {
  // ... حقول Desktop الحالية (type, direction, justifyContent, ...)
  responsive?: { tablet?: ResponsiveOverrides; mobile?: ResponsiveOverrides }
}
```

**التوافق الرجعي:** الحقلان القديمان `tabletDirection`/`mobileDirection` (من v0.0) يُقرآن
ويُحوَّلان إلى `responsive.tablet.direction` / `responsive.mobile.direction` عند القراءة،
فلا تُفقد تصاميم قديمة.

**قاعدة الحقول الفارغة:** أي حقل غير مصرَّح به = `Inherit` = لا يُصدَّر شيء، فيرث العنصر
قيمة Desktop كما هي.

## الوحدة النقية
`src/app/web-builder/responsive.ts`:
| الدالة | الوظيفة |
|--------|---------|
| `readResponsive(layout)` | يقرأ `responsive` + يحوّل الحقول القديمة (`tabletDirection`/`mobileDirection`) |
| `responsiveDeclarations(overrides)` | يحوّل تجاوزات مقاس واحد إلى مصفوفة تصريحات CSS (فارغة = لا شيء) |

## الواجهة (UI)
مكوّن مستقل جديد `ResponsiveSection.vue` يُضاف أسفل تبويب Layout (لكل العناصر، لا للحاويات فقط):
- أزرار تبديل المقاس: **Desktop / Tablet / Mobile** (عرض نفس الحقول).
- لكل مقاس، صفوف التحكم: Direction، Hidden (زر On/Off)، Width (Inherit/Auto/Full)،
  Height (Inherit/Auto)، Padding (نص، مثال `72px 0`)، Justify، Align، Gap (px)،
  Grid Columns — لكلٍّ خيار **Inherit** افتراضي.
- `height: auto` ضروري عندما يتمدّد المحتوى على المقاس الأصغر أكثر من ارتفاع الكانفاس
  الثابت؛ بدونه يتداخل القسم مع ما يليه. و`padding` يعيد الهامش الرأسي الذي كان يأتي
  من الارتفاع الثابت.
- التبديل بين المقاسات يحمّل/يحفظ كل مقاس على حدة في `web-builder-layout`.

## التصدير
في `buildExportHtml`:
1. تُقرأ `readResponsive(node.layout)` لكل عقدة.
2. تُبنى تصريحات Tablet و Mobile عبر `responsiveDeclarations`.
3. تُضاف قواعد `.wb-<id>` **فقط عند وجود تصريح** إلى:
   - `@media (max-width: Tablet)`
   - `@media (max-width: Mobile)` — يُكتب **بعد** التابلت ليفوز عند التداخل.
   - تدعم التصريحات أيضاً `height: auto` و`padding` لتحرير الأقسام ذات الارتفاع الثابت.
4. العنصر الذي لا base style له لكن له تجاوز متجاوب يحصل على صنف `wb-<id>` أيضاً.
5. **قاعدة الأمان (تلقائية، لا تخمين):** في CSS الأساسي:
   `img, svg { max-width: 100%; height: auto; }` — الصور لا تتجاوز الشاشة.

## خارج نطاق هذه المرحلة (مؤجّل)
- أحجام خطوط متجاوبة لكل مقاس.
- نقاط توقف مخصصة أكثر من 3.
- إعادة ترتيب العناصر (`order`) وإنهاء شجرة DOM مختلفة لكل مقاس.

## اختبارات مقترحة
- `readResponsive`: يحوّل الحقول القديمة، ويحترم الحقول الفارغة.
- `responsiveDeclarations`: كل حقل → تصريحه؛ `hidden` → `display: none`؛ `width:'full'` → `width: 100%`.
- لا تصريحات عند تجاوز فارغ.

## التنفيذ والتحقق (2026-10-13)
- `src/app/web-builder/responsive.ts` (نقي) + `ResponsiveSection.vue` (الواجهة).
- `LayoutTab.vue`: حُذفت صفوف Tablet/Mobile dir القديمة، وكتاباته تحفظ `responsive`.
- `WebBuilderPanel.vue`: التصدير يقرأ `readResponsive` ويُخرج `@media` للتابلت ثم الموبايل،
  ويضيف قاعدة `img, svg { max-width: 100%; height: auto; }`.
- `tests/engine/web-builder/responsive.test.ts`: 10/10 ✅ — والمجموع `web-builder` **90/90** ✅.
- `bun run check:vue` ✅ و`bun run test:dupes` (0 نسخ) ✅.

## مثال سلوكي
ثلاثة كروت في صف (Flex row) على Desktop. تجاوز Mobile: Direction=Column + Width=Full.
النتيجة: على Mobile تتراص عمودياً بعرض الشاشة، وDesktop يبقى صفاً واحداً — بلا أي تخمين.

## إضافة لاحقة ضمن نموذج `/sample` (2026-10-19)
أثناء بناء النموذج التجريبي ظهر قصّ بصري على الموبايل لأن الأقسام و`main` تحمل ارتفاعات
كانفاس ثابتة. أُضيف الحقلان `height` و`padding` أعلاه، وطُبّقا في النموذج على جميع
الأقسام (`height: auto` + `padding: 72px 0`) وعلى `main`/المحتوى (`height: auto`).
النتيجة: لا تداخل بين الأقسام ولا قصّ للكروت، مع بقاء Desktop كما هو.
