/**
 * Turns a layer name into a readable, valid CSS class name.
 *
 * Latin names are slugged (`Hero Card` → `hero-card`); Arabic and other
 * non-Latin letters are kept because CSS identifiers allow them. Leading
 * digits are prefixed with `el-` so the identifier always starts with a letter.
 */
export function cssClassSlug(name: string): string {
  const slug = String(name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/gu, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (!slug) return ''
  return /^[\p{L}_]/u.test(slug) ? slug : `el-${slug}`
}

/**
 * Creates a namer that keeps every generated class unique within one export.
 * Reserved names (catalog and saved style classes) are never reused.
 */
export function createClassNamer(
  reserved: Iterable<string> = []
): (name: string, fallback?: string) => string {
  const used = new Set(reserved)
  return (name: string, fallback: string = ''): string => {
    const base = cssClassSlug(name) || cssClassSlug(fallback) || 'el'
    let candidate = base
    let suffix = 2
    while (used.has(candidate)) {
      candidate = `${base}-${suffix}`
      suffix += 1
    }
    used.add(candidate)
    return candidate
  }
}

export interface RuleClassAssignment {
  className: string
  created: boolean
}

export interface RuleClassRegistry {
  /** Reuses the class of an identical rule key; creates one otherwise. */
  assign(key: string, name: string, fallback?: string): RuleClassAssignment
}

/**
 * Assigns one class name per distinct rule set so duplicated declarations are
 * emitted once and shared by every element that has the same rules.
 */
export function createRuleClassRegistry(reserved: Iterable<string> = []): RuleClassRegistry {
  const namer = createClassNamer(reserved)
  const assigned = new Map<string, string>()
  return {
    assign(key: string, name: string, fallback: string = ''): RuleClassAssignment {
      const existing = assigned.get(key)
      if (existing) return { className: existing, created: false }
      const className = namer(name, fallback)
      assigned.set(key, className)
      return { className, created: true }
    }
  }
}
