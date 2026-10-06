# دليل مكتبة إضافات Webstudio
# Webstudio Plugin Library Documentation
# الإصدار: 1.0.0
# التاريخ: 1 سبتمبر 2026

---

## مقدمة

مرحباً بك في **مكتبة إضافات Webstudio**!

هذه المكتبة توفر لك مجموعة من الأوامر والأدوات لبناء إضافات (Plugins) لنظام Webstudio لبناء المواقع. المكتبة مصممة لتسهيل عملية إنشاء مكونات ولوحات جانبية وتكاملات جديدة.

### المتطلبات

- Node.js 18+ 
- npm أو yarn
- TypeScript 5+
- Webstudio (مثبت محلياً أو عبر Docker)

### التثبيت

```powershell
# استيراد المكتبة
Import-Module "G:\ForWork\ExProject\webstudio-plugin-lib\WebstudioPluginLib.psm1"

# أو تشغيل الأوامر مباشرة
.\WebstudioPluginLib.psm1
```

---

## الفهرس

1. [New-WebstudioPlugin](#1-new-webstudioplugin) - إنشاء إضافة جديدة
2. [New-WebstudioComponent](#2-new-webstudiocomponent) - إنشاء مكون جديد
3. [New-WebstudioPanel](#3-new-webstudiopanel) - إنشاء لوحة جانبية
4. [New-WebstudioBreakpoint](#4-new-webstudiobreakpoint) - إنشاء نقطة توقف
5. [New-WebstudioIntegration](#5-new-webstudiointegration) - إنشاء تكامل مع خدمة خارجية
6. [Build-WebstudioPlugin](#6-build-webstudioplugin) - بناء الإضافة
7. [Test-WebstudioPlugin](#7-test-webstudioplugin) - اختبار الإضافة
8. [Export-WebstudioPlugin](#8-export-webstudioplugin) - تصدير الإضافة
9. [Get-WebstudioPlugins](#9-get-webstudioplugins) - عرض الإضافات المثبتة
10. [Remove-WebstudioPlugin](#10-remove-webstudioplugin) - حذف إضافة

---

## 1. New-WebstudioPlugin

### الوصف
إنشاء إضافة جديدة لـ Webstudio مع هيكل كامل وملفات جاهزة.

### الصيغة
```powershell
New-WebstudioPlugin -PluginName "<اسم الإضافة>" -Description "<الوصف>" -Author "<المطور>" -Version "<الإصدار>" -Type "<النوع>"
```

### المعاملات

| المعامل | الوصف | الإجباري | القيمة الافتراضية |
|---------|-------|----------|-------------------|
| `PluginName` | اسم الإضافة بالإنجليزية بدون مسافات | نعم | - |
| `Description` | وصف الإضافة بالعربية | لا | "إضافة جديدة لـ Webstudio" |
| `Author` | اسم المطور | لا | "Developer" |
| `Version` | إصدار الإضافة | لا | "1.0.0" |
| `Type` | نوع الإضافة | لا | "component" |

### أنواع الإضافات

| النوع | الوصف | الاستخدام |
|-------|-------|----------|
| `component` | مكون React | عناصر واجهة جديدة |
| `panel` | لوحة جانبية | أدوات وإعدادات |
| `tool` | أداة مساعدة | معالجة البيانات |
| `integration` | تكامل مع خدمة خارجية | ربط APIs |

### مثال عملي

```powershell
# إنشاء إضافة مكون بسيطة
New-WebstudioPlugin -PluginName "MyButton" -Description "زر مخصص بألوان متعددة" -Author "أحمد" -Type "component"

# النتيجة:
# ✅ تم إنشاء مجلد plugins/MyButton
# ✅ تم إنشاء package.json
# ✅ تم إنشاء tsconfig.json
# ✅ تم إنشاء src/index.tsx
# ✅ تم إنشاء README.md
```

### المجلدات المنشأة

```
plugins/MyButton/
├── package.json          ← إعدادات الحزمة
├── tsconfig.json         ← إعدادات TypeScript
├── README.md             ← التوثيق
└── src/
    └── index.tsx         ← الكود الرئيسي
```

---

## 2. New-WebstudioComponent

### الوصف
إنشاء مكون React جديد مع الأنماط والخصائص.

### الصيغة
```powershell
New-WebstudioComponent -ComponentName "<اسم المكون>" -Category "<التصنيف>" -HasChildren <$true|$false> -Props "<الخصائص>"
```

### المعاملات

| المعامل | الوصف | الإجباري | القيمة الافتراضية |
|---------|-------|----------|-------------------|
| `ComponentName` | اسم المكون | نعم | - |
| `Category` | التصنيف | لا | "layout" |
| `HasChildren` | هل يحتوي على أبناء | لا | true |
| `Props` | خصائص إضافية (JSON) | لا | "[]" |

### التصنيفات المتاحة

| التصنيف | الوصف | أمثلة |
|---------|-------|-------|
| `layout` | تخطيط الصفحة | Card, Container, Grid |
| `text` | عناصر النص | Heading, Paragraph, Quote |
| `media` | الوسائط | Image, Video, Audio |
| `form` | النماذج | Input, Button, Select |
| `interactive` | تفاعلي | Tabs, Modal, Accordion |

### مثال عملي

```powershell
# إنشاء مكون بطاقة
New-WebstudioComponent -ComponentName "Card" -Category "layout" -HasChildren $true

# إنشاء مكون زر
New-WebstudioComponent -ComponentName "PrimaryButton" -Category "interactive" -HasChildren $false
```

### هيكل المكون المُنشأ

```tsx
// src/components/Card.tsx
import type { ComponentProps } from "react";

type CardProps = ComponentProps<"div">;

export const Card = (props: CardProps) => {
  return (
    <div
      {...props}
      style={{
        padding: "16px",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        ...props.style
      }}
    >
      {props.children}
    </div>
  );
};

export const meta = {
  type: "container",
  icon: "box",
  title: "Card",
  description: "مكون layout جديد",
  category: "layout",
  props: []
};
```

---

## 3. New-WebstudioPanel

### الوصف
إنشاء لوحة جانبية جديدة لعرض الأدوات أو الإعدادات.

### الصيغة
```powershell
New-WebstudioPanel -PanelName "<اسم اللوحة>" -Position "<الموضع>" -Icon "<الأيقونة>"
```

### المعاملات

| المعامل | الوصف | الإجباري | القيمة الافتراضية |
|---------|-------|----------|-------------------|
| `PanelName` | اسم اللوحة | نعم | - |
| `Position` | الموضع | لا | "right" |
| `Icon` | الأيقونة (Lucide) | لا | "settings" |

### المواقع المتاحة

| الموقع | الوصف |
|--------|-------|
| `left` | اللوحة اليسرى (الشجرة) |
| `right` | اللوحة اليمنى (الخصائص) |
| `bottom` | اللوحة السفلية |

### مثال عملي

```powershell
# إنشاء لوحة أدوات SEO
New-WebstudioPanel -PanelName "SEOTools" -Position "right" -Icon "search"

# إنشاء لوحة تحليلات
New-WebstudioPanel -PanelName "Analytics" -Position "bottom" -Icon "bar-chart"
```

### هيكل اللوحة المنشأة

```tsx
// src/panels/SEOTools.tsx
import { useState } from "react";
import { useStore } from "@webstudio-is/react-sdk";
import { Panel, PanelHeader, PanelContent } from "@webstudio-is/design-system";

export const SEOToolsPanel = ({ onClose }) => {
  const store = useStore();
  
  return (
    <Panel position="right">
      <PanelHeader
        title="SEOTools"
        icon={<icon-lucide-search />}
        onClose={onClose}
      />
      <PanelContent>
        <div className="panel-content">
          <p>محتوى لوحة SEOTools</p>
        </div>
      </PanelContent>
    </Panel>
  );
};

export const panelConfig = {
  name: "SEOTools",
  title: "SEOTools",
  position: "right",
  icon: "search",
  component: SEOToolsPanel
};
```

---

## 4. New-WebstudioBreakpoint

### الوصف
إضافة نقطة توقف مخصصة للتصميم المرن.

### الصيغة
```powershell
New-WebstudioBreakpoint -BreakpointName "<الاسم>" -MinWidth <الحد_الأدنى> -MaxWidth <الحد_الأقصى>
```

### المعاملات

| المعامل | الوصف | الإجباري | القيمة الافتراضية |
|---------|-------|----------|-------------------|
| `BreakpointName` | اسم نقطة التوقف | نعم | - |
| `MinWidth` | الحد الأدنى للعرض (px) | لا | 0 |
| `MaxWidth` | الحد الأقصى للعرض (px) | لا | 9999 |

### نقاط التوقف الافتراضية

| الاسم | الحد الأدنى | الحد الأقصى | الوصف |
|-------|------------|------------|-------|
| Mobile | 0 | 767 | الهواتف |
| Tablet | 768 | 1023 | الأجهزة اللوحية |
| Desktop | 1024 | 1439 | سطح المكتب |

### مثال عملي

```powershell
# إضافة نقطة توقف للشاشات الكبيرة
New-WebstudioBreakpoint -BreakpointName "LargeDesktop" -MinWidth 1440 -MaxWidth 1920

# إضافة نقطة توقف للشاشات الصغيرة جداً
New-WebstudioBreakpoint -BreakpointName "SmallMobile" -MinWidth 0 -MaxWidth 320
```

---

## 5. New-WebstudioIntegration

### الوصف
إنشاء تكامل مع خدمة خارجية (API).

### الصيغة
```powershell
New-WebstudioIntegration -ServiceName "<اسم الخدمة>" -ApiUrl "<الرابط>" -AuthType "<نوع_المصادقة>"
```

### المعاملات

| المعامل | الوصف | الإجباري | القيمة الافتراضية |
|---------|-------|----------|-------------------|
| `ServiceName` | اسم الخدمة | نعم | - |
| `ApiUrl` | رابط API | لا | "" |
| `AuthType` | نوع المصادقة | لا | "none" |

### أنواع المصادقة

| النوع | الوصف | الاستخدام |
|-------|-------|----------|
| `none` | بدون مصادقة | APIs العامة |
| `apikey` | مفتاح API | Stripe, OpenAI |
| `bearer` | Bearer Token | JWT APIs |
| `oauth` | OAuth 2.0 | Google, GitHub |

### مثال عملي

```powershell
# تكامل مع Stripe
New-WebstudioIntegration -ServiceName "Stripe" -ApiUrl "https://api.stripe.com/v1" -AuthType "apikey"

# تكامل مع OpenAI
New-WebstudioIntegration -ServiceName "OpenAI" -ApiUrl "https://api.openai.com/v1" -AuthType "bearer"

# تكامل مع GitHub
New-WebstudioIntegration -ServiceName "GitHub" -ApiUrl "https://api.github.com" -AuthType "oauth"
```

---

## 6. Build-WebstudioPlugin

### الوصف
بناء الإضافة للإنتاج (تجميع TypeScript وتصنيع الملفات).

### الصيغة
```powershell
Build-WebstudioPlugin -PluginPath "<مسار الإضافة>"
```

### المعاملات

| المعامل | الوصف | الإجباري |
|---------|-------|----------|
| `PluginPath` | مسار مجلد الإضافة | نعم |

### مثال عملي

```powershell
# بناء إضافة
Build-WebstudioPlugin -PluginPath "G:\ForWork\ExProject\webstudio-plugin-lib\plugins\MyButton"

# النتيجة:
# ✅ تثبيت التبعيات (npm install)
# ✅ بناء TypeScript (npm run build)
# ✅ إنشاء مجلد dist/
```

---

## 7. Test-WebstudioPlugin

### الوصف
اختبار الإضافة والتأكد من صحة الكود.

### الصيغة
```powershell
Test-WebstudioPlugin -PluginPath "<مسار الإضافة>"
```

### المعاملات

| المعامل | الوصف | الإجباري |
|---------|-------|----------|
| `PluginPath` | مسار مجلد الإضافة | نعم |

### مثال عملي

```powershell
# اختبار الإضافة
Test-WebstudioPlugin -PluginPath "G:\ForWork\ExProject\webstudio-plugin-lib\plugins\MyButton"

# النتيجة:
# ✅ فحص TypeScript (tsc --noEmit)
# ✅ تشغيل الاختبارات (npm test)
```

---

## 8. Export-WebstudioPlugin

### الوصف
تصدير الإضافة كملف ZIP جاهز للمشاركة.

### الصيغة
```powershell
Export-WebstudioPlugin -PluginPath "<مسار الإضافة>" -OutputPath "<مسار_الإخراج>"
```

### المعاملات

| المعامل | الوصف | الإجباري | القيمة الافتراضية |
|---------|-------|----------|-------------------|
| `PluginPath` | مسار مجلد الإضافة | نعم | - |
| `OutputPath` | مسار حفظ ZIP | لا | سطح المكتب |

### مثال عملي

```powershell
# تصدير الإضافة
Export-WebstudioPlugin -PluginPath "G:\ForWork\ExProject\webstudio-plugin-lib\plugins\MyButton"

# النتيجة:
# ✅ إنشاء MyButton.zip على سطح المكتب
```

---

## 9. Get-WebstudioPlugins

### الوصف
عرض جميع الإضافات المثبتة في المكتبة.

### الصيغة
```powershell
Get-WebstudioPlugins
```

### مثال عملي

```powershell
Get-WebstudioPlugins

# النتيجة:
# === الإضافات المثبتة ===
#
#   الاسم: MyButton
#   الوصف: زر مخصص بألوان متعددة
#   الإصدار: 1.0.0
#   المطور: أحمد
#
#   الاسم: SEOTools
#   الوصف: لوحة أدوات SEO
#   الإصدار: 1.0.0
#   المطور: أحمد
#
# العدد: 2 إضافات
```

---

## 10. Remove-WebstudioPlugin

### الوصف
حذف إضافة من المكتبة.

### الصيغة
```powershell
Remove-WebstudioPlugin -PluginName "<اسم الإضافة>"
```

### المعاملات

| المعامل | الوصف | الإجباري |
|---------|-------|----------|
| `PluginName` | اسم الإضافة المراد حذفها | نعم |

### مثال عملي

```powershell
# حذف إضافة
Remove-WebstudioPlugin -PluginName "MyButton"

# النتيجة:
# === حذف الإضافة: MyButton ===
# هل أنت متأكد من حذف MyButton؟ (Y/N)
# Y
# ✅ تم حذف الإضافة بنجاح!
```

---

## أمثلة متقدمة

### إنشاء إضافة كاملة للتجارة الإلكترونية

```powershell
# 1. إنشاء الإضافة
New-WebstudioPlugin -PluginName "EcommercePlugin" -Description "إضافة متجر إلكتروني" -Author "م开发团队" -Type "integration"

# 2. إنشاء المكونات
New-WebstudioComponent -ComponentName "ProductCard" -Category "layout" -HasChildren $true
New-WebstudioComponent -ComponentName "AddToCartButton" -Category "interactive" -HasChildren $false
New-WebstudioComponent -ComponentName "PriceDisplay" -Category "text" -HasChildren $false

# 3. إنشاء اللوحات
New-WebstudioPanel -PanelName "ProductManager" -Position "right" -Icon "package"
New-WebstudioPanel -PanelName "OrderHistory" -Position "bottom" -Icon "shopping-cart"

# 4. إنشاء التكامل
New-WebstudioIntegration -ServiceName "Stripe" -ApiUrl "https://api.stripe.com/v1" -AuthType "apikey"
New-WebstudioIntegration -ServiceName "InventoryAPI" -ApiUrl "https://api.inventory.com" -AuthType "bearer"

# 5. البناء والاختبار
Build-WebstudioPlugin -PluginPath "G:\ForWork\ExProject\webstudio-plugin-lib\plugins\EcommercePlugin"
Test-WebstudioPlugin -PluginPath "G:\ForWork\ExProject\webstudio-plugin-lib\plugins\EcommercePlugin"

# 6. التصدير
Export-WebstudioPlugin -PluginPath "G:\ForWork\ExProject\webstudio-plugin-lib\plugins\EcommercePlugin"
```

### إنشاء إضافة تحليلات

```powershell
# إنشاء إضافة تحليلات
New-WebstudioPlugin -PluginName "AnalyticsPlugin" -Description "إضافة تحليلات متقدمة" -Type "panel"

# إنشاء لوحة التحليلات
New-WebstudioPanel -PanelName "AnalyticsDashboard" -Position "right" -Icon "bar-chart"

# إنشاء مكون الإحصائيات
New-WebstudioComponent -ComponentName "StatCard" -Category "layout" -HasChildren $false
```

---

## استكمال الإضافة يدوياً

### 1. تعديل package.json

```json
{
  "name": "webstudio-plugin-MyPlugin",
  "version": "1.0.0",
  "peerDependencies": {
    "@webstudio-is/react-sdk": ">=1.0.0",
    "@webstudio-is/design-system": ">=1.0.0"
  }
}
```

### 2. إضافة اختبارات

```typescript
// src/__tests__/index.test.tsx
import { render } from "@testing-library/react";
import { MyComponent } from "../index";

describe("MyComponent", () => {
  it("renders correctly", () => {
    const { container } = render(<MyComponent />);
    expect(container).toBeTruthy();
  });
});
```

### 3. نشر الإضافة

```bash
# بناء الإضافة
npm run build

# نشر على npm
npm publish

# أو نشر كملف ZIP
zip -r MyPlugin.zip dist/ package.json README.md
```

---

## حل المشاكل

### مشكلة: TypeScript يظهر أخطاء

```powershell
# تثبيت التبعيات
npm install

# فحص الأنواع
npx tsc --noEmit
```

### مشكلة: المكون لا يظهر في Webstudio

1. تأكد من تسجيل المكون في `meta`
2. تأكد من تصدير المكون بشكل صحيح
3. أعد تشغيل Webstudio

### مشكلة: الأيقونة لا تظهر

```tsx
// استخدم اسم Lucide الصحيح
import { Search } from "lucide-react";

// أو
<icon-lucide-search />
```

---

## مصادر إضافية

- **وثائق Webstudio:** https://docs.webstudio.is
- **GitHub:** https://github.com/webstudio-is/webstudio
- **Discord:** https://wstd.us/community
- **Lucide Icons:** https://lucide.dev/icons

---

## الترخيص

هذه المكتبة مرخصة تحت رخصة **AGPL-3.0** مثل Webstudio.

---

*آخر تحديث: 1 سبتمبر 2026*
