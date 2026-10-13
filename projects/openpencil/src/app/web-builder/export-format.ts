import { AVAILABLE_TAGS } from './tag-attrs'

const AR_TAG_LABELS: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const group of AVAILABLE_TAGS) {
    for (const item of group.items) {
      map[item.tag] = item.nameAr
    }
  }
  return map
})()

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
])

export function tagLabelAr(tag: string): string {
  return AR_TAG_LABELS[tag] ?? tag
}

export function escapeText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

export function escapeAttrValue(value: string): string {
  return escapeText(String(value)).replaceAll('"', '&quot;')
}

export function isVoidTag(tag: string): boolean {
  return VOID_TAGS.has(tag.toLowerCase())
}

/**
 * Comment only where the designer made a decision: a non-default tag and not
 * decorative. Plain `div` and decorative elements stay comment-free.
 */
export function shouldComment(tag: string, decorative: boolean): boolean {
  if (decorative) return false
  return tag !== 'div'
}

/** Bilingual (English + Arabic) comment line, prefixed with indentation. */
export function elementComment(
  name: string,
  tag: string,
  decorative: boolean,
  indent: string
): string {
  if (!shouldComment(tag, decorative)) return ''
  const labelAr = tagLabelAr(tag)
  return `${indent}<!-- EN: ${name} <${tag}> | AR: ${name} (${labelAr}) -->\n`
}
