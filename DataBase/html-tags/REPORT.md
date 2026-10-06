# تقرير مجلد أرشيف وسوم HTML

المسار المحلي: `G:\ForWork\ExProject\DataBase\html-tags`
المصدر: https://www.w3schools.com/tags/default.asp
التاريخ: 2026-10-05

## المحتويات (121 ملفا، ~106KB)

| النوع | العدد | الوصف |
|-------|-------|-------|
| `tag.<name>.json` | 117 | ملف لكل وسم: وظيفته + خصائصه + وظيفة كل خاصية |
| `_index.json` | 1 | فهرس كل الوسوم + المصدر |
| `_relations.json` | 1 | المجموعات + علاقات أب/أبناء + الخصائص المشتركة |
| `_README.md` | 1 | الملخص المقروء وقواعد الاستخدام |
| `REPORT.md` | 1 | هذا التقرير |

## التغطية

- 117/117 وسمًا بلا نواقص (تشمل `comment` و`doctype` و`svg`).
- 46 وسما بخصائص خاصة، الباقي يعتمد على الخصائص العامة فقط.
- كل وسم يحمل `globalAttributes: true` و`eventAttributes: true` حسب المرجع.

## الوسوم المحفوظة (أبجدي)

a, abbr, acronym, address, area, article, aside, audio, b, base, bdi, bdo,
blockquote, body, br, button, canvas, caption, cite, code, col, colgroup,
comment, data, datalist, dd, del, details, dfn, dialog, dir, div, dl,
doctype, dt, em, embed, fieldset, figcaption, figure, footer, form,
h1, h2, h3, h4, h5, h6, head, header, hgroup, hr, html, i, iframe,
img, input, ins, kbd, label, legend, li, link, main, map, mark, menu,
meta, meter, nav, noscript, object, ol, optgroup, option, output, p,
param, picture, pre, progress, q, rp, rt, ruby, s, samp, script,
search, section, select, small, source, span, strong, style, sub,
summary, sup, svg, table, tbody, td, template, textarea, tfoot, th,
thead, time, title, tr, track, u, ul, var, video, wbr

## مثال بنية الملف

```json
{
  "tag": "img",
  "page": "https://www.w3schools.com/tags/tag_img.asp",
  "function": "The <img> tag is used to embed an image in an HTML page.",
  "category": "media",
  "attributes": [{ "name": "src", "values": "URL", "function": "Specifies the path to the image" }],
  "attributeCount": 12,
  "globalAttributes": true,
  "eventAttributes": true,
  "related": { "parents": ["figure", "picture"], "children": [] }
}
```
