// Web Builder — pure HTML/CSS export renderer.
// Keeps the panel component free of string-building logic and makes the
// "design tree -> HTML" mapping unit-testable.

export interface ExportClassCategory {
  category: string
  items: { name: string; css: string }[]
}

export const CLASS_CATEGORIES: ExportClassCategory[] = [
  {
    category: 'Layout',
    items: [
      { name: 'container', css: 'max-width: 1200px; margin: 0 auto; padding: 0 20px' },
      { name: 'flex-center', css: 'display: flex; justify-content: center; align-items: center' },
      { name: 'grid-2', css: 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px' },
      { name: 'grid-3', css: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px' }
    ]
  },
  {
    category: 'Text',
    items: [
      { name: 'heading-1', css: 'font-size: 32px; font-weight: bold; line-height: 1.2' },
      { name: 'heading-2', css: 'font-size: 24px; font-weight: bold; line-height: 1.3' },
      { name: 'body-text', css: 'font-size: 16px; line-height: 1.6' },
      { name: 'small-text', css: 'font-size: 14px; color: #666' }
    ]
  },
  {
    category: 'Spacing',
    items: [
      { name: 'p-1', css: 'padding: 8px' },
      { name: 'p-2', css: 'padding: 16px' },
      { name: 'p-3', css: 'padding: 24px' },
      { name: 'm-1', css: 'margin: 8px' },
      { name: 'm-2', css: 'margin: 16px' }
    ]
  },
  {
    category: 'Colors',
    items: [
      { name: 'bg-primary', css: 'background-color: #3b82f6' },
      { name: 'bg-secondary', css: 'background-color: #6b7280' },
      { name: 'text-white', css: 'color: #ffffff' },
      { name: 'text-dark', css: 'color: #1f2937' }
    ]
  },
  {
    category: 'Effects',
    items: [
      { name: 'shadow-sm', css: 'box-shadow: 0 1px 2px rgba(0,0,0,0.05)' },
      { name: 'shadow-md', css: 'box-shadow: 0 4px 6px rgba(0,0,0,0.1)' },
      { name: 'rounded', css: 'border-radius: 8px' },
      { name: 'rounded-full', css: 'border-radius: 9999px' }
    ]
  }
]

export interface ExportLayout {
  type?: 'none' | 'flex' | 'grid'
  direction?: string
  justifyContent?: string
  alignItems?: string
  gap?: string
  flexWrap?: boolean
  gridTemplateColumns?: string
  gridTemplateRows?: string
  tabletDirection?: string
  mobileDirection?: string
}

export interface ExportNode {
  id: string
  name: string
  tag: string
  classes?: string[]
  layout?: ExportLayout | null
  decorative?: boolean
  attrs?: Record<string, unknown>
  text?: string
  children?: ExportNode[]
}

export interface ExportBreakpoints {
  tablet: number
  mobile: number
}

export interface RenderedExport {
  body: string
  css: string
}

export function escapeAttrValue(value: string): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function escapeTextValue(value: string): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function attrsToString(attrs: Record<string, unknown>): string {
  const parts: string[] = []
  for (const [name, value] of Object.entries(attrs)) {
    if (value === '' || value === null || value === undefined || value === false) continue
    if (value === true) {
      parts.push(name)
    } else {
      parts.push(`${name}="${escapeAttrValue(String(value))}"`)
    }
  }
  return parts.length > 0 ? ' ' + parts.join(' ') : ''
}

export function cssForClass(className: string): string {
  for (const cat of CLASS_CATEGORIES) {
    const found = cat.items.find((i) => i.name === className)
    if (found) return found.css
  }
  return ''
}

export function sanitizeId(id: string): string {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '-')
}

export function cssForLayout(layout: ExportLayout | null | undefined): string[] {
  if (!layout || (layout.type !== 'flex' && layout.type !== 'grid')) return []
  const rules: string[] = []
  if (layout.type === 'flex') {
    rules.push('display: flex;')
    rules.push(`flex-direction: ${layout.direction || 'row'};`)
    if (layout.justifyContent && layout.justifyContent !== 'flex-start')
      rules.push(`justify-content: ${layout.justifyContent};`)
    if (layout.alignItems && layout.alignItems !== 'stretch')
      rules.push(`align-items: ${layout.alignItems};`)
    if (layout.gap && layout.gap !== '0px') rules.push(`gap: ${layout.gap};`)
    if (layout.flexWrap) rules.push('flex-wrap: wrap;')
  } else {
    rules.push('display: grid;')
    if (layout.gridTemplateColumns)
      rules.push(`grid-template-columns: ${layout.gridTemplateColumns};`)
    if (layout.gridTemplateRows) rules.push(`grid-template-rows: ${layout.gridTemplateRows};`)
    if (layout.gap && layout.gap !== '0px') rules.push(`gap: ${layout.gap};`)
  }
  return rules
}

export function renderExport(
  children: ExportNode[],
  breakpoints?: ExportBreakpoints
): RenderedExport {
  const usedClasses = new Map<string, string>()
  const layoutRules: string[] = []
  const tabletRules: string[] = []
  const mobileRules: string[] = []
  const bp = breakpoints || { tablet: 768, mobile: 375 }

  function nodeToHtml(node: ExportNode, indent: number): string {
    const spaces = '  '.repeat(indent)
    const decorative = !!node.decorative
    const tag = decorative ? 'div' : node.tag || 'div'
    const aria = decorative ? ' aria-hidden="true"' : ''
    const extraAttrs = decorative ? '' : attrsToString(node.attrs || {})

    const cls: string[] = [...(node.classes || [])]
    for (const c of node.classes || []) {
      if (!usedClasses.has(c)) {
        const css = cssForClass(c)
        if (css) usedClasses.set(c, css)
      }
    }

    const rules = cssForLayout(node.layout)
    if (rules.length > 0) {
      const wbClass = `wb-${sanitizeId(node.id)}`
      cls.push(wbClass)
      layoutRules.push(`.${wbClass} { ${rules.join(' ')} }`)
      const layout = node.layout
      if (layout?.tabletDirection && layout.tabletDirection !== 'inherit') {
        tabletRules.push(`.${wbClass} { flex-direction: ${layout.tabletDirection}; }`)
      }
      if (layout?.mobileDirection && layout.mobileDirection !== 'inherit') {
        mobileRules.push(`.${wbClass} { flex-direction: ${layout.mobileDirection}; }`)
      }
    }

    const classAttr = cls.length > 0 ? ` class="${cls.join(' ')}"` : ''
    const textContent = escapeTextValue(node.text || '')

    if (node.children?.length) {
      const childrenHtml = node.children.map((c) => nodeToHtml(c, indent + 1)).join('\n')
      const textLine = textContent ? `${spaces}  ${textContent}\n` : ''
      return `${spaces}<${tag}${classAttr}${aria}${extraAttrs}>\n${textLine}${childrenHtml}\n${spaces}</${tag}>`
    }
    if (textContent) {
      return `${spaces}<${tag}${classAttr}${aria}${extraAttrs}>${textContent}</${tag}>`
    }
    return `${spaces}<${tag}${classAttr}${aria}${extraAttrs}></${tag}>`
  }

  let body = ''
  for (const child of children) {
    body += nodeToHtml(child, 1) + '\n'
  }

  let css = ''
  usedClasses.forEach((def, name) => {
    css += `.${name} { ${def} }\n`
  })
  if (layoutRules.length > 0) css += layoutRules.join('\n') + '\n'
  if (tabletRules.length > 0) {
    css += `@media (max-width: ${bp.tablet}px) {\n  ${tabletRules.join('\n  ')}\n}\n`
  }
  if (mobileRules.length > 0) {
    css += `@media (max-width: ${bp.mobile}px) {\n  ${mobileRules.join('\n  ')}\n}\n`
  }

  return { body, css }
}
