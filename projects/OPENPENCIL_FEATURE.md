# مشروع OpenPencil — خطة ميزة HTML Tags

الهدف: إضافة قائمة منسدلة لوسوم HTML (header/nav/button/...) بجانب كل عنصر،
مع تخزين الوسم في ملف JSON مرافق (sidecar) لا في صيغة الملف.

## الأسلوب المتفق عليه (تجنّب كسر صيغة .pen/.fig)
- ملف مرافق: `<doc>.tags.json` = [{ "id": "...", "name": "...", "htmlTag": "header" }]
- زر «استورد الوسوم» يطابق كل id بالعنصر الحيوي ويضبط htmlTag في الذاكرة.
- التصدير (JSX/HTML) يستهلك htmlTag من الذاكرة تلقائياً.

## خريطة الملفات (من AGENTS.md الخاص بـ OpenPencil)
- القائمة ( browser ): عدّل `src/app/shell/menu/schema.ts` + تعامل في `src/app/shell/menu/use.ts`.
  - العرض في المتصفح: `src/components/Shell/AppMenu.vue` (reka-ui Menubar).
  - Tauri يستخدم قائمة نظامية (`desktop/src/menu.rs`) تُولّد بـ `bun run generate:tauri-menu` (غير مطلوبة الآن لأننا نسخة ويب).
- لوحة الخصائص (Inspector): `src/components/properties/**` أو `packages/vue/src/primitives/PropertySection/`.
  - القائمة المنسدلة تُبنى بـ reka-ui (DropdownMenu/Select) حسب توثيق reka-ui.
- هيكل العناصر: عقد مسطّحة في `@open-pencil/scene-graph` (Map<NodeId, SceneNode>).
- التصدير: `packages/dom-css` (HTML/Tailwind) و `packages/core/io/formats/jsx`.

## اختبار حاسم قبل البناء
تأكيد ثبات معرّفات العناصر (NodeId) عبر: إنشاء عنصر ← حفظ ← إعادة فتح ← مقارنة المعرّف.
إن تغيّرت المعرّفات ينهار ربط الـ sidecar → نعتمد حينها on matching بالاسم + المسار.

## أوامر التشغيل
cd G:\ForWork\ExProject\projects\openpencil
bun run dev      # http://localhost:1420  (يشترط بناء الحزم أولاً: bun run build:packages)
bun run build:packages   # يلزم مرة واحدة بعد كل استنساخ/تحديث

## ملاحظات
- التغليف إلى exe مؤجّل (نسخة الويب تكفي).
- الترخيص MIT = تعديل وتوزيع حرّان.
- تثبيت Bun: المسار C:\Users\Administrator\.bun\bin (أُضيف إلى PATH المستخدم).
