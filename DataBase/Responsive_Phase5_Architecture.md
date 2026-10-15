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
  Justify، Align، Gap (px)، Grid Columns — لكلٍّ خيار **Inherit** افتراضي.
- التبديل بين المقاسات يحمّل/يحفظ كل مقاس على حدة في `web-builder-layout`.

## التصدير
في `buildExportHtml`:
1. تُقرأ `readResponsive(node.layout)` لكل عقدة.
2. تُبنى تصريحات Tablet و Mobile عبر `responsiveDeclarations`.
3. تُضاف قواعد `.wb-<id>` **فقط عند وجود تصريح** إلى:
   - `@media (max-width: Tablet)`
   - `@media (max-width: Mobile)` — يُكتب **بعد** التابلت ليفوز عند التداخل.
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

## مثال سلوكي
ثلاثة كروت في صف (Flex row) على Desktop. تجاوز Mobile: Direction=Column + Width=Full.
النتيجة: على Mobile تتراص عمودياً بعرض الشاشة، وDesktop يبقى صفاً واحداً — بلا أي تخمين.
