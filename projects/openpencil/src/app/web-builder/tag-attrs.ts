// Web Builder — tag catalog + per-tag HTML attributes catalog.
// Reference: https://www.w3schools.com/tags/default.asp
// Stored per node via pluginData:
//   web-builder-tag        -> string (e.g. 'header')
//   web-builder-attrs      -> JSON object { src, alt, href, ... }
//   web-builder-decorative -> 'true' | absent

export interface TagItem {
  tag: string
  label: string
  nameAr: string
}

export interface TagGroup {
  category: string
  items: TagItem[]
}

export const AVAILABLE_TAGS: TagGroup[] = [
  { category: 'Containers', items: [
    { tag: 'div', label: 'Container', nameAr: 'حاوية' },
    { tag: 'section', label: 'Section', nameAr: 'قسم' },
    { tag: 'header', label: 'Header', nameAr: 'رأسية' },
    { tag: 'main', label: 'Main', nameAr: 'رئيسية' },
    { tag: 'footer', label: 'Footer', nameAr: 'تذييل' },
    { tag: 'nav', label: 'Navigation', nameAr: 'تنقل' },
    { tag: 'aside', label: 'Sidebar', nameAr: 'شريط جانبي' },
    { tag: 'article', label: 'Article', nameAr: 'مقال' },
    { tag: 'address', label: 'Address', nameAr: 'تواصل' },
    { tag: 'hgroup', label: 'Hgroup', nameAr: 'مجموعة عناوين' },
    { tag: 'search', label: 'Search', nameAr: 'بحث' }
  ]},
  { category: 'Interactive', items: [
    { tag: 'details', label: 'Details', nameAr: 'تفاصيل' },
    { tag: 'summary', label: 'Summary', nameAr: 'ملخص' },
    { tag: 'dialog', label: 'Dialog', nameAr: 'حوار' },
    { tag: 'time', label: 'Time', nameAr: 'وقت' },
    { tag: 'data', label: 'Data', nameAr: 'بيانات' }
  ]},
  { category: 'Text', items: [
    { tag: 'h1', label: 'Heading 1', nameAr: 'عنوان 1' },
    { tag: 'h2', label: 'Heading 2', nameAr: 'عنوان 2' },
    { tag: 'h3', label: 'Heading 3', nameAr: 'عنوان 3' },
    { tag: 'p', label: 'Paragraph', nameAr: 'فقرة' },
    { tag: 'span', label: 'Span', nameAr: 'نطاق' },
    { tag: 'a', label: 'Link', nameAr: 'رابط' },
    { tag: 'em', label: 'Emphasis', nameAr: 'تأكيد' },
    { tag: 'strong', label: 'Strong', nameAr: 'مهم' },
    { tag: 'mark', label: 'Mark', nameAr: 'تمييز' },
    { tag: 'small', label: 'Small', nameAr: 'نص صغير' },
    { tag: 'cite', label: 'Cite', nameAr: 'عنوان عمل' },
    { tag: 'q', label: 'Quote', nameAr: 'اقتباس' },
    { tag: 'blockquote', label: 'Blockquote', nameAr: 'اقتباس طويل' },
    { tag: 'pre', label: 'Preformatted', nameAr: 'منسق مسبقا' },
    { tag: 'code', label: 'Code', nameAr: 'كود' },
    { tag: 'hr', label: 'Divider', nameAr: 'فاصل' },
    { tag: 'sub', label: 'Subscript', nameAr: 'سفلي' },
    { tag: 'sup', label: 'Superscript', nameAr: 'علوي' },
    { tag: 'kbd', label: 'Keyboard', nameAr: 'لوحة مفاتيح' },
    { tag: 'samp', label: 'Sample', nameAr: 'عينة' },
    { tag: 'var', label: 'Variable', nameAr: 'متغير' },
    { tag: 'dfn', label: 'Definition', nameAr: 'تعريف' },
    { tag: 'abbr', label: 'Abbreviation', nameAr: 'اختصار' },
    { tag: 'bdi', label: 'Bidi Isolate', nameAr: 'عزل اتجاه' },
    { tag: 'del', label: 'Deleted', nameAr: 'محذوف' },
    { tag: 'ins', label: 'Inserted', nameAr: 'مضاف' },
    { tag: 'ruby', label: 'Ruby', nameAr: 'حاشية' },
    { tag: 'rt', label: 'Ruby Text', nameAr: 'نص حاشية' }
  ]},
  { category: 'Lists', items: [
    { tag: 'ul', label: 'Bullet List', nameAr: 'قائمة نقطية' },
    { tag: 'ol', label: 'Numbered List', nameAr: 'قائمة مرقمة' },
    { tag: 'li', label: 'List Item', nameAr: 'عنصر قائمة' }
  ]},
  { category: 'Tables', items: [
    { tag: 'table', label: 'Table', nameAr: 'جدول' },
    { tag: 'caption', label: 'Caption', nameAr: 'عنوان جدول' },
    { tag: 'thead', label: 'Head', nameAr: 'رأس جدول' },
    { tag: 'tbody', label: 'Body', nameAr: 'جسم جدول' },
    { tag: 'tfoot', label: 'Foot', nameAr: 'ذيل جدول' },
    { tag: 'tr', label: 'Row', nameAr: 'صف' },
    { tag: 'th', label: 'Header Cell', nameAr: 'خلية رأس' },
    { tag: 'td', label: 'Cell', nameAr: 'خلية' }
  ]},
  { category: 'Media', items: [
    { tag: 'img', label: 'Image', nameAr: 'صورة' },
    { tag: 'video', label: 'Video', nameAr: 'فيديو' },
    { tag: 'figcaption', label: 'Caption', nameAr: 'شرح شكل' },
    { tag: 'audio', label: 'Audio', nameAr: 'صوت' },
    { tag: 'source', label: 'Source', nameAr: 'مصدر' },
    { tag: 'track', label: 'Track', nameAr: 'مسار ترجمة' },
    { tag: 'picture', label: 'Picture', nameAr: 'صورة متجاوبة' },
    { tag: 'iframe', label: 'IFrame', nameAr: 'إطار مضمن' },
    { tag: 'map', label: 'Map', nameAr: 'خريطة صورة' },
    { tag: 'area', label: 'Area', nameAr: 'منطقة' },
    { tag: 'figure', label: 'Figure', nameAr: 'شكل' },
    { tag: 'canvas', label: 'Canvas', nameAr: 'لوحة رسم' }
  ]},
  { category: 'Advanced', items: [
    { tag: 'script', label: 'Script', nameAr: 'سكربت' },
    { tag: 'noscript', label: 'Noscript', nameAr: 'بدون سكربت' },
    { tag: 'template', label: 'Template', nameAr: 'قالب' }
  ]},
  { category: 'Forms', items: [
    { tag: 'form', label: 'Form', nameAr: 'نموذج' },
    { tag: 'input', label: 'Input', nameAr: 'إدخال' },
    { tag: 'button', label: 'Button', nameAr: 'زر' },
    { tag: 'select', label: 'Select', nameAr: 'قائمة' },
    { tag: 'textarea', label: 'Textarea', nameAr: 'منطقة نص' },
    { tag: 'fieldset', label: 'Fieldset', nameAr: 'مجموعة حقول' },
    { tag: 'legend', label: 'Legend', nameAr: 'عنوان مجموعة' },
    { tag: 'datalist', label: 'Datalist', nameAr: 'قائمة اقتراحات' },
    { tag: 'optgroup', label: 'Optgroup', nameAr: 'مجموعة خيارات' },
    { tag: 'option', label: 'Option', nameAr: 'خيار' },
    { tag: 'output', label: 'Output', nameAr: 'ناتج' },
    { tag: 'meter', label: 'Meter', nameAr: 'مقياس' },
    { tag: 'progress', label: 'Progress', nameAr: 'تقدم' }
  ]}
]

export type AttrFieldType = 'text' | 'number' | 'select' | 'boolean' | 'file-image' | 'url'

export interface AttrField {
  name: string
  label: string
  type: AttrFieldType
  placeholder?: string
  options?: string[]
}

// Global attributes shown for every tag
export const GLOBAL_ATTRS: AttrField[] = [
  { name: 'id', label: 'ID', type: 'text', placeholder: 'unique-id' },
  { name: 'title', label: 'Title', type: 'text', placeholder: 'Tooltip text' }
]

// Per-tag attributes (subset of the HTML spec, designer-facing)
export const TAG_ATTRS: Record<string, AttrField[]> = {
  a: [
    { name: 'href', label: 'Href', type: 'url', placeholder: 'https://...' },
    { name: 'target', label: 'Target', type: 'select', options: ['_self', '_blank', '_parent', '_top'] },
    { name: 'rel', label: 'Rel', type: 'text', placeholder: 'noopener' }
  ],
  img: [
    { name: 'src', label: 'Source', type: 'file-image' },
    { name: 'alt', label: 'Alt text', type: 'text', placeholder: 'Describe the image' },
    { name: 'loading', label: 'Loading', type: 'select', options: ['lazy', 'eager'] }
  ],
  video: [
    { name: 'src', label: 'Source', type: 'file-image' },
    { name: 'poster', label: 'Poster URL', type: 'url', placeholder: 'https://...' },
    { name: 'controls', label: 'Controls', type: 'boolean' },
    { name: 'autoplay', label: 'Autoplay', type: 'boolean' },
    { name: 'loop', label: 'Loop', type: 'boolean' },
    { name: 'muted', label: 'Muted', type: 'boolean' }
  ],
  form: [
    { name: 'action', label: 'Action', type: 'url', placeholder: '/submit' },
    { name: 'method', label: 'Method', type: 'select', options: ['get', 'post'] },
    { name: 'target', label: 'Target', type: 'select', options: ['_self', '_blank'] }
  ],
  input: [
    { name: 'type', label: 'Type', type: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'checkbox', 'radio', 'submit', 'hidden', 'date'] },
    { name: 'name', label: 'Name', type: 'text', placeholder: 'field-name' },
    { name: 'placeholder', label: 'Placeholder', type: 'text', placeholder: 'Enter value...' },
    { name: 'value', label: 'Value', type: 'text' },
    { name: 'required', label: 'Required', type: 'boolean' }
  ],
  button: [
    { name: 'type', label: 'Type', type: 'select', options: ['button', 'submit', 'reset'] },
    { name: 'name', label: 'Name', type: 'text', placeholder: 'action-name' }
  ],
  select: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'field-name' },
    { name: 'multiple', label: 'Multiple', type: 'boolean' },
    { name: 'required', label: 'Required', type: 'boolean' }
  ],
  textarea: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'field-name' },
    { name: 'rows', label: 'Rows', type: 'number', placeholder: '4' },
    { name: 'cols', label: 'Cols', type: 'number', placeholder: '40' },
    { name: 'placeholder', label: 'Placeholder', type: 'text', placeholder: 'Enter text...' },
    { name: 'required', label: 'Required', type: 'boolean' }
  ],
  // Batch 1 — lists & semantic text (from DataBase/html-tags)
  ol: [
    { name: 'reversed', label: 'Reversed', type: 'boolean' },
    { name: 'start', label: 'Start', type: 'number', placeholder: '1' },
    { name: 'type', label: 'Marker', type: 'select', options: ['1', 'A', 'a', 'I', 'i'] }
  ],
  li: [
    { name: 'value', label: 'Value', type: 'number', placeholder: 'Only for <ol> lists' }
  ],
  blockquote: [
    { name: 'cite', label: 'Source URL', type: 'url', placeholder: 'https://...' }
  ],
  q: [
    { name: 'cite', label: 'Source URL', type: 'url', placeholder: 'https://...' }
  ],
  // Batch 2 — tables (from DataBase/html-tags)
  th: [
    { name: 'abbr', label: 'Abbr', type: 'text', placeholder: 'Short header' },
    { name: 'colspan', label: 'Colspan', type: 'number', placeholder: '1' },
    { name: 'rowspan', label: 'Rowspan', type: 'number', placeholder: '1' },
    { name: 'headers', label: 'Headers', type: 'text', placeholder: 'header_id' },
    { name: 'scope', label: 'Scope', type: 'select', options: ['col', 'colgroup', 'row', 'rowgroup'] }
  ],
  td: [
    { name: 'colspan', label: 'Colspan', type: 'number', placeholder: '1' },
    { name: 'rowspan', label: 'Rowspan', type: 'number', placeholder: '1' },
    { name: 'headers', label: 'Headers', type: 'text', placeholder: 'header_id' }
  ],
  // Batch 3 — advanced forms (from DataBase/html-tags)
  fieldset: [
    { name: 'disabled', label: 'Disabled', type: 'boolean' },
    { name: 'form', label: 'Form ID', type: 'text', placeholder: 'form_id' },
    { name: 'name', label: 'Name', type: 'text', placeholder: 'group-name' }
  ],
  optgroup: [
    { name: 'disabled', label: 'Disabled', type: 'boolean' },
    { name: 'label', label: 'Label', type: 'text', placeholder: 'Group label' }
  ],
  option: [
    { name: 'disabled', label: 'Disabled', type: 'boolean' },
    { name: 'label', label: 'Label', type: 'text', placeholder: 'Short label' },
    { name: 'selected', label: 'Selected', type: 'boolean' },
    { name: 'value', label: 'Value', type: 'text', placeholder: 'Value sent to server' }
  ],
  output: [
    { name: 'for', label: 'For', type: 'text', placeholder: 'element_id' },
    { name: 'form', label: 'Form ID', type: 'text', placeholder: 'form_id' },
    { name: 'name', label: 'Name', type: 'text', placeholder: 'result-name' }
  ],
  meter: [
    { name: 'value', label: 'Value', type: 'number', placeholder: 'Required' },
    { name: 'min', label: 'Min', type: 'number', placeholder: '0' },
    { name: 'max', label: 'Max', type: 'number', placeholder: '100' },
    { name: 'low', label: 'Low', type: 'number' },
    { name: 'high', label: 'High', type: 'number' },
    { name: 'optimum', label: 'Optimum', type: 'number' },
    { name: 'form', label: 'Form ID', type: 'text', placeholder: 'form_id' }
  ],
  progress: [
    { name: 'value', label: 'Value', type: 'number', placeholder: 'Completed amount' },
    { name: 'max', label: 'Max', type: 'number', placeholder: '1' }
  ],
  // Batch 7 — page-level & advanced (from DataBase/html-tags)
  canvas: [
    { name: 'width', label: 'Width', type: 'number', placeholder: '300' },
    { name: 'height', label: 'Height', type: 'number', placeholder: '150' }
  ],
  script: [
    { name: 'src', label: 'Source URL', type: 'url', placeholder: 'https://.../app.js' },
    { name: 'async', label: 'Async', type: 'boolean' },
    { name: 'defer', label: 'Defer', type: 'boolean' },
    { name: 'type', label: 'Type', type: 'text', placeholder: 'module' },
    { name: 'crossorigin', label: 'Crossorigin', type: 'select', options: ['anonymous', 'use-credentials'] },
    { name: 'referrerpolicy', label: 'Referrer', type: 'select', options: ['no-referrer', 'origin', 'same-origin', 'strict-origin-when-cross-origin', 'unsafe-url'] }
  ],
  // Batch 6 — precise text & edits (from DataBase/html-tags)
  del: [
    { name: 'cite', label: 'Source URL', type: 'url', placeholder: 'https://...' },
    { name: 'datetime', label: 'Datetime', type: 'text', placeholder: '2026-10-05T20:00' }
  ],
  ins: [
    { name: 'cite', label: 'Source URL', type: 'url', placeholder: 'https://...' },
    { name: 'datetime', label: 'Datetime', type: 'text', placeholder: '2026-10-05T20:00' }
  ],
  // Batch 5 — interactive & precise semantics (from DataBase/html-tags)
  details: [
    { name: 'open', label: 'Open', type: 'boolean' },
    { name: 'name', label: 'Group', type: 'text', placeholder: 'groupname' }
  ],
  dialog: [
    { name: 'open', label: 'Open', type: 'boolean' }
  ],
  time: [
    { name: 'datetime', label: 'Datetime', type: 'text', placeholder: '2026-10-05 or 20:00' }
  ],
  data: [
    { name: 'value', label: 'Value', type: 'text', placeholder: 'Machine-readable value' }
  ],
  // Batch 4 — media & embeds (from DataBase/html-tags)
  audio: [
    { name: 'src', label: 'Source URL', type: 'url', placeholder: 'https://.../audio.mp3' },
    { name: 'controls', label: 'Controls', type: 'boolean' },
    { name: 'autoplay', label: 'Autoplay', type: 'boolean' },
    { name: 'loop', label: 'Loop', type: 'boolean' },
    { name: 'muted', label: 'Muted', type: 'boolean' },
    { name: 'preload', label: 'Preload', type: 'select', options: ['auto', 'metadata', 'none'] }
  ],
  source: [
    { name: 'src', label: 'Source URL', type: 'url', placeholder: 'https://...' },
    { name: 'srcset', label: 'Srcset', type: 'text', placeholder: 'img-480w.jpg 480w' },
    { name: 'type', label: 'MIME Type', type: 'text', placeholder: 'audio/mpeg' },
    { name: 'media', label: 'Media Query', type: 'text', placeholder: '(min-width: 800px)' },
    { name: 'sizes', label: 'Sizes', type: 'text', placeholder: '100vw' }
  ],
  track: [
    { name: 'src', label: 'Source URL', type: 'url', placeholder: 'https://.../subs.vtt' },
    { name: 'kind', label: 'Kind', type: 'select', options: ['captions', 'chapters', 'descriptions', 'metadata', 'subtitles'] },
    { name: 'label', label: 'Label', type: 'text', placeholder: 'English' },
    { name: 'srclang', label: 'Lang', type: 'text', placeholder: 'en' },
    { name: 'default', label: 'Default', type: 'boolean' }
  ],
  iframe: [
    { name: 'src', label: 'Source URL', type: 'url', placeholder: 'https://...' },
    { name: 'srcdoc', label: 'Srcdoc HTML', type: 'text', placeholder: '<p>...</p>' },
    { name: 'name', label: 'Name', type: 'text', placeholder: 'frame-name' },
    { name: 'width', label: 'Width', type: 'number', placeholder: '300' },
    { name: 'height', label: 'Height', type: 'number', placeholder: '150' },
    { name: 'loading', label: 'Loading', type: 'select', options: ['eager', 'lazy'] },
    { name: 'allowfullscreen', label: 'Fullscreen', type: 'select', options: ['true', 'false'] },
    { name: 'allowpaymentrequest', label: 'Payment', type: 'select', options: ['true', 'false'] },
    { name: 'allow', label: 'Allow', type: 'text', placeholder: 'camera; microphone' },
    { name: 'sandbox', label: 'Sandbox', type: 'text', placeholder: 'allow-scripts' },
    { name: 'referrerpolicy', label: 'Referrer', type: 'select', options: ['no-referrer', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin', 'same-origin', 'strict-origin-when-cross-origin', 'unsafe-url'] }
  ],
  map: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Required mapname' }
  ],
  area: [
    { name: 'href', label: 'Href', type: 'url', placeholder: 'https://...' },
    { name: 'alt', label: 'Alt text', type: 'text', placeholder: 'Describe the area' },
    { name: 'shape', label: 'Shape', type: 'select', options: ['default', 'rect', 'circle', 'poly'] },
    { name: 'coords', label: 'Coords', type: 'text', placeholder: '0,0,100,100' },
    { name: 'target', label: 'Target', type: 'select', options: ['_blank', '_parent', '_self', '_top'] },
    { name: 'rel', label: 'Rel', type: 'select', options: ['alternate', 'author', 'bookmark', 'help', 'license', 'next', 'nofollow', 'noreferrer', 'prefetch', 'prev', 'search', 'tag'] },
    { name: 'hreflang', label: 'Href Lang', type: 'text', placeholder: 'en' },
    { name: 'media', label: 'Media', type: 'text', placeholder: 'Media/device query' },
    { name: 'type', label: 'Media Type', type: 'text', placeholder: 'text/html' },
    { name: 'download', label: 'Download', type: 'text', placeholder: 'filename' }
  ]
}

export const ATTRS_KEY = 'web-builder-attrs'
export const TAG_KEY = 'web-builder-tag'
export const DECORATIVE_KEY = 'web-builder-decorative'
export const PAGE_LINK_KEY = 'web-builder-page-link'
export const PLUGIN_ID = 'open-pencil'

// Max inline image size (data URL) stored in pluginData
export const MAX_INLINE_IMAGE_BYTES = 1_500_000
