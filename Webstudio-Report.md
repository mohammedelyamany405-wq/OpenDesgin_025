# تقرير شامل عن Webstudio

## ما هو Webstudio؟

**Webstudio** هو مُنشئ مواقع مفتوح المصدر (Open Source) وبدائل لـ Webflow. يتيح للمستخدمين إنشاء مواقع ويب احترافية بصرياً بدون كتابة كود، مع الحفاظ على معايير الويب الحديثة.

**الموقع الرسمي:** https://webstudio.is
**الرخصة:** AGPL (Open Source)
**المستخدمون:** +145,000 مستخدم
**المشاريع:** +229,000 مشروع

---

## المميزات الرئيسية

### 1. المحرر البصري (Visual Builder)
- **واجهة سحب وإفلات** لبناء الصفحات
- **دعم جميع خصائص CSS** بشكل بصري
- **نقاط توقف متجاوبة** (Breakpoints) للتصميم المرن
- **أنماط قابلة لإعادة الاستخدام** عبر Tokens بدلاً من Classes

### 2. نظام الأنماط (Styling System)
- **Tokens:** بدلاً من إدارة Classes، يمكنك إنشاء Tokens قابلة لإعادة الاستخدام
- **Local Styles:** تصميم بدون تسمية أي شيء
- **CSS Variables:** تعريف قيم فردية واستخدامها في كل مكان
- **تحويل الوحدات:** مثل تحويل px إلى rem

### 3. إدارة المحتوى (CMS)
- **ربط أي CMS خارجي** (Headless CMS)
- **بيانات ديناميكية** من مصادر خارجية
- **قوالب محتوى** قابلة للتخصيص

### 4. التصدير والنشر (Export & Deploy)
- **تصدير موقع ثابت** مع HTML/CSS نظيف
- **تصدير تطبيق JavaScript ديناميكي**
- **نشر على:** Vercel, Netlify, Cloudflare Pages, GitHub Pages
- **CLI للتصدير:** `npx webstudio-cli`

### 5. الذكاء الاصطناعي (AI)
- **بناء بالموقع أو النص** — AI يترجم الأوصاف إلى مكونات
- **الصق CSS** — يُترجم تلقائياً إلى حقول لوحة الأنماط
- **الصق من Webflow** — يُترجم إلى مكونات Webstudio

### 6. التعاون (Collaboration)
- **مشاركة عبر روابط** مع أذونات مخصصة
- **عمل جماعي في الوقت الفعلي**

### 7. التدويل (Localization)
- **دعم اللغات المتعددة**
- **خرائط الموقع المترجمة**
- **أقسام مشروطة** بناءً على لغة المستخدم

---

## البنية التقنية (Architecture)

### التقنيات المستخدمة:
- **Frontend:** React + TypeScript
- **الخادم:** Cloudflare Workers
- **قاعدة البيانات:** PostgreSQL
- **التنسيق:** JSON Patches (Immer.js)
- **الynchronize:** Nanostores (Reactive Stores)

### المكونات الرئيسية:

```
webstudio/
├── apps/
│   ├── builder/          ← المحرر الرئيسي (Browser)
│   ├── designer/         ← أداة التصميم
│   └── css-services/     ← خدمات CSS
├── packages/
│   ├── react-sdk/        ← مكونات React قابلة للتخصيص
│   ├── js-utils/         ← أدوات مساعدة
│   └── labels/           ← الترجمات
└── docker/               ← تكوين Docker للنشر المحلي
```

---

## كيفية إضافة ميزات جديدة في Webstudio

### 1. إضافة مكون React جديد (SDK Component)

```typescript
// packages/react-sdk/src/components/MyComponent.tsx
import { ComponentProps } from "react";

type MyComponentProps = ComponentProps<"div"> & {
  label: string;
};

export const MyComponent = ({ label, ...props }: MyComponentProps) => {
  return <div {...props}>{label}</div>;
};

// تسجيل المكون
// packages/react-sdk/src/components/component-meta.ts
export const meta = {
  type: "container",
  icon: "MyIcon",
  title: "My Component",
  order: 1,
};
```

### 2. إضافة خاصية CSS جديدة

```typescript
// packages/css-data/src/properties.ts
export const customProperty = {
  name: "myProperty",
  type: "keyword",
  appliesTo: "all",
  keywords: ["value1", "value2", "value3"],
};
```

### 3. إضافة Plugin جديد

```typescript
// apps/builder/app/builder/features/plugins/MyPlugin.tsx
import { useStore } from "@webstudio-is/react-sdk";

export const MyPlugin = () => {
  const store = useStore();
  
  return (
    <div>
      <h3>My Plugin</h3>
      {/* واجهة الإضافة */}
    </div>
  );
};

// تسجيل الإضافة
// apps/builder/app/builder/features/plugins/index.ts
export const plugins = [
  {
    id: "my-plugin",
    title: "My Plugin",
    component: MyPlugin,
  },
];
```

### 4. إضافة مصدر بيانات جديد

```typescript
// packages/react-sdk/src/data-sources/MyDataSource.ts
export const myDataSource = {
  name: "my-api",
  url: "https://api.example.com/data",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};
```

### 5. بناء ونشر

```bash
# 1. استنساخ المستودع
git clone https://github.com/webstudio-is/webstudio.git

# 2. تثبيت التبعيات
cd webstudio
npm install

# 3. التشغيل المحلي
npm run dev

# 4. البناء للإنتاج
npm run build
```

---

## مقارنة مع الأدوات الأخرى

| الميزة | Webstudio | Webflow | Framer | WordPress |
|--------|-----------|---------|--------|-----------|
| **Open Source** | ✅ AGPL | ❌ | ❌ | ✅ GPL |
| **Self-Host** | ✅ | ❌ | ❌ | ✅ |
| **تصدير HTML/CSS** | ✅ | ❌ | ❌ | ✅ |
| **CMS خارجي** | ✅ | ⚠️ محدود | ❌ | ✅ |
| **AI** | ✅ | ✅ | ✅ | ⚠️ إضافات |
| **协作** | ✅ | ✅ | ✅ | ⚠️ إضافات |
| **السعر** | Freemium | $14+/شهر | $5+/شهر | مجاني |

---

## التكامل مع OpenPencil

### الفكرة:
دمج Webstudio مع OpenPencil ليصبح:
1. **OpenPencil** — للتصميم والவரை
2. **Webstudio** — لتحويل التصميم إلى موقع ويب

### خطوات التكامل:

#### 1. تصدير من OpenPencil
```typescript
// في OpenPencil: تصدير تصميم كـ JSON
const designData = {
  elements: [...],
  styles: [...],
  layout: {...}
};
```

#### 2. استيراد في Webstudio
```typescript
// في Webstudio: استيراد التصميم
import { importDesign } from "@webstudio-is/import";

const project = await importDesign(designData);
```

#### 3. تطوير Plugin مشترك
```typescript
// plugin مشترك بين OpenPencil و Webstudio
export const sharedPlugin = {
  id: "openpencil-webstudio",
  sync: async (design: DesignData) => {
    // مزامنة التصميم
  }
};
```

---

## أوامر CLI المفيدة

```bash
# إنشاء مشروع جديد
npx create-webstudio@latest my-project

# تشغيل خادم التطوير
npm run dev

# بناء المشروع
npm run build

# تصدير موقع ثابت
npx webstudio-cli export

# نشر على Cloudflare
npx wrangler pages deploy ./build
```

---

## مصادر إضافية

- **الوثائق الرسمية:** https://docs.webstudio.is
- **GitHub:** https://github.com/webstudio-is/webstudio
- **Discord:** https://wstd.us/community
- **الخريطة الطريق:** https://wstd.us/roadmap
- **أمثلة:** https://webstudio.is/templates

---

## الخلاصة

**Webstudio** هو أداة قوية لبناء مواقع الويب بصرياً مع الحفاظ على:
- **ملكية الكود** — يمكنك التصدير والنشر في أي مكان
- **معايير الويب** — HTML/CSS نظيف
- **المرونة** — ربط أي CMS أو خدمة خارجية
- **المجتمع** — مفتوح المصدر مع مجتمع نشط

**الleşme مع OpenPencil:** يمكن دمج الأدوات لتحقيق:
- تصميم في OpenPencil → تصدير → تطوير في Webstudio → نشر

---

*التقرير تاريخ: 1 سبتمبر 2026*
