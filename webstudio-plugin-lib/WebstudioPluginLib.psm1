# Webstudio Plugin Library
# مكتبة إضافات Webstudio
# الإصدار: 1.0.0
# التاريخ: 1 سبتمبر 2026

# ============================================================
# أوامر مكتبة الإضافات
# ============================================================

#ammersغ
<#
.SYNOPSIS
    إنشاء إضافة جديدة لـ Webstudio

.DESCRIPTION
    ينشئ هيكل الإضافة الكامل مع جميع الملفات المطلوبة

.PARAMETER PluginName
    اسم الإضافة (بالإنجليزية، بدون مسافات)

.PARAMETER Description
    وصف الإضافة بالعربية

.PARAMETER Author
    اسم المطور

.PARAMETER Version
    إصدار الإضافة (الافتراضي: 1.0.0)

.PARAMETER Type
    نوع الإضافة: component, panel, tool, integration

.EXAMPLE
    .\New-WebstudioPlugin.ps1 -PluginName "MyButton" -Description "زر مخصص" -Author "Ahmed" -Type "component"
#>
function New-WebstudioPlugin {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PluginName,
        
        [Parameter(Mandatory=$false)]
        [string]$Description = "إضافة جديدة لـ Webstudio",
        
        [Parameter(Mandatory=$false)]
        [string]$Author = "Developer",
        
        [Parameter(Mandatory=$false)]
        [string]$Version = "1.0.0",
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("component", "panel", "tool", "integration")]
        [string]$Type = "component"
    )
    
    $baseDir = "G:\ForWork\ExProject\webstudio-plugin-lib"
    $pluginDir = "$baseDir\plugins\$PluginName"
    
    Write-Host "=== إنشاء إضافة جديدة: $PluginName ===" -ForegroundColor Cyan
    
    # إنشاء مجلد الإضافة
    New-Item -ItemType Directory -Path $pluginDir -Force | Out-Null
    New-Item -ItemType Directory -Path "$pluginDir\src" -Force | Out-Null
    New-Item -ItemType Directory -Path "$pluginDir\src\components" -Force | Out-Null
    
    # إنشاء package.json
    $packageJson = @"
{
  "name": "webstudio-plugin-$PluginName",
  "version": "$Version",
  "description": "$Description",
  "author": "$Author",
  "license": "AGPL-3.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "jest"
  },
  "dependencies": {
    "@webstudio-is/react-sdk": "latest",
    "@webstudio-is/design-system": "latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0"
  }
}
"@
    $packageJson | Set-Content -Path "$pluginDir\package.json" -Encoding UTF8
    
    # إنشاء tsconfig.json
    $tsconfig = @"
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
"@
    $tsconfig | Set-Content -Path "$pluginDir\tsconfig.json" -Encoding UTF8
    
    # إنشاء الملف الرئيسي حسب النوع
    switch ($Type) {
        "component" {
            $indexContent = @"
import type { ComponentProps } from "react";
import { getStyleRule } from "@webstudio-is/react-sdk";

// المكون الرئيسي
export const ${PluginName} = (props: ComponentProps<"div">) => {
  return <div {...props}>{props.children}</div>;
};

// وصف المكون لـ Webstudio
export const meta = {
  type: "container" as const,
  icon: "div",
  title: "$PluginName",
  description: "$Description",
  order: 1,
  props: []
};
"@
            $indexContent | Set-Content -Path "$pluginDir\src\index.tsx" -Encoding UTF8
        }
        "panel" {
            $indexContent = @"
import { useStore } from "@webstudio-is/react-sdk";

// اللوحة الجانبية
export const ${PluginName}Panel = () => {
  const store = useStore();
  
  return (
    <div className="plugin-panel">
      <h3>$PluginName</h3>
      <p>$Description</p>
    </div>
  );
};

// تسجيل اللوحة
export const panel = {
  name: "$PluginName",
  title: "$PluginName",
  component: ${PluginName}Panel
};
"@
            $indexContent | Set-Content -Path "$pluginDir\src\index.tsx" -Encoding UTF8
        }
        "tool" {
            $indexContent = @"
// الأداة المساعدة
export const ${PluginName}Tool = {
  name: "$PluginName",
  description: "$Description",
  
  execute: async (input: any) => {
    // تنفيذ الأداة
    return { success: true, result: input };
  }
};

export default ${PluginName}Tool;
"@
            $indexContent | Set-Content -Path "$pluginDir\src\index.tsx" -Encoding UTF8
        }
        "integration" {
            $indexContent = @"
// التكامل مع خدمة خارجية
export const ${PluginName}Integration = {
  name: "$PluginName",
  description: "$Description",
  
  // الاتصال بالخدمة
  connect: async (config: any) => {
    return { connected: true };
  },
  
  // جلب البيانات
  fetchData: async (endpoint: string) => {
    const response = await fetch(endpoint);
    return response.json();
  }
};

export default ${PluginName}Integration;
"@
            $indexContent | Set-Content -Path "$pluginDir\src\index.tsx" -Encoding UTF8
        }
    }
    
    # إنشاء ملف README
    $readme = @"
# $PluginName

$Description

## التثبيت

```bash
npm install webstudio-plugin-$PluginName
```

## الاستخدام

```tsx
import { ${PluginName} } from "webstudio-plugin-$PluginName";

// في المكون
<${PluginName}>محتوى</${PluginName}>
```

## التصنيف
- النوع: $Type
- المطور: $Author
- الإصدار: $Version

## الترخيص
AGPL-3.0
"@
    $readme | Set-Content -Path "$pluginDir\README.md" -Encoding UTF8
    
    Write-Host "تم إنشاء الإضافة بنجاح!" -ForegroundColor Green
    Write-Host "المجلد: $pluginDir" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "الملفات المنشأة:" -ForegroundColor Cyan
    Get-ChildItem -Path $pluginDir -Recurse -File | Select-Object Name
}

# ============================================================
#أمر2: إنشاء مكون جديد
# ============================================================

<#
.SYNOPSIS
    إنشاء مكون React جديد لـ Webstudio

.DESCRIPTION
    ينشئ مكون React جديد مع جميع الأنماط والخصائص المطلوبة

.PARAMETER ComponentName
    اسم المكون

.PARAMETER Category
    التصنيف: layout, text, media, form, interactive

.PARAMETER HasChildren
    هل يحتوي المكون على أبناء (contained)

.PARAMETER Props
    الخصائص الإضافية (JSON format)

.EXAMPLE
    .\New-WebstudioComponent.ps1 -ComponentName "Card" -Category "layout" -HasChildren $true
#>
function New-WebstudioComponent {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ComponentName,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("layout", "text", "media", "form", "interactive")]
        [string]$Category = "layout",
        
        [Parameter(Mandatory=$false)]
        [bool]$HasChildren = $true,
        
        [Parameter(Mandatory=$false)]
        [string]$Props = "[]"
    )
    
    $componentDir = "G:\ForWork\ExProject\webstudio-plugin-lib\components"
    New-Item -ItemType Directory -Path $componentDir -Force | Out-Null
    
    Write-Host "=== إنشاء مكون: $ComponentName ===" -ForegroundColor Cyan
    
    # تحديد نوع المكون
    $componentType = if ($HasChildren) { "container" } else { "none" }
    
    # إنشاء المكون
    $componentContent = @"
import type { ComponentProps } from "react";
import { getStyleRule } from "@webstudio-is/react-sdk";

type ${ComponentName}Props = ComponentProps<"div">;

export const ${ComponentName} = (props: ${ComponentName}Props) => {
  return (
    <div
      {...props}
      style={{
        // الأنماط الافتراضية
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

// وصف المكون
export const meta = {
  type: "${componentType}" as const,
  icon: "box",
  title: "$ComponentName",
  description: "مكون $Category جديد",
  category: "$Category",
  props: $Props
};
"@
    $componentContent | Set-Content -Path "$componentDir\$ComponentName.tsx" -Encoding UTF8
    
    # إنشاء ملف الأنماط
    $stylesContent = @"
/* أنماط $ComponentName */
.${ComponentName,,} {
  padding: 16px;
  border-radius: 8px;
  background-color: #ffffff;
}

.${ComponentName,,}:hover {
  opacity: 0.9;
}
"@
    $stylesContent | Set-Content -Path "$componentDir\$ComponentName.styles.css" -Encoding UTF8
    
    Write-Host "تم إنشاء المكون بنجاح!" -ForegroundColor Green
    Write-Host "الملفات:" -ForegroundColor Yellow
    Write-Host "  - $componentDir\$ComponentName.tsx" -ForegroundColor Gray
    Write-Host "  - $componentDir\$ComponentName.styles.css" -ForegroundColor Gray
}

# ============================================================
# أمر3: إنشاء لوحة جانبية جديدة
# ============================================================

<#
.SYNOPSIS
    إنشاء لوحة جانبية جديدة لـ Webstudio

.DESCRIPTION
    ينشئ لوحة جانبية (Panel) جديدة لعرض الأدوات أو الإعدادات

.PARAMETER PanelName
    اسم اللوحة

.PARAMETER Position
    الموضع: left, right, bottom

.PARAMETER Icon
    الأيقونة (اسم Lucide icon)

.EXAMPLE
    .\New-WebstudioPanel.ps1 -PanelName "SEOTools" -Position "right" -Icon "search"
#>
function New-WebstudioPanel {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PanelName,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("left", "right", "bottom")]
        [string]$Position = "right",
        
        [Parameter(Mandatory=$false)]
        [string]$Icon = "settings"
    )
    
    $panelDir = "G:\ForWork\ExProject\webstudio-plugin-lib\panels"
    New-Item -ItemType Directory -Path $panelDir -Force | Out-Null
    
    Write-Host "=== إنشاء لوحة: $PanelName ===" -ForegroundColor Cyan
    
    $panelContent = @"
import { useState } from "react";
import { useStore } from "@webstudio-is/react-sdk";
import { Panel, PanelHeader, PanelContent, PanelFooter } from "@webstudio-is/design-system";

type ${PanelName}PanelProps = {
  onClose?: () => void;
};

export const ${PanelName}Panel = ({ onClose }: ${PanelName}PanelProps) => {
  const store = useStore();
  const [data, setData] = useState<any>(null);
  
  return (
    <Panel position="$Position">
      <PanelHeader
        title="$PanelName"
        icon={<icon-lucide-$Icon />}
        onClose={onClose}
      />
      
      <PanelContent>
        {/* محتوى اللوحة */}
        <div className="panel-content">
          <p>محتوى لوحة $PanelName</p>
          {/* أضف المحتوى هنا */}
        </div>
      </PanelContent>
      
      <PanelFooter>
        {/* أزرار الإجراءات */}
      </PanelFooter>
    </Panel>
  );
};

// تسجيل اللوحة
export const panelConfig = {
  name: "$PanelName",
  title: "$PanelName",
  position: "$Position",
  icon: "$Icon",
  component: ${PanelName}Panel
};
"@
    $panelContent | Set-Content -Path "$panelDir\$PanelName.tsx" -Encoding UTF8
    
    Write-Host "تم إنشاء اللوحة بنجاح!" -ForegroundColor Green
    Write-Host "الملف: $panelDir\$PanelName.tsx" -ForegroundColor Yellow
}

# ============================================================
# أمر4: إنشاء نقطة توقف (Breakpoint)
# ============================================================

<#
.SYNOPSIS
    إنشاء نقطة توقف مخصصة

.DESCRIPTION
    يضيف نقطة توقف جديدة للتصميم المرن

.PARAMETER BreakpointName
    اسم نقطة التوقف

.PARAMETER MinWidth
    الحد الأدنى للعرض (بالبكسل)

.PARAMETER MaxWidth
    الحد الأقصى للعرض (بالبكسل)

.EXAMPLE
    .\New-WebstudioBreakpoint.ps1 -BreakpointName "LargeDesktop" -MinWidth 1440 -MaxWidth 1920
#>
function New-WebstudioBreakpoint {
    param(
        [Parameter(Mandatory=$true)]
        [string]$BreakpointName,
        
        [Parameter(Mandatory=$false)]
        [int]$MinWidth = 0,
        
        [Parameter(Mandatory=$false)]
        [int]$MaxWidth = 9999
    )
    
    Write-Host "=== إنشاء نقطة توقف: $BreakpointName ===" -ForegroundColor Cyan
    
    $breakpointConfig = @"
// نقطة التوقف: $BreakpointName
export const ${BreakpointName}Breakpoint = {
  name: "$BreakpointName",
  minWidth: $MinWidth,
  maxWidth: $MaxWidth,
  styles: {
    // الأنماط الخاصة بنقطة التوقف هذه
  }
};

// إضافتها إلى قائمة نقاط التوقف
export const breakpoints = [
  { name: "Mobile", minWidth: 0, maxWidth: 767 },
  { name: "Tablet", minWidth: 768, maxWidth: 1023 },
  { name: "Desktop", minWidth: 1024, maxWidth: 1439 },
  ${BreakpointName}Breakpoint
];
"@
    
    $breakpointConfig | Set-Content -Path "G:\ForWork\ExProject\webstudio-plugin-lib\breakpoints\$BreakpointName.ts" -Encoding UTF8
    
    Write-Host "تم إنشاء نقطة التوقف بنجاح!" -ForegroundColor Green
}

# ============================================================
# أمر5: إنشاء تكامل مع خدمة خارجية
# ============================================================

<#
.SYNOPSIS
    إنشاء تكامل مع خدمة خارجية

.DESCRIPTION
    ينشئ كود التكامل مع API خارجي

.PARAMETER ServiceName
    اسم الخدمة

.PARAMETER ApiUrl
    رابط API

.PARAMETER AuthType
    نوع المصادقة: none, apikey, oauth, bearer

.EXAMPLE
    .\New-WebstudioIntegration.ps1 -ServiceName "Stripe" -ApiUrl "https://api.stripe.com" -AuthType "apikey"
#>
function New-WebstudioIntegration {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ServiceName,
        
        [Parameter(Mandatory=$false)]
        [string]$ApiUrl = "",
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("none", "apikey", "oauth", "bearer")]
        [string]$AuthType = "none"
    )
    
    $integrationDir = "G:\ForWork\ExProject\webstudio-plugin-lib\integrations"
    New-Item -ItemType Directory -Path $integrationDir -Force | Out-Null
    
    Write-Host "=== إنشاء تكامل: $ServiceName ===" -ForegroundColor Cyan
    
    # إنشاء كود المصادقة
    $authCode = switch ($AuthType) {
        "none" { "" }
        "apikey" { @"
  // المصادقة بمفتاح API
  const apiKey = process.env.${ServiceName.ToUpper()}_API_KEY;
  headers: { "Authorization": `Bearer `${apiKey}`" }
"@
        }
        "bearer" { @"
  // المصادقة بـ Bearer Token
  const token = process.env.${ServiceName.ToUpper()}_TOKEN;
  headers: { "Authorization": `Bearer `${token}`" }
"@
        }
        "oauth" { @"
  // المصادقة عبر OAuth
  const accessToken = await getOAuthToken("$ServiceName");
  headers: { "Authorization": `Bearer `${accessToken}`" }
"@
        }
    }
    
    $integrationContent = @"
// تكامل مع $ServiceName
export const ${ServiceName}Integration = {
  name: "$ServiceName",
  description: "تكامل مع $ServiceName",
  
  // إعدادات الاتصال
  config: {
    baseUrl: "$ApiUrl",
    authType: "$AuthType"
  },
  
  // جلب البيانات
  async fetchData(endpoint: string, options?: RequestInit) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        $authCode
      }
    });
    
    if (!response.ok) {
      throw new Error(`خطأ في الاتصال بـ $ServiceName: `${response.status}`");
    }
    
    return response.json();
  },
  
  // إرسال البيانات
  async postData(endpoint: string, data: any) {
    return this.fetchData(endpoint, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
};

export default ${ServiceName}Integration;
"@
    
    $integrationContent | Set-Content -Path "$integrationDir\$ServiceName.ts" -Encoding UTF8
    
    Write-Host "تم إنشاء التكامل بنجاح!" -ForegroundColor Green
    Write-Host "الملف: $integrationDir\$ServiceName.ts" -ForegroundColor Yellow
}

# ============================================================
# أمر6: بناء الإضافة
# ============================================================

<#
.SYNOPSIS
    بناء الإضافة للإنتاج

.DESCRIPTION
    يجمع الكود ويصنّعه للنشر

.PARAMETER PluginPath
    مسار مجلد الإضافة

.EXAMPLE
    .\Build-WebstudioPlugin.ps1 -PluginPath "C:\plugins\MyPlugin"
#>
function Build-WebstudioPlugin {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PluginPath
    )
    
    Write-Host "=== بناء الإضافة ===" -ForegroundColor Cyan
    
    if (-not (Test-Path "$PluginPath\package.json")) {
        Write-Host "خطأ: لا يوجد package.json في $PluginPath" -ForegroundColor Red
        return
    }
    
    # تثبيت التبعيات
    Write-Host "تثبيت التبعيات..." -ForegroundColor Yellow
    Push-Location $PluginPath
    npm install
    Pop-Location
    
    # البناء
    Write-Host "البناء..." -ForegroundColor Yellow
    Push-Location $PluginPath
    npm run build
    Pop-Location
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "تم البناء بنجاح!" -ForegroundColor Green
        Write-Host "الملفات المصنّعة: $PluginPath\dist" -ForegroundColor Yellow
    } else {
        Write-Host "خطأ في البناء!" -ForegroundColor Red
    }
}

# ============================================================
# أمر7: اختبار الإضافة
# ============================================================

<#
.SYNOPSIS
    اختبار الإضافة

.DESCRIPTION
    يشغّل الاختبارات للتأكد من عمل الإضافة

.PARAMETER PluginPath
    مسار مجلد الإضافة

.EXAMPLE
    .\Test-WebstudioPlugin.ps1 -PluginPath "C:\plugins\MyPlugin"
#>
function Test-WebstudioPlugin {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PluginPath
    )
    
    Write-Host "=== اختبار الإضافة ===" -ForegroundColor Cyan
    
    Push-Location $PluginPath
    
    # تشغيل TypeScript check
    Write-Host "فحص TypeScript..." -ForegroundColor Yellow
    npx tsc --noEmit
    
    # تشغيل الاختبارات
    Write-Host "تشغيل الاختبارات..." -ForegroundColor Yellow
    npm test
    
    Pop-Location
    
    Write-Host "اكتمل الاختبار!" -ForegroundColor Green
}

# ============================================================
# أمر8: تصدير الإضافة
# ============================================================

<#
.SYNOPSIS
    تصدير الإضافة كملف مضغوط

.DESCRIPTION
    ينشئ ملف ZIP جاهز للمشاركة أو النشر

.PARAMETER PluginPath
    مسار مجلد الإضافة

.PARAMETER OutputPath
    مسار الإخراج (الافتراضي: سطح المكتب)

.EXAMPLE
    .\Export-WebstudioPlugin.ps1 -PluginPath "C:\plugins\MyPlugin" -OutputPath "C:\Exports"
#>
function Export-WebstudioPlugin {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PluginPath,
        
        [Parameter(Mandatory=$false)]
        [string]$OutputPath = "C:\Users\Administrator\Desktop"
    )
    
    Write-Host "=== تصدير الإضافة ===" -ForegroundColor Cyan
    
    $pluginName = Split-Path $PluginPath -Leaf
    $zipFile = "$OutputPath\$pluginName.zip"
    
    # إنشاء ملف ZIP
    Compress-Archive -Path "$PluginPath\*" -DestinationPath $zipFile -Force
    
    Write-Host "تم التصدير بنجاح!" -ForegroundColor Green
    Write-Host "الملف: $zipFile" -ForegroundColor Yellow
}

# ============================================================
# أمر9: عرض الإضافات المثبتة
# ============================================================

<#
.SYNOPSIS
    عرض جميع الإضافات المثبتة

.DESCRIPTION
    يعرض قائمة بجميع الإضافات المتاحة

.EXAMPLE
    .\Get-WebstudioPlugins.ps1
#>
function Get-WebstudioPlugins {
    Write-Host "=== الإضافات المثبتة ===" -ForegroundColor Cyan
    
    $pluginsDir = "G:\ForWork\ExProject\webstudio-plugin-lib\plugins"
    
    if (-not (Test-Path $pluginsDir)) {
        Write-Host "لا توجد إضافات مثبتة" -ForegroundColor Yellow
        return
    }
    
    $plugins = Get-ChildItem -Path $pluginsDir -Directory
    
    if ($plugins.Count -eq 0) {
        Write-Host "لا توجد إضافات مثبتة" -ForegroundColor Yellow
        return
    }
    
    foreach ($plugin in $plugins) {
        $packageJson = Get-Content "$($plugin.FullName)\package.json" -Raw | ConvertFrom-Json
        Write-Host ""
        Write-Host "  الاسم: $($plugin.Name)" -ForegroundColor White
        Write-Host "  الوصف: $($packageJson.description)" -ForegroundColor Gray
        Write-Host "  الإصدار: $($packageJson.version)" -ForegroundColor Gray
        Write-Host "  المطور: $($packageJson.author)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "العدد: $($plugins.Count) إضافات" -ForegroundColor Green
}

# ============================================================
# أمر10: حذف إضافة
# ============================================================

<#
.SYNOPSIS
    حذف إضافة

.DESCRIPTION
    يحذف إضافةpecified

.PARAMETER PluginName
    اسم الإضافة المراد حذفها

.EXAMPLE
    .\Remove-WebstudioPlugin.ps1 -PluginName "MyPlugin"
#>
function Remove-WebstudioPlugin {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PluginName
    )
    
    $pluginDir = "G:\ForWork\ExProject\webstudio-plugin-lib\plugins\$PluginName"
    
    if (-not (Test-Path $pluginDir)) {
        Write-Host "الإضافة $PluginName غير موجودة" -ForegroundColor Red
        return
    }
    
    Write-Host "=== حذف الإضافة: $PluginName ===" -ForegroundColor Yellow
    Write-Host "هل أنت متأكد من حذف $PluginName؟ (Y/N)" -ForegroundColor Yellow
    $confirm = Read-Host
    
    if ($confirm -eq "Y" -or $confirm -eq "y") {
        Remove-Item -Path $pluginDir -Recurse -Force
        Write-Host "تم حذف الإضافة بنجاح!" -ForegroundColor Green
    } else {
        Write-Host "تم الإلغاء" -ForegroundColor Gray
    }
}

# ============================================================
# التصدير
# ============================================================

Export-ModuleMember -Function @(
    "New-WebstudioPlugin",
    "New-WebstudioComponent",
    "New-WebstudioPanel",
    "New-WebstudioBreakpoint",
    "New-WebstudioIntegration",
    "Build-WebstudioPlugin",
    "Test-WebstudioPlugin",
    "Export-WebstudioPlugin",
    "Get-WebstudioPlugins",
    "Remove-WebstudioPlugin"
)
