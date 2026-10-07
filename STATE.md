# STATE — مصنع التعديلات المحلية
آخر تحديث: 2026-10-07
المرحلة الحالية: المرحلة 0 — توحيد المصدر وخط الأساس (منجزة، بانتظار إقرار)
الفرع: `261007-chore-phase0-baseline`

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
  bun run build:packages   # إن تغيرت الحزم
  bun run dev              # http://localhost:1420
  bun run check:vue        # فحص TypeScript للأكواد

النموذج: qwen2.5-coder:14b (12GB VRAM)
ملاحظات: لا exe — نسخة الويب تكفي. التغليف مؤجّل.
