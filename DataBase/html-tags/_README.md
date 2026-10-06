# أرشيف وسوم HTML — المصدر w3schools

المصدر: https://www.w3schools.com/tags/default.asp
الحجم: 117 ملف وسم (`tag.<name>.json`) + الفهرس + العلاقات.

## بنية ملف الوسم

```json
{
  "tag": "img",
  "page": "https://www.w3schools.com/tags/tag_img.asp",
  "function": "The <img> tag is used to embed an image...",
  "category": "media",
  "attributes": [{ "name": "src", "values": "URL", "function": "Specifies the path..." }],
  "attributeCount": 12,
  "globalAttributes": true,
  "eventAttributes": true,
  "related": { "parents": ["figure", "picture"], "children": [] }
}
```

- `function` = وصف الوسم، `attributes[].function` = وظيفة كل خاصية.
- الوسوم بلا خصائص خاصة (مثل `div`, `span`, `header`) يكون `attributes` فارغا
  وتعتمد على الخصائص العامة — وهذا طبيعي وصحيح حسب المرجع.

## المجموعات الوظيفية (`_relations.json → groups`)

| المجموعة | العدد | الاستخدام |
|----------|-------|-----------|
| text | 40 | نصوص وقوائم وتضمين دلالي (`p`, `ul`, `span`, `a`) |
| forms | 14 | نماذج (`form`, `input`, `button`, `select`) |
| media | 11 | صور وفيديو وتضمين (`img`, `video`, `svg`) |
| tables | 10 | جداول (`table` ← `tr` ← `td/th`) |
| sectioning | 9 | هيكل دلالي (`header`, `main`, `footer`, `nav`, `section`) |
| document | 8 | هيكل الصفحة (`html`, `head`, `body`, `meta`) |
| scripting | 4 | سكربت وقوالب (`script`, `canvas`, `template`) |
| interactive | 3 | تفاعل (`details/summary`, `dialog`) |
| edits | 2 | (`del`, `ins`) |
| other | 3 | (`comment`, `doctype`, `param`) |

## أهم العلاقات (أب ← أبناء)

- `ul/ol/menu` ← `li` — القوائم لا تقبل غير عناصرها.
- `dl` ← `dt` + `dd` — قاموس المصطلحات.
- `table` ← `thead/tbody/tfoot` ← `tr` ← `td/th` — أعمق تداخل إلزامي.
- `select` ← `option/optgroup`, `form` ← `input/button/select/textarea`.
- `figure` ← `img` + `figcaption`, `picture` ← `source` + `img`.
- `video/audio` ← `source` + `track`, `details` ← `summary`.
- `ruby` ← `rt` + `rp` — حاشية النطق الآسيوية.

## الخصائص المشتركة بين الوسوم (clusters)

- `name` (13 وسمًا): كل عناصر النماذج تقريبا — مفتاح ربط الحقول.
- `src` (9): كل الوسوم المحملة من الخارج (`img`, `video`, `iframe`, `script`...).
- `type` (9): `input`, `button`, `script`, `link` — محدد السلوك.
- `form` (9): ربط عنصر بنموذج خارج شجرته.
- `value` (8): القيمة المرسلة (`input`, `option`, `button`...).
- `disabled` (7): كل عناصر النماذج التفاعلية.
- `width` / `height` (7): الوسوم المرئية ذات الأبعاد.

## ملاحظة للأداة (Web Builder)

- الكتالوج الحالي في `tag-attrs.ts` يغطي ~20 وسمًا شائعًا — هذا الأرشيف
  هو المرجع الموسع عند إضافة وسوم جديدة (مثل `table`, `ul`, `li`, `a`).
- قاعدة: أي وسم حاوية جديد يجب أن يسجل أبناءه المسموحين من جدول
  العلاقات أعلاه ليستخدمها الفحص الذكي لاحقا.
