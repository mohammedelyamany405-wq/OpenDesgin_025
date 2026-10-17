/** Built-in CSS class catalog offered in the Classes tab. */
export interface CatalogClass {
  name: string
  css: string
}

export interface CatalogCategory {
  category: string
  items: CatalogClass[]
}

export const classCatalog: readonly CatalogCategory[] = [
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

/** Returns the declaration string for a catalog class, or '' when unknown. */
export function catalogClassCSS(name: string): string {
  for (const category of classCatalog) {
    const found = category.items.find((item) => item.name === name)
    if (found) return found.css
  }
  return ''
}

/** Returns every catalog class name, used to reserve generated names. */
export function catalogClassNames(): string[] {
  return classCatalog.flatMap((category) => category.items.map((item) => item.name))
}
