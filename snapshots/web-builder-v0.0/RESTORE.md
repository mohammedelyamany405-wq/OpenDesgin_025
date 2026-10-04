# نقطة الرجوع: Web Builder v0.0

التاريخ: 2026-10-05
الحالة: مكتملة ومختبرة في المتصفح من المصمم — التجربة رائعة.

## 1. الاستعادة (كيف ترجع لهذه النقطة)

```powershell
cd G:\ForWork\ExProject\projects\openpencil
git checkout web-builder-v0.0
bun run build:packages
# ثم شغل OpenPencil.bat من سطح المكتب
```

- الـ tag: `web-builder-v0.0` (متعمد بدون بادئة `v` حتى لا يطلق release workflow).
- الـ commit: `6faba6e` بعنوان `feat(web-builder): complete v0.0 - CSS export, breakpoints, decorative, warnings gate`.

## 2. ما تشمله النقطة (7 ملفات)

| الملف | التغيير |
|-------|---------|
| `packages/dom-css/src/from-scene-graph.ts` | وسم مخصص + layout + كلاسات + aria للزخرفي |
| `src/components/properties/web-builder/WebBuilderPanel.vue` | تصدير CSS كامل + بوابة + حوار تحذيرات + Decorative |
| `src/components/properties/web-builder/ValidateTab.vue` | جديد: فحص + تجاهل زخرفي + تحديد غير المصنف |
| `src/components/properties/web-builder/LayoutTab.vue` | تجاوز اتجاه Tablet/Mobile |
| `src/components/properties/web-builder/PagesTab.vue` | Breakpoints لكل صفحة |
| `src/components/properties/web-builder/DOMTreeTab.vue` | قراءة الزخرفي |
| `src/components/properties/web-builder/TreeNodeItem.vue` | شارات `!` و `D` |

## 3. مفاتيح pluginData الموحدة (pluginId = open-pencil)

| المفتاح | القيمة |
|---------|--------|
| `web-builder-tag` | string مباشرة (`header`) |
| `web-builder-classes` | JSON array |
| `web-builder-layout` | JSON object (+ `tabletDirection`/`mobileDirection` اختيارية) |
| `web-builder-decorative` | `'true'` أو غائب |
| `web-builder-breakpoints` | JSON على عقدة الصفحة `{tablet:768,mobile:375}` |

## 4. نتائج التحقق عند الحفظ

- `bun run check:vue` — نظيف (صفر أخطاء).
- `tsc --noEmit` لحزمة dom-css — نظيف.
- `bun run build:packages` — نجح لكل الحزم.
- اختبار حي عبر MCP: قراءة `Page 1` + `Desktop` + الشجرة + JSX — يعمل.
- اختبار المصمم البصري: DOM Tree + Validate + بوابة المنع + تصدير HTML دلالي — يعمل.

## 5. سجل القرارات المهمة

1. `pluginData` بدل sidecar JSON (المعرفات غير ثابتة عبر الحفظ).
2. لا تخمين: media queries فقط للتجاوزات المصرحة، inherit = لا إخراج.
3. الزخرفي يصدر `div aria-hidden` ويتجاهله الفحص.
4. التصدير يقرأ pluginData طازجة لكل عقدة (إصلاح فقدان كلاسات غير المحدد).
5. أدوات Canvas السياقية مؤجلة لـ v0.1 (جراحة tool registry).
6. جسر Webstudio مركون (بحث فقط) — مسار ثانوي.

## 6. الأرشفة المرجعية (DataBase)

- `Export_Engine_Architecture.md` — محرك التصدير + CSS + media.
- `Validate_Tab_Architecture.md` — القواعد + البوابة + الحوار.
- `Layout_Tab_Architecture.md` — نموذج البيانات + التجاوزات.
- `Pages_Tab_Architecture.md` — الصفحات + Breakpoints.
- `DOM_Tree_Architecture.md` — الشجرة + الشارات.

## 7. النقاط المفتوحة (من ورقة المصمم — تُناقش نقطة نقطة)

- (بانتظار نقاط المصمم من تجربته)
