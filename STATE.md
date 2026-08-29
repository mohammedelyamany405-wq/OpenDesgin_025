# STATE — مصنع التعديلات المحلية
آخر تحديث: 2026-08-30
المرحلة الحالية: الإعداد مكتمل ✅ — البيئة تعمل. التالي: تجربة المستخدم + بناء الميزة (مرحلة 3)

المنجز:
  - الاتفاق على الاستراتيجية والمصنع (4 طبقات: عتاد/فهم/تنفيذ/تنسيق)
  - ضبط متغيرات Ollama: KEEP_ALIVE=-1 ， FLASH_ATTENTION=1 ， KV_CACHE_TYPE=q8_0 ， GPU_OVERHEAD=2GB (تتطلب إعادة تشغيل تطبيق Ollama)
  - إنشاء سقالة المصنع + commit (90f4cb0) ثم commit ثانٍ (9b4562c)
  - استنساخ OpenPencil (depth 1) في projects/openpencil — MIT، إصدار 0.14.0
  - تثبيت Bun 1.4.0 في C:\Users\Administrator\.bun\bin وأُضيف إلى PATH المستخدم دائماً
  - bun install نجح (1976 حزمة)
  - bun run build:packages نجح (كل الحزم خرجت 0) ✅
  - bun run dev يُقلع على http://localhost:1420 ✅ (تأكدنا بفحص المنفذ PORT_1420_OPEN=True)
  - توثيق خطة ميزة HTML-tags + خريطة الملفات في projects/OPENPENCIL_FEATURE.md
  - تأكيد كفاءة Ollama بعد إعادة التشغيل: qwen2.5-coder:14b يبقى في VRAM (KEEP_ALIVE=-1 → تحميل ساخن 0.01s لا 27s)، إنتاجية 9.3 tok/s ساخن / 4.1 بارد، offload كامل على RTX3060 (11.4GB/12GB، 99% util). الضبط فعّال ✅

تحذيرات طفيفة (غير حاجبة):
  - [MCP] Failed to spawn automation server: spawn bun ENOENT — bun ليس على PATH لعمليات Vite الفرعية؛ لا يؤثر على تشغيل المحرّك نفسه. يُحل بإعادة فتح الترمينال بعد إضافة PATH.
  - canvaskit-webgpu/canvaskit.wasm مفقود (نسخة تجريبية WebGPU) — الكانفس الأساسي يعمل لأن canvaskit.wasm الأساسي موجود في node_modules.

التالي (للمصمم + الوكيل):
  - المصمم: افتح http://localhost:1420 وراجع المحرّك بصرياً (مصادقة بصورة).
  - الوكيل: اختبار ثبات معرّفات العناصر (NodeId) عبر حفظ/إعادة فتح قبل بناء ميزة HTML-tags.
  - الوكيل: بناء ميزة HTML-tags (قائمة منسدلة في Inspector + زر استيراد sidecar JSON) حسب projects/OPENPENCIL_FEATURE.md.

أوامر الاستئناف:
  cd G:\ForWork\ExProject\projects\openpencil
  bun run build:packages   # مرة واحدة بعد التحديثات
  bun run dev              # محرّك الويب على http://localhost:1420
  ملاحظة: استخدم مسار bun الكامل إن لم يظهر الأمر: C:\Users\Administrator\.bun\bin\bun.exe

النموذج المستخدم: qwen2.5-coder:14b
ملاحظات: لا exe مطلوب — نسخة الويب تكفي. التغليف مؤجّل.
