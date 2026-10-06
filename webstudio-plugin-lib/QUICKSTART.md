# دليل البدء السريع - مكتبة إضافات Webstudio
# Quick Start Guide

---

## الخطوة 1: تثبيت المكتبة

```powershell
# استيراد المكتبة
Import-Module "G:\ForWork\ExProject\webstudio-plugin-lib\WebstudioPluginLib.psm1"

# أو تشغيل الملف مباشرة
. "G:\ForWork\ExProject\webstudio-plugin-lib\WebstudioPluginLib.psm1"
```

---

## الخطوة 2: إنشاء أول إضافة

```powershell
# إنشاء إضافة بسيطة
New-WebstudioPlugin `
  -PluginName "MyFirstPlugin" `
  -Description "إضافتي الأولى" `
  -Author "أنا" `
  -Type "component"
```

**النتيجة:**
```
=== إنشاء إضافة جديدة: MyFirstPlugin ===
تم إنشاء الإضافة بنجاح!
المجلد: G:\ForWork\ExProject\webstudio-plugin-lib\plugins\MyFirstPlugin

الملفات المنشأة:
  - package.json
  - tsconfig.json
  - README.md
  - src/index.tsx
```

---

## الخطوة 3: إنشاء مكون

```powershell
# إنشاء مكون بطاقة
New-WebstudioComponent `
  -ComponentName "ProductCard" `
  -Category "layout" `
  -HasChildren $true
```

---

## الخطوة 4: بناء الإضافة

```powershell
# بناء الإضافة
Build-WebstudioPlugin `
  -PluginPath "G:\ForWork\ExProject\webstudio-plugin-lib\plugins\MyFirstPlugin"
```

---

## الخطوة 5: اختبار الإضافة

```powershell
# اختبار الإضافة
Test-WebstudioPlugin `
  -PluginPath "G:\ForWork\ExProject\webstudio-plugin-lib\plugins\MyFirstPlugin"
```

---

## الخطوة 6: تصدير الإضافة

```powershell
# تصدير كملف ZIP
Export-WebstudioPlugin `
  -PluginPath "G:\ForWork\ExProject\webstudio-plugin-lib\plugins\MyFirstPlugin" `
  -OutputPath "C:\Users\Administrator\Desktop"
```

---

## الخطوة 7: عرض الإضافات

```powershell
# عرض جميع الإضافات المثبتة
Get-WebstudioPlugins
```

---

## أوامر سريعة

| الأمر | الوظيفة |
|-------|---------|
| `New-WebstudioPlugin` | إنشاء إضافة جديدة |
| `New-WebstudioComponent` | إنشاء مكون |
| `New-WebstudioPanel` | إنشاء لوحة جانبية |
| `New-WebstudioBreakpoint` | إنشاء نقطة توقف |
| `New-WebstudioIntegration` | إنشاء تكامل |
| `Build-WebstudioPlugin` | بناء الإضافة |
| `Test-WebstudioPlugin` | اختبار الإضافة |
| `Export-WebstudioPlugin` | تصدير الإضافة |
| `Get-WebstudioPlugins` | عرض الإضافات |
| `Remove-WebstudioPlugin` | حذف إضافة |

---

## مثال سريع: إضافة متجر إلكتروني

```powershell
# 1. إنشاء الإضافة
New-WebstudioPlugin -PluginName "MyStore" -Description "متجر إلكتروني" -Type "integration"

# 2. إنشاء المكونات
New-WebstudioComponent -ComponentName "ProductCard" -Category "layout" -HasChildren $true
New-WebstudioComponent -ComponentName "BuyButton" -Category "interactive" -HasChildren $false

# 3. إنشاء لوحة إدارة
New-WebstudioPanel -PanelName "StoreManager" -Position "right" -Icon "shopping-cart"

# 4. إنشاء تكامل مع Stripe
New-WebstudioIntegration -ServiceName "Stripe" -ApiUrl "https://api.stripe.com/v1" -AuthType "apikey"

# 5. بناء والتصدير
Build-WebstudioPlugin -PluginPath "G:\ForWork\ExProject\webstudio-plugin-lib\plugins\MyStore"
Export-WebstudioPlugin -PluginPath "G:\ForWork\ExProject\webstudio-plugin-lib\plugins\MyStore"
```

---

## المجلدات

```
webstudio-plugin-lib/
├── WebstudioPluginLib.psm1    ← المكتبة الرئيسية
├── plugins/                   ← الإضافات المنشأة
├── components/                ← المكونات
├── panels/                    ← اللوحات الجانبية
├── integrations/              ← التكاملات
├── breakpoints/               ← نقاط التوقف
├── templates/                 ← القوالب الجاهزة
│   └── TEMPLATES.md
└── docs/                      ← التوثيق
    └── README.md
```

---

## الخطوات التالية

1. اقرأ [التوثيق الكامل](docs/README.md)
2. راجع [القوالب الجاهزة](templates/TEMPLATES.md)
3. أنشئ إضافتك الخاصة
4. شاركها مع المجتمع!

---

## المساعدة

- **التوثيق:** `docs/README.md`
- **القوالب:** `templates/TEMPLATES.md`
- **GitHub:** https://github.com/webstudio-is/webstudio
- **Discord:** https://wstd.us/community

---

*ابدأ الآن! 🚀*
