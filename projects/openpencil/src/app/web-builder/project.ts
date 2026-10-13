export interface PageInput {
  id: string
  name: string
  slug?: string
  isHome?: boolean
}

export interface ProjectContext {
  homeId: string
  fileNameById: Map<string, string>
  hasPage: (id: string) => boolean
}

/**
 * URL/filename-safe slug. Keeps Unicode letters and digits (so Arabic names survive),
 * turns runs of other characters into a single dash, and never returns empty.
 */
export function slugify(name: string): string {
  const withoutDiacritics = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  const slug = withoutDiacritics
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'page'
}

/**
 * Assigns a unique slug to every page and resolves its output filename.
 * The home page is always `index.html`; `index` is therefore reserved so a
 * non-home page can never collide with it.
 */
export function buildProjectContext(pages: PageInput[]): ProjectContext {
  const home = pages.find((p) => p.isHome) ?? pages[0]
  const used = new Set<string>()
  if (home) used.add('index')

  const fileNameById = new Map<string, string>()
  for (const page of pages) {
    const base = slugify(page.slug && page.slug.trim() ? page.slug : page.name)
    let slug = base
    let suffix = 2
    while (used.has(slug)) {
      slug = `${base}-${suffix}`
      suffix++
    }
    used.add(slug)
    fileNameById.set(page.id, page.id === home?.id ? 'index.html' : `${slug}.html`)
  }

  return { homeId: home?.id ?? '', fileNameById, hasPage: (id) => fileNameById.has(id) }
}

/** Relative path from one page file to a linked page file (both live in the project root). */
export function resolvePageHref(targetPageId: string, context: ProjectContext): string {
  return context.fileNameById.get(targetPageId) ?? ''
}
