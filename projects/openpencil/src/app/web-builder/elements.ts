// Auto-ported from WebExtention FigmaPlugin/src/common/elements.json (Single Source of Truth).
// Compact classification catalog for the OpenPencil "Web Builder" HTML-tags feature.
// Stored on each SceneNode via pluginData { pluginId: WEB_BUILDER_PLUGIN_ID, key: WEB_BUILDER_KEY }.

export const WEB_BUILDER_PLUGIN_ID = 'open-pencil'
export const WEB_BUILDER_KEY = 'web-builder'

export interface WebBuilderElement {
  id: string
  name: string
  nameAr: string
  tag: string
  category: string
}

export const WEB_BUILDER_ELEMENTS: WebBuilderElement[] = [
  {
    "id": "01_button",
    "name": "Button",
    "nameAr": "زر",
    "tag": "button",
    "category": "Clickable"
  },
  {
    "id": "02_link",
    "name": "Link",
    "nameAr": "رابط",
    "tag": "a",
    "category": "Clickable"
  },
  {
    "id": "03_nav_item",
    "name": "Nav Item",
    "nameAr": "عنصر تنقل",
    "tag": "li>a",
    "category": "Clickable"
  },
  {
    "id": "04_card",
    "name": "Card",
    "nameAr": "بطاقة",
    "tag": "div",
    "category": "Clickable"
  },
  {
    "id": "05_image",
    "name": "Image",
    "nameAr": "صورة",
    "tag": "img",
    "category": "Clickable"
  },
  {
    "id": "06_list_item",
    "name": "List Item",
    "nameAr": "عنصر قائمة",
    "tag": "li",
    "category": "Clickable"
  },
  {
    "id": "07_container",
    "name": "Container",
    "nameAr": "حاوية",
    "tag": "div",
    "category": "Containers"
  },
  {
    "id": "08_section",
    "name": "Section",
    "nameAr": "قسم",
    "tag": "section",
    "category": "Containers"
  },
  {
    "id": "09_row",
    "name": "Row",
    "nameAr": "صف",
    "tag": "div",
    "category": "Containers"
  },
  {
    "id": "10_column",
    "name": "Column",
    "nameAr": "عمود",
    "tag": "div",
    "category": "Containers"
  },
  {
    "id": "26_table",
    "name": "Table",
    "nameAr": "جدول",
    "tag": "table",
    "category": "Containers"
  },
  {
    "id": "27_footer",
    "name": "Footer",
    "nameAr": "تذييل",
    "tag": "footer",
    "category": "Containers"
  },
  {
    "id": "28_header",
    "name": "Header",
    "nameAr": "رأس",
    "tag": "header",
    "category": "Containers"
  },
  {
    "id": "29_aside",
    "name": "Aside/Sidebar",
    "nameAr": "شريط جانبي",
    "tag": "aside",
    "category": "Containers"
  },
  {
    "id": "30_main",
    "name": "Main Content",
    "nameAr": "المحتوى الرئيسي",
    "tag": "main",
    "category": "Containers"
  },
  {
    "id": "31_article",
    "name": "Article",
    "nameAr": "مقال",
    "tag": "article",
    "category": "Containers"
  },
  {
    "id": "32_nav",
    "name": "Navigation Bar",
    "nameAr": "شريط التنقل",
    "tag": "nav",
    "category": "Containers"
  },
  {
    "id": "11_heading",
    "name": "Heading",
    "nameAr": "عنوان",
    "tag": "h2",
    "category": "Text"
  },
  {
    "id": "12_paragraph",
    "name": "Paragraph",
    "nameAr": "فقرة",
    "tag": "p",
    "category": "Text"
  },
  {
    "id": "13_span",
    "name": "Span/Inline",
    "nameAr": "نص مضمّن",
    "tag": "span",
    "category": "Text"
  },
  {
    "id": "14_video",
    "name": "Video",
    "nameAr": "فيديو",
    "tag": "video",
    "category": "Media"
  },
  {
    "id": "15_figure",
    "name": "Figure",
    "nameAr": "شكل توضيحي",
    "tag": "figure",
    "category": "Media"
  },
  {
    "id": "25_avatar",
    "name": "Avatar",
    "nameAr": "أفاتار",
    "tag": "img",
    "category": "Media"
  },
  {
    "id": "16_form",
    "name": "Form",
    "nameAr": "نموذج",
    "tag": "form",
    "category": "Forms"
  },
  {
    "id": "17_input",
    "name": "Input",
    "nameAr": "حقل إدخال",
    "tag": "input",
    "category": "Forms"
  },
  {
    "id": "18_textarea",
    "name": "Textarea",
    "nameAr": "منطقة نص",
    "tag": "textarea",
    "category": "Forms"
  },
  {
    "id": "19_select",
    "name": "Select",
    "nameAr": "قائمة منسدلة",
    "tag": "select",
    "category": "Forms"
  },
  {
    "id": "20_label",
    "name": "Label",
    "nameAr": "تسمية",
    "tag": "label",
    "category": "Forms"
  },
  {
    "id": "21_modal",
    "name": "Modal/Dialog",
    "nameAr": "نافذة منبثقة",
    "tag": "div",
    "category": "Dialogs"
  },
  {
    "id": "22_dropdown",
    "name": "Dropdown",
    "nameAr": "قائمة منسدلة",
    "tag": "div",
    "category": "Dialogs"
  },
  {
    "id": "23_tooltip",
    "name": "Tooltip",
    "nameAr": "تلميح",
    "tag": "span",
    "category": "Dialogs"
  },
  {
    "id": "24_badge",
    "name": "Badge",
    "nameAr": "شارة",
    "tag": "span",
    "category": "Dialogs"
  }
]
