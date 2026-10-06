# قوالب جاهزة لإضافات Webstudio
# Webstudio Plugin Templates

---

## القالب 1: مكون بسيط (Simple Component)

```tsx
// templates/SimpleComponent.tsx
import type { ComponentProps } from "react";

type MyComponentProps = ComponentProps<"div"> & {
  title?: string;
  variant?: "primary" | "secondary" | "danger";
};

export const MyComponent = ({
  title = "عنوان افتراضي",
  variant = "primary",
  children,
  ...props
}: MyComponentProps) => {
  const variants = {
    primary: { bg: "#3b82f6", color: "#ffffff" },
    secondary: { bg: "#6b7280", color: "#ffffff" },
    danger: { bg: "#ef4444", color: "#ffffff" }
  };

  return (
    <div
      {...props}
      style={{
        padding: "16px",
        borderRadius: "8px",
        backgroundColor: variants[variant].bg,
        color: variants[variant].color,
        ...props.style
      }}
    >
      <h3>{title}</h3>
      {children}
    </div>
  );
};

export const meta = {
  type: "container" as const,
  icon: "box",
  title: "MyComponent",
  description: "مكون بسيط مع خيارات متعددة",
  props: [
    {
      type: "string",
      name: "title",
      description: "عنوان المكون"
    },
    {
      type: "enum",
      name: "variant",
      options: ["primary", "secondary", "danger"],
      description: "نوع المكون"
    }
  ]
};
```

---

## القالب 2: لوحة جانبية (Side Panel)

```tsx
// templates/SidePanel.tsx
import { useState, useEffect } from "react";
import { useStore } from "@webstudio-is/react-sdk";

type DataItem = {
  id: string;
  name: string;
  value: any;
};

export const DataPanel = () => {
  const store = useStore();
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // جلب البيانات عند التحميل
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // بيانات تجريبية
      const mockData: DataItem[] = [
        { id: "1", name: "العنصر الأول", value: 100 },
        { id: "2", name: "العنصر الثاني", value: 200 },
        { id: "3", name: "العنصر الثالث", value: 300 }
      ];
      setData(mockData);
    } catch (err) {
      setError("خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-panel">
      <h3>لوحة البيانات</h3>
      
      {loading && <div className="loading">جاري التحميل...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && (
        <ul className="data-list">
          {data.map((item) => (
            <li key={item.id} className="data-item">
              <span>{item.name}</span>
              <span>{item.value}</span>
            </li>
          ))}
        </ul>
      )}
      
      <button onClick={fetchData} className="refresh-btn">
        تحديث
      </button>
    </div>
  );
};

export const panelConfig = {
  name: "DataPanel",
  title: "لوحة البيانات",
  position: "right" as const,
  icon: "database",
  component: DataPanel
};
```

---

## القالب 3: تكامل مع API (API Integration)

```tsx
// templates/ApiIntegration.tsx
type ApiConfig = {
  baseUrl: string;
  headers?: Record<string, string>;
};

type ApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
};

export const createApiIntegration = (config: ApiConfig) => {
  const { baseUrl, headers = {} } = config;

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...headers
  };

  return {
    // جلب البيانات
    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "GET",
          headers: defaultHeaders
        });
        
        const data = await response.json();
        
        return {
          data,
          status: response.status,
          message: response.ok ? "نجاح" : "خطأ"
        };
      } catch (error) {
        return {
          data: null as any,
          status: 500,
          message: "خطأ في الاتصال"
        };
      }
    },

    // إرسال البيانات
    async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        return {
          data,
          status: response.status,
          message: response.ok ? "نجاح" : "خطأ"
        };
      } catch (error) {
        return {
          data: null as any,
          status: 500,
          message: "خطأ في الاتصال"
        };
      }
    },

    // تحديث البيانات
    async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "PUT",
          headers: defaultHeaders,
          body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        return {
          data,
          status: response.status,
          message: response.ok ? "نجاح" : "خطأ"
        };
      } catch (error) {
        return {
          data: null as any,
          status: 500,
          message: "خطأ في الاتصال"
        };
      }
    },

    // حذف البيانات
    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "DELETE",
          headers: defaultHeaders
        });
        
        const data = await response.json();
        
        return {
          data,
          status: response.status,
          message: response.ok ? "نجاح" : "خطأ"
        };
      } catch (error) {
        return {
          data: null as any,
          status: 500,
          message: "خطأ في الاتصال"
        };
      }
    }
  };
};

// مثال الاستخدام
export const api = createApiIntegration({
  baseUrl: "https://api.example.com",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN"
  }
});
```

---

## القالب 4: مكون نموذج (Form Component)

```tsx
// templates/FormComponent.tsx
import { useState, FormEvent } from "react";

type FormData = {
  name: string;
  email: string;
  message: string;
};

type FormProps = {
  onSubmit?: (data: FormData) => void;
  title?: string;
};

export const ContactForm = ({ onSubmit, title = "نموذج التواصل" }: FormProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: ""
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "الاسم مطلوب";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صالح";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "الرسالة مطلوبة";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit?.(formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    }
  };

  if (submitted) {
    return (
      <div className="form-success">
        <h3>تم الإرسال بنجاح!</h3>
        <p>شكراً لتواصلك معنا</p>
        <button onClick={() => setSubmitted(false)}>إرسال رسالة جديدة</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <h3>{title}</h3>
      
      <div className="form-group">
        <label htmlFor="name">الاسم</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? "error" : ""}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="email">البريد الإلكتروني</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={errors.email ? "error" : ""}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="message">الرسالة</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={errors.message ? "error" : ""}
          rows={5}
        />
        {errors.message && <span className="error-text">{errors.message}</span>}
      </div>
      
      <button type="submit" className="submit-btn">
        إرسال
      </button>
    </form>
  );
};

export const meta = {
  type: "container" as const,
  icon: "mail",
  title: "ContactForm",
  description: "نموذج تواصل مع التحقق",
  props: [
    {
      type: "string",
      name: "title",
      description: "عنوان النموذج"
    }
  ]
};
```

---

## القالب 5: أداة تحليل (Analytics Tool)

```tsx
// templates/AnalyticsTool.tsx
import { useState, useEffect } from "react";

type AnalyticsData = {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
};

type AnalyticsProps = {
  apiKey?: string;
  refreshInterval?: number;
};

export const AnalyticsDashboard = ({
  apiKey,
  refreshInterval = 30000
}: AnalyticsProps) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // بيانات تجريبية
      const mockData: AnalyticsData = {
        pageViews: Math.floor(Math.random() * 10000),
        uniqueVisitors: Math.floor(Math.random() * 5000),
        bounceRate: Math.floor(Math.random() * 100),
        avgSessionDuration: Math.floor(Math.random() * 300)
      };
      setData(mockData);
    } catch (error) {
      console.error("خطأ في جلب التحليلات");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || !data) {
    return <div className="loading">جاري تحميل التحليلات...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <h3>لوحة التحليلات</h3>
      
      <div className="time-range-selector">
        <button
          className={timeRange === "day" ? "active" : ""}
          onClick={() => setTimeRange("day")}
        >
          اليوم
        </button>
        <button
          className={timeRange === "week" ? "active" : ""}
          onClick={() => setTimeRange("week")}
        >
          هذا الأسبوع
        </button>
        <button
          className={timeRange === "month" ? "active" : ""}
          onClick={() => setTimeRange("month")}
        >
          هذا الشهر
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">مشاهدات الصفحة</span>
          <span className="stat-value">{data.pageViews.toLocaleString()}</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">الزوار الفريدون</span>
          <span className="stat-value">{data.uniqueVisitors.toLocaleString()}</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">معدل الارتداد</span>
          <span className="stat-value">{data.bounceRate}%</span>
        </div>
        
        <div className="stat-card">
          <span className="stat-label">متوسط مدة الجلسة</span>
          <span className="stat-value">{formatDuration(data.avgSessionDuration)}</span>
        </div>
      </div>
      
      <button onClick={fetchAnalytics} className="refresh-btn">
        تحديث
      </button>
    </div>
  );
};

export const toolConfig = {
  name: "AnalyticsDashboard",
  title: "لوحة التحليلات",
  icon: "bar-chart",
  component: AnalyticsDashboard
};
```

---

## كيفية استخدام القوالب

```powershell
# 1. نسخ القالب
Copy-Item "templates\SimpleComponent.tsx" "plugins\MyPlugin\src\components\MyComponent.tsx"

# 2. تعديل القالب حسب الحاجة
# افتح الملف وعدّل الأسماء والخصائص

# 3. بناء الإضافة
Build-WebstudioPlugin -PluginPath "plugins\MyPlugin"
```

---

## نصائح لاختيار القالب المناسب

| القالب | متى تستخدمه | المميزات |
|--------|-------------|----------|
| **SimpleComponent** | مكون بسيط بألوان متعددة | سهل التخصيص، خيارات متعددة |
| **SidePanel** | لوحة جانبية لعرض البيانات | جلب بيانات، تحديث، أخطاء |
| **ApiIntegration** | ربط مع API خارجي | GET, POST, PUT, DELETE |
| **FormComponent** | نماذج إدخال | تحقق، أخطاء، نجاح |
| **AnalyticsDashboard** | عرض إحصائيات | تحديث تلقائي، تنسيق الأرقام |

---

*القوالب جاهزة للاستخدام مباشرة!*
