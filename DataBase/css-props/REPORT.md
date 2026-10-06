# تقرير مجلد أرشيف خصائص CSS

المسار المحلي: `G:\ForWork\ExProject\DataBase\css-props`
المصدر: https://www.w3schools.com/cssref/index.php
التاريخ: 2026-10-05

## المحتويات (~510KB)

| النوع | العدد | الوصف |
|-------|-------|-------|
| `css.<name>.json` | 358 | ملف لكل خاصية: وظيفتها + صيغتها + قيمها + وظيفة كل قيمة + الافتراضي |
| `_index.json` | 1 | فهرس كل الخصائص + المصدر |
| `_relations.json` | 1 | المجموعات + علاقات shorthand/longhand |
| `_README.md` | 1 | الملخص المقروء وقواعد الاستخدام |
| `REPORT.md` | 1 | هذا التقرير |

## التغطية

- 358/358 خاصية بلا فشل.
- 2103 قيمة موثقة بوظائفها.
- 3 ملفات بلا قيم بشكل صحيح (`@font-face`, `@scope`, `@starting-style` — واصفات لا قيم).

## مثال بنية الملف

```json
{
  "property": "gap",
  "function": "...",
  "category": "flexbox",
  "syntax": "gap: row-gap column-gap;",
  "defaults": { "Default value": "normal", "Inherited": "no", "Version": "CSS3" },
  "values": [{ "value": "normal", "function": "Default..." }],
  "shorthandFor": ["row-gap", "column-gap"],
  "partOf": []
}
```
