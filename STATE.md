# STATE — مصنع التعديلات المحلية
آخر تحديث: 2026-08-29
المرحلة الحالية: الإعداد (ضبط العتاد + سقالة المصنع)

المنجز:
  - الاتفاق على الاستراتيجية والمصنع (4 طبقات: عتاد/فهم/تنفيذ/تنسيق)
  - ضبط متغيرات Ollama: KEEP_ALIVE=-1 ، FLASH_ATTENTION=1 ، KV_CACHE_TYPE=q8_0 ، GPU_OVERHEAD=2GB
  - إنشاء سقالة المصنع + أول commit (90f4cb0)
  - استنساخ OpenPencil (depth 1) في projects/openpencil
  - تثبيت Bun 1.4.0

التالي:
  - bun install داخل projects/openpencil (التحقق من البيئة)
  - bun run dev وتشغيل المحرّك الويب + اختبار ثبات معرّفات العناصر (id) قبل بناء ميزة HTML-tags
  - كتابة مواصفات ميزة HTML-tags (المصمم)

أوامر الاستئناف:
  cd G:\ForWork\ExProject\projects\openpencil
  bun install
  bun run dev        # محرّك الويب على http://localhost:1420

النموذج المستخدم: qwen2.5-coder:14b
ملاحظات: لا exe مطلوب — نسخة الويب تكفي. التغليف مؤجّل.
