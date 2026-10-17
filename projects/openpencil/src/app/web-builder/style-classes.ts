import { cssClassSlug } from './class-names'

/** Reusable visual style saved by the designer, stored per page. */
export interface StyleClass {
  name: string
  declarations: string[]
}

export const STYLE_CLASSES_KEY = 'web-builder-style-classes'

interface PluginDataEntry {
  pluginId?: string
  key?: string
  value?: string
}

interface PageLike {
  pluginData?: readonly PluginDataEntry[] | null
}

function normalizeDeclarations(declarations: readonly string[]): string[] {
  return declarations.map((rule) => rule.trim().replace(/;\s*$/, '')).filter(Boolean)
}

function isStyleClass(value: unknown): value is StyleClass {
  if (!value || typeof value !== 'object') return false
  const candidate = value as { name?: unknown; declarations?: unknown }
  return (
    typeof candidate.name === 'string' &&
    candidate.name.trim().length > 0 &&
    Array.isArray(candidate.declarations) &&
    candidate.declarations.every((rule) => typeof rule === 'string')
  )
}

/**
 * Reads the page's saved style classes, ignoring malformed entries. Names are
 * normalized to valid class identifiers and duplicates keep their first entry.
 */
export function readStyleClasses(page: PageLike | null | undefined): StyleClass[] {
  const entry = page?.pluginData?.find(
    (item) => item.pluginId === 'open-pencil' && item.key === STYLE_CLASSES_KEY
  )
  if (!entry?.value) return []
  try {
    const parsed: unknown = JSON.parse(entry.value)
    if (!Array.isArray(parsed)) return []
    const result: StyleClass[] = []
    const seen = new Set<string>()
    for (const value of parsed) {
      if (!isStyleClass(value)) continue
      const name = cssClassSlug(value.name)
      if (!name || seen.has(name)) continue
      seen.add(name)
      result.push({ name, declarations: normalizeDeclarations(value.declarations) })
    }
    return result
  } catch {
    return []
  }
}

/** Adds a style class or replaces the existing one with the same name. */
export function upsertStyleClass(entries: readonly StyleClass[], entry: StyleClass): StyleClass[] {
  const name = cssClassSlug(entry.name)
  if (!name) return [...entries]
  const next: StyleClass = { name, declarations: normalizeDeclarations(entry.declarations) }
  const index = entries.findIndex((item) => item.name === name)
  if (index === -1) return [...entries, next]
  const result = [...entries]
  result[index] = next
  return result
}

/** Removes a style class by name. */
export function removeStyleClass(entries: readonly StyleClass[], name: string): StyleClass[] {
  return entries.filter((entry) => entry.name !== name)
}

/** Builds a className → declaration string map for CSS emission. */
export function styleClassCSS(entries: readonly StyleClass[]): Map<string, string> {
  const result = new Map<string, string>()
  for (const entry of entries) {
    if (entry.declarations.length === 0) continue
    result.set(entry.name, entry.declarations.join('; '))
  }
  return result
}
