# تقرير نماذج البيانات المطلوب ترجمتها: Lunacy ↔ Webstudio
# أساس بناء مترجم الجسر (Bridge Translator)
# تاريخ الإنشاء: 2026-08-23

================================================================================
أولاً: نموذج Lunacy (صيغة FREE)
================================================================================

Lunacy يخزن كل شيء كـ JSON داخل ملف ZIP. البنية:
  pages/       (طبقات كل صفحة)
  shared/      (المكتبات والأنماط المشتركة)
  document.json (المتغيرات، الأنماط، الخطوط)
  images/      (الصور الراسترية)
  fonts/       (الخطوط المدمجة)

أنواع الطبقات (_t):
  RECT, OVAL, TEXT, FRAME, GROUP, PATH, COMPONENT, INSTANCE,
  LINE, STAR, POLYGON, TRIANGLE, SECTION, SLOT, SHAPE, SLICE, CONNECTOR

حقول الطبقة الأساسية (كل طبقة تملكها):
  Id            ShortGUID فريد
  Name          اسم الطبقة
  Locked        bool
  Hidden        bool
  Pos:[x,y]     إحداثيات (يتجاوز Transform)
  Size:[w,h]    الحجم (يتجاوز Transform)
  Frame:[x,y,w,h]  الموضع+الحجم بخاصية واحدة (يتجاوز الكل)
  Transform:[sx,skx,tx,sky,sy,ty]  مصفوفة 6 أرقام (إزاحة/دوران/انقلاب)
  Opacity:0..1
  BlendMode
  CornerRadius:float[4]  (4 زوايا: tl,tr,br,bl)
  Fill:"45C4D3"  لون HEX مختصر (يقبل 45F مختصر أكثر) أو Fills:[...]
  Border:"..."   أو Borders:[...]
  Thickness      سمك الحد
  CustomThickness:[t,r,b,l]
  LinePos        Center / Inside / Outside
  Shadows:[...]
  InnerShadows:[...]
  Blur:{Radius,Type}
  Constraints:"LTWH"  أحرف: L,T,R,B,W,H
  FillsId / BordersId / EffectsId / TextStyleId  (ربط بنمط مشترك)

النص TEXT:
  text, Font:"Inter-Regular", FontSize, Kerning (تباعد أحرف),
  LineHeight, Casing (Normal/Uppercase/Lowercase), Align (Left/Center/Right/Justified),
  Valign, Underline, Strikethrough, ParagraphSpacing, Rtl, MaxLines, Truncate

التخطيط التلقائي AutoLayout:
  Vertical (اتجاه), Spacing (فجوة), WrapSpacing, Padding:[t,r,b,l],
  Align (أفقي), Valign (رأسي), FixWidth, FixHeight, Wrap, TextBaseline

المتغيرات VariableCollection:
  تحتوي Variables من أنواع COLOR / FLOAT / TEXT / BOOL
  كل متغير له Values لكل Theme (وضع فاتح/داكن)

الأنماط:
  TextStyle, ColorStyle(Fill), EffectStyle — لكل Id, Name

================================================================================
ثانياً: نموذج Webstudio
================================================================================

Webstudio يخزن المشروع كـ JSON blob من الحالات (instances) + أنماط + tokens + breakpoints.

شجرة المكونات (Instance):
  { "type": "instance", "id": "zWsc...", "component": "Paragraph",
    "children": [ { "type": "text", "value": "Hello" } ] }

المكونات الأولية:
  Box, Text, Heading, Paragraph, Link, Image, Flex, Grid, Button, ...

الأنماط (CSS Typed Object Model):
  مصفوفة خصائص CSS بقيم مكتوبة:
  { "property": "padding-bottom",
    "value": { "type": "unit", "unit": "px", "value": 10 } }
  أنواع القيمة:
    unit     (px, %, em, rem, vh, vw ...)
    keyword  (border-box)
    rgb/hsl  للألوان
    unparsed (نص حر CSS)

نقاط التوقف (Breakpoints):
  لكل حجم شاشة مجموعة أنماط مستقلة (Base, Desktop, Tablet, Mobile)
  ملاحظة: Lunacy لا يملك هذا مطلقاً

التوكنات (Design Tokens):
  متغيرات CSS قابلة لإعادة الاستخدام
  تتبع معيار W3C Design Tokens
  تحل الأسماء المستعارة (aliases) وتدعم الأوضاع (modes)

================================================================================
ثالثاً: جداول الترجمة المطلوبة
================================================================================

--- 1. الهيكل العام ---
  Lunacy Page تحتوي Layers   ->  Webstudio Page تحتوي Instance tree
  FRAME (حاوية)              ->  Box (component:"Box")
  GROUP                      ->  Box (مجموعة بدون تخطيط)
  تسلسل Layers:[...]         ->  children:[...] من instances

--- 2. أنواع الطبقات ← المكونات ---
  RECT / OVAL / STAR         ->  Box (مع border-radius للدائرة)
  TEXT                       ->  Text / Paragraph / Heading
  FRAME                      ->  Box (container)
  GROUP                      ->  Box
  COMPONENT                  ->  Box (نحدد كمكوّن reusable)
  INSTANCE                   ->  instance من المكوّن
  PATH (معقد)                ->  HtmlEmbed بـ SVG (لا يوجد مكافئ مباشر)

--- 3. الموضع والحجم ---
  Frame:[x,y,w,h]            ->  position, width, height (px)
  Transform:[...]            ->  transform: rotate()/scaleX(-1)
  CornerRadius:[tl,tr,br,bl] ->  border-radius: tl tr br bl
  Constraints:"LTWH"         ->  قيود resize (تُفقد غالباً وتحتاج اجتهاد)

--- 4. التعبئة والألوان ---
  Fill:"45C4D3" (HEX)        ->  background-color / token
  Fills متعددة               ->  طبقات background (Webstudio يدعم واحدة + تدرجات)
  Gradient (Linear/Radial)   ->  background: linear-gradient(...)
  Opacity                    ->  opacity

--- 5. الحدود ---
  Border + Thickness         ->  border: {v}px solid {color}
  CustomThickness:[t,r,b,l]  ->  border-width: t r b l
  LinePos:Inside/Outside     ->  box-sizing / outline (لا يوجد outside تماماً)

--- 6. الظلال والتأثيرات ---
  Shadows:[{X,Y,Blur,Spread,Color}]   ->  box-shadow: x y blur spread color
  InnerShadows                ->  box-shadow: inset ...
  Blur:{Radius}               ->  filter: blur({Radius}px)

--- 7. النص (الأهم والأكثر تعقيداً) ---
  Font:"Inter-Regular"        ->  font-family (نحتاج فصل الاسم عن الوزن)
  FontSize                    ->  font-size
  Kerning                     ->  letter-spacing
  LineHeight                  ->  line-height
  Casing:Uppercase            ->  text-transform: uppercase
  Align:Center                ->  text-align: center
  Underline                   ->  text-decoration: underline
  ParagraphSpacing            ->  margin-bottom (تقريبي)
  Rtl:true                    ->  direction: rtl

--- 8. التخطيط التلقائي ← Flexbox ---
  Vertical:false              ->  display:flex; flex-direction:row
  Vertical:true               ->  flex-direction:column
  Spacing                     ->  gap
  Padding:[t,r,b,l]           ->  padding
  Align (أفقي)                ->  justify-content
  Valign (رأسي)               ->  align-items
  Wrap:true                   ->  flex-wrap:wrap
  FixWidth/FixHeight          ->  width:fit-content أو 100%

--- 9. المتغيرات والأنماط ← Tokens ---
  VariableCollection + COLOR  ->  Design Tokens (ألوان)
  FLOAT vars                  ->  Tokens (مسافات/أحجام)
  TextStyle                   ->  Token (typography)
  ColorStyle                  ->  Token (لون)
  EffectStyle                 ->  Token (ظل)
  Theme (فاتح/داكن)           ->  Token modes

--- 10. ما لا يمكن ترجمته مباشرة (يحتاج قرار) ---
  - Breakpoints:  Lunacy لا يملكها -> ننشئ Base breakpoint واحد فقط
  - Prototyping/Flows:  نترجم OpenUrlAction فقط كـ Link
  - PATH/SVG معقد:  نحوّله HtmlEmbed بصيغة SVG الخام (Lunacy يعطي PathData جاهز)
  - الصور/أيقونات Icons8:  نصدّرها كملفات PNG/SVG ونرفعها لـ Webstudio Image
  - BlendMode:  معظمها mix-blend-mode لكن بعضها غير مدعوم بصرياً كلياً

================================================================================
رابعاً: خلاصة خرائط الترجمة الـ 12 للمترجم
================================================================================

  1. شجرة الطبقات                -> شجرة instances
  2. أنواع الطبقات               -> مكونات
  3. الموضع/الحجم/الدوران        -> CSS position/transform
  4. الزوايا الدائرية            -> border-radius
  5. التعبئة (لون/تدرج)          -> background
  6. الحدود                      -> border
  7. الظلال/الضبابية             -> box-shadow/filter
  8. النصوص                      -> خصائص CSS النصية
  9. التخطيط التلقائي            -> Flexbox
  10. المتغيرات/الأنماط          -> Design Tokens
  11. الصفحات                    -> Pages
  12. معالجة الحالات الخاصة       -> SVG، صور، breakpoints، تفاعلات
