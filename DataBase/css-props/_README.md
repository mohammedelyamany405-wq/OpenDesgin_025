# أرشيف خصائص CSS — المصدر w3schools

المصدر: https://www.w3schools.com/cssref/index.php
الحجم: 358 ملف خاصية (`css.<name>.json`) + الفهرس + العلاقات.

## بنية ملف الخاصية

```json
{
  "property": "flex-direction",
  "page": "https://www.w3schools.com/cssref/css3_pr_flex-direction.php",
  "function": "The flex-direction property specifies the direction...",
  "category": "flexbox",
  "syntax": "flex-direction: row|row-reverse|column|column-reverse|initial|inherit;",
  "defaults": {
    "Default value": "row",
    "Inherited": "no",
    "Animatable": "no",
    "Version": "CSS3",
    "JavaScript syntax": "object.style.flexDirection=\"column\""
  },
  "values": [{ "value": "row", "function": "Default value. The flexible items..." }],
  "valueCount": 6,
  "shorthandFor": [],
  "partOf": ["flex-flow"]
}
```

- الإجمالي: 2103 قيمة موثقة بوظائفها.
- 3 ملفات بلا قيم بشكل صحيح (`@font-face`, `@scope`, `@starting-style`):
  قواعد `@` تعرف واصفات (descriptors) لا قيما — ليست ناقصة.

## المجموعات الوظيفية (`_relations.json → groups`)

| المجموعة | العدد | الاستخدام |
|----------|-------|-----------|
| box | 66 | الأبعاد والهوامش والحشو والعرض |
| border | 64 | الحدود والزوايا (تشمل `border-top-*`...) |
| text | 55 | الخطوط والنصوص والقوائم |
| scroll | 27 | التمرير وsnap والحشو التمريري |
| background | 26 | الخلفيات والظلال والأقنعة |
| position | 24 | التموضع والطفو والطبقات |
| flexbox | 20 | المحاذاة والتوزيع المرن |
| grid | 15 | الشبكة ثنائية البعد |
| at-rules | 14 | قواعد `@` (media, supports, font-face...) |
| animation | 10 | الحركات |
| transform | 9 | التحويلات والمنظور |
| color | 8 | الألوان والشفافية والفلاتر |
| tables | 5 | الجداول والطباعة المرتبطة |
| transition | 5 | الانتقالات |
| svg | 4 | علامات SVG |
| print | 3 | فواصل الصفحات |
| ui | 3 | السلوك (`user-select`, `appearance`...) |

## أهم العلاقات (shorthand ← longhands)

- `margin/padding` ← الاتجاهات الأربعة.
- `border*` ← width/style/color لكل جهة، و`border-radius` ← الزوايا الأربع.
- `font` ← style/variant/weight/size/line-height/family.
- `flex` ← grow/shrink/basis، و`flex-flow` ← direction/wrap.
- `grid` ← template/areas، و`place-*` ← align/justify.
- `animation` ← الخصائص الثماني، و`transition` ← الأربع.
- `overflow` ← x/y، و`gap` ← row/column.

## ملاحظة للأداة (Web Builder)

- مولد CSS في التصدير يجب أن يفضل **longhands** عند وجود تجاوزات
  لكل breakpoint (حتى لا يمحو shorthand قيمة مصرحة).
- حقل `JavaScript syntax` يفيد لو بنينا محرر أنماط تفاعلي لاحقا.
- القيم `initial/inherit/unset` متكررة في كل خاصية — تُستبعد من
  اقتراحات المصمم وتبقى للتصدير فقط.
