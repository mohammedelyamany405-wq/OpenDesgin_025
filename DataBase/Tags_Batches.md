# دفعات توسيع كتالوج الوسوم (من أرشيف html-tags)

المبدأ: دفعة واحدة في كل مرة (وسوم + خصائص + اختبار) — لا دمج شامل.
المصدر: `DataBase/html-tags/tag.<name>.json` لكل وسم.

## الدفعة 1 — القوائم والنص الدلالي (13)

`ul`, `li`, `ol`, `blockquote`, `pre`, `code`, `hr`, `em`, `mark`,
`small`, `cite`, `q`, `strong`

السبب: الأكثر استخداما في المحتوى بعد الأساسيات. تختبر علاقة أب/أبناء
(`ul/ol ← li`) في الفحص الذكي.

## الدفعة 2 — الجداول (8)

`table`, `caption`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`

السبب: أعمق تداخل إلزامي في HTML — أفضل اختبار لقواعد العلاقات.

## الدفعة 3 — النماذج المتقدمة (8)

`fieldset`, `legend`, `datalist`, `optgroup`, `option`, `output`,
`meter`, `progress`

السبب: تكمل النماذج الموجودة (`input`, `select`...) بخصائصها من الأرشيف.

## الدفعة 4 — الوسائط والتضمين (7)

`audio`, `source`, `track`, `picture`, `iframe`, `map`, `area`

السبب: توسعة `src` والوسائط (الصوت والصور المتجاوبة والخرائط).

## الدفعة 5 — التفاعلية والدلالات الدقيقة (10)

`details`, `summary`, `dialog`, `time`, `data`, `address`,
`hgroup`, `search`, `figure`, `figcaption`

السبب: عناصر حديثة ترفع جودة الدلالات (`figure` موجود بلا خصائص — تكتمل هنا).

## الدفعة 6 — النصوص الدقيقة والتحرير (12)

`sub`, `sup`, `kbd`, `samp`, `var`, `dfn`, `abbr`, `bdi`,
`del`, `ins`, `ruby`, `rt`

السبب: تفاصيل نصية للمحتوى التحريري، منخفضة المخاطر.

## الدفعة 7 — مستوى الصفحة (12، تصدير فقط)

`html`, `head`, `body`, `title`, `meta`, `base`, `script`,
`noscript`, `template`, `canvas`, `link`, `style`

السبب: ليست وسوم تصنيف لعناصر — تدخل قالب التصدير فقط، لذا هي الأخيرة.

## حالة التنفيذ

| الدفعة | الحالة |
|--------|--------|
| 1 | تمت (13 وسما + خصائص ol/li/blockquote/q) |
| 2 | تمت (8 وسوم + خصائص th/td) |
| 3 | تمت (8 وسوم + خصائص fieldset/optgroup/option/output/meter/progress) |
| 4 | تمت (7 وسوم + خصائص audio/source/track/iframe/map/area) |
| 5 | تمت (10 وسوم + خصائص details/dialog/time/data) |
| 6 | تمت (15 وسما + خصائص del/ins) |
| 7 | تمت (canvas/script/noscript/template + إعدادات الصفحة في التصدير) |

## معيار قبول كل دفعة

1. الوسوم مضافة لـ `AVAILABLE_TAGS` + خصائصها في `TAG_ATTRS` من ملفات الأرشيف.
2. `bun run check:vue` نظيف.
3. اختبار حي: تصنيف عنصر + خاصية + تصدير يظهرها.
