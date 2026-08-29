# STATE — مصنع التعديلات المحلية
آخر تحديث: 2026-08-29
المرحلة الحالية: الإعداد (ضبط العتاد + سقالة المصنع)

المنجز:
  - الاتفاق على الاستراتيجية والمصنع (4 طبقات: عتاد/فهم/تنفيذ/تنسيق)
  - ضبط متغيرات Ollama: KEEP_ALIVE=-1 ، FLASH_ATTENTION=1 ، KV_CACHE_TYPE=q8_0 ، GPU_OVERHEAD=2GB
  - إنشاء سقالة المصنع (AGENTS.md + STATE.md + templates)

التالي:
  - استنساخ OpenPencil في projects/openpencil
  - تشغيل النسخة الويب (bun install ثم bun run dev) للتأكد من البيئة
  - اختبار ثبات معرّفات العناصر (id) قبل بناء ميزة HTML-tags

أوامر الاستئناف:
  cd G:\ForWork\ExProject\projects\openpencil
  bun install
  bun run dev        # محرّك الويب على http://localhost:1420

النموذج المستخدم: qwen2.5-coder:14b
ملاحظات: لا exe مطلوب — نسخة الويب تكفي. التغليف مؤجّل.
