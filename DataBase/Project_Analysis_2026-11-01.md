# تحليل مجلد المشروع — 2026-11-01

نطاق التحليل: كامل `/workspace` (المصنع + `projects/openpencil` + البيانات + السكربتات + اللقطات).
منهجية: قراءة الكود الفعلي ومقارنته بـ`STATE.md` و`DISCUSSION.md` ومستندات `DataBase/`.

---

## 1. نظرة عامة

`/workspace` هو "مصنع تعديلات" محلي يعتمد على **OpenPencil 0.14.0** (MIT، Vue 3 + Bun) لإضافة ميزة **Web Builder**:
تصنيف عناصر التصميم بوسوم HTML صريحة ثم تصدير HTML5/CSS3 نظيف.
كل شيء مرفوع كـ snapshot واحد في git على `master` (`868ff25`) بدون submodules.

```
/workspace
├── projects/openpencil        المحرّك المعدّل (3.2k ملف متتبَّع) ← قلب المشروع
├── DataBase/                  362 خصائص CSS + 121 وسم HTML (أرشيف مرجعي) + 7 مستندات معمارية
├── scripts/                   13 سكربت PowerShell (أدوات خارجية قديمة)
├── webstudio-plugin-lib/      مكتبة PowerShell لـ Webstudio (مسار جانبي مركون)
├── snapshots/web-builder-v0.0/ RESTORE.md — نقطة رجوع موثقة
├── templates/                  قوالب تدقيق ومواصفات
└── STATE.md / DISCUSSION.md   ذاكرة المشروع والوثيقة المرجعية
```

## 2. البنية الفعلية للميزة

التخزين في `pluginData` على كل عقدة (`pluginId = 'open-pencil'`)، وليس في ملفات sidecar:

| المفتاح | الشكل | المصدر |
|---|---|---|
| `web-builder-tag` | string | TagsTab |
| `web-builder-attrs` | JSON | TagsTab |
| `web-builder-classes` | JSON array | Classes tab |
| `web-builder-layout` | JSON | LayoutTab |
| `web-builder-decorative` | `'true'` | TagsTab |
| `web-builder-breakpoints` | JSON على عقدة الصفحة | PagesTab |
| `web-builder-page` | JSON (title/lang/desc) | Export tab |

الواجهة: `WebBuilderPanel.vue` (1062 سطر) مع 7 تبويبات، مثبَّتة في
`src/components/DesignPanel.vue:103` و`:178`.
التصدير يمر بـ `collectCriticalErrors` → تحذيرات → `nodeToHtml` → `<style>` مولّد.
حزمة `packages/dom-css` تقرأ نفس المفاتيح لمسار تصدير ثانٍ (HTML/JSX).

## 3. نقاط القوة

- **فلسفة متسقة:** "لا تخمين" مطبقة فعليًا — media queries فقط للتجاوزات المصرحة، والزخرفي يخرج `div aria-hidden`.
- **حماية من كسر الصيغة:** `pluginData` قرار صحيح بعد اكتشاف عدم ثبات المعرّفات.
- **بوابة تصدير حقيقية:** أخطاء حرجة تمنع الإخراج + حوار تحذيرات.
- **توثيق معماري جيد** في `DataBase/*.md` (7 مستندات) يطابق الكود غالبًا.

## 4. مشاكل حرجة (تؤثر على الوظيفة)

1. **النص لا يُصدَّر أبدًا.** `buildNode` (`WebBuilderPanel.vue:280`) لا يجلب `node.text`،
   و`nodeToHtml` (`:437`) يولّد أزواج وسوم فارغة. أي عنصر TEXT سيخرج `<p></p>`.
   هذا أكبر عيب وظيفي في v0.0.

2. **بوابة التصدير تختلف عن Validate.** `collectCriticalErrors` (`:328`) لا يستثني الزخرفي
   بينما `ValidateTab.vue:33` يستثنيه، ولا يفلتر `internalOnly` ولا `visible`
   (بينما `ValidateTab` يفلتر internalOnly، و`DOMTreeTab:62` كذلك).
   النتيجة: عناصر زخرفية مُصنَّفة `img` بأبناء تمنع التصدير رغم أن المخرج سيكون `div`.

3. **خصائص الأبناء في Layout بلا أثر.** `childFlexGrow/Shrink/Basis/AlignSelf`
   تُكتب (`LayoutTab.vue:12-17`) لكن لا يقرأها أي ملف تصدير — واجهة توحي بوظيفة غير موجودة.

4. **كود ميت مزدوج.** `WebBuilderSection.vue` (المصنِّف القديم بمفتاح `web-builder`، `:36`)
   غير مستورد من أي مكان، ويعتمد كتالوج `elements.ts` الذي يحوي وسومًا مركّبة غير صالحة (`"li>a"`).
   الكتالوج الفعلي هو `tag-attrs.ts` (83 وسمًا). مصدران للحقيقة = انحراف حتمي.

## 5. مشاكل متوسطة

5. **تكرار قواعد الفحص** بين `WebBuilderPanel.vue:308-334` و`ValidateTab.vue:94-165`
   — أي تعديل في أحدهما يترك الآخر متأخرًا (وقد حدث فعلًا في النقطة 2).
6. **25 استدعاء `console.log`** متبقٍ في `DOMTreeTab.vue` (14) و`PagesTab.vue` (11)
   مع إيموجي — يجب حذفها قبل أي commit.
7. **`WebBuilderPanel` ملف وحيد بـ1062 سطرًا** و7 مسؤوليات؛ يحتاج تفكيكًا
   (Classes وExport قابلان للاستخراج فورًا).
8. **لا اختبارات للميزة:** لا شيء تحت `tests/` يغطي web-builder رغم وجود Playwright.
9. **ملفات sidecar قديمة بمخطط متناقض:** `site.layout.json` يستخدم `type: "flexbox"`
   و`justify/align` بينما النموذج الحالي `flex` و`justifyContent/alignItems`.
   لا كود يقرأها — بقايا سكربتات PowerShell. و`export/index.html` أثر قديم فيه
   `display: flex` مكرر.

## 6. عوائق بيئية (تمنع التحقق الآن)

- **`bun` غير مثبت** و**`node_modules` غير موجود** → لا يمكن تشغيل `bun run check:vue`
  ولا البناء. Node v22 موجود فقط.
- **git-lfs غير مثبت** و`.pen/.fig/.xlsx` كلها pointers: `tests/fixtures/*.pen`
  و`lunacy-webstudio-data-models.xlsx` غير قابلة للاستخدام (الـxlsx هو 129 بايت = مؤشر فقط).
- **كل سكربتات `scripts/*.ps1`** تعتمد مسارًا مطلقًا `G:\ForWork\ExProject\...`
  → غير قابلة للتشغيل هنا.
- `DataBase/Tags_Batches.md` يحوي جدول حالة متناقضًا: الدفعات 2–7 مكتوبة "تمت"
  و"لم تبدأ" في آن واحد.

## 7. الحالة الفعلية

`STATE.md` يقول: ميزة v0.0 **مكتملة وبانتظار اختبار المصمم البصري**،
والمؤجل لـv0.1: أدوات Canvas السياقية، BEM، جسر Webstudio.
هذا متسق مع الكود، لكنه يبالغ في "الاكتمال" أمام عيب النص (النقطة 1)
الذي يجعل أي تصدير حقيقي ناقص المحتوى.

## 8. التوصية

الأولوية قبل أي ميزة جديدة:

1. إصلاح تصدير النص.
2. توحيد قواعد الفحص في وحدة مشتركة وإصلاح الزخرفي/التحديد البصري.
3. حذف الكود الميت (`WebBuilderSection` + `elements.ts`).
4. تنظيف `console.log`.

ثم تثبيت Bun لتفعيل `check:vue` كشرط إغلاق، وتوثيق الفجوة في `STATE.md`.
