import { MAX_INLINE_IMAGE_BYTES } from './tag-attrs'

export interface ExportTreeNode {
  name: string
  tag?: string
  decorative?: boolean
  attrs?: Record<string, unknown>
  layout?: { type?: string } | null
  children?: ExportTreeNode[]
}

const CONTAINER_TAGS = ['div', 'section', 'main', 'header', 'footer', 'nav', 'article', 'aside']
const DEFAULT_NAMES = /^(rectangle|ellipse|frame|group|text)/i

/** A decorative node is always rendered as a plain `div`, so it never counts as a real tag. */
function effectiveTag(node: ExportTreeNode): string {
  if (node.decorative) return 'div'
  return node.tag || 'div'
}

/** True when the page has at least one element to export. */
export function hasExportableContent(tree: ExportTreeNode | null | undefined): boolean {
  return !!tree && (tree.children?.length ?? 0) > 0
}

/**
 * Critical errors block export entirely. They mirror what the Validate tab treats as fatal:
 * the page must keep a header, a main, a footer, a single h1, and no `<img>` with children.
 */
export function collectCriticalErrors(tree: ExportTreeNode): string[] {
  const errors: string[] = []
  const allNodes: ExportTreeNode[] = []
  function collect(node: ExportTreeNode) {
    allNodes.push(node)
    node.children?.forEach(collect)
  }
  tree.children?.forEach(collect)

  const tags = allNodes.map(effectiveTag)
  for (const essential of ['header', 'main', 'footer']) {
    if (!tags.includes(essential)) {
      errors.push(`Missing essential tag: <${essential}>`)
    }
  }
  const h1Count = tags.filter((t) => t === 'h1').length
  if (h1Count > 1) {
    errors.push(`Multiple <h1> tags found (${h1Count}) — keep only one per page`)
  }
  for (const n of allNodes) {
    if (effectiveTag(n) === 'img' && n.children?.length) {
      errors.push(`Element "${n.name}" is <img> but has children`)
    }
  }
  return errors
}

/**
 * Non-blocking warnings. The designer may proceed anyway, but each one marks a decision
 * that was left implicit (unclassified tag, missing layout, empty image, oversized inline media).
 */
export function collectWarnings(tree: ExportTreeNode): string[] {
  const warnings: string[] = []
  function check(node: ExportTreeNode) {
    if (!node.decorative) {
      const tag = node.tag || 'div'
      const hasChildren = (node.children?.length ?? 0) > 0
      if (tag === 'div' && !hasChildren) {
        warnings.push(`Element "${node.name}" has no specific tag`)
      }
      if (
        hasChildren &&
        (!node.layout || node.layout.type === 'none') &&
        CONTAINER_TAGS.includes(tag)
      ) {
        warnings.push(`Container "${node.name}" has children but no Flex/Grid declared`)
      }
      if ((tag === 'button' || tag === 'a') && DEFAULT_NAMES.test(node.name)) {
        warnings.push(`Element <${tag}> still has default name "${node.name}"`)
      }
      if (tag === 'img' && !node.attrs?.src) {
        warnings.push(`Image "${node.name}" has no src — pick a file or URL in Tags tab`)
      }
      if (tag === 'img' && typeof node.attrs?.src === 'string') {
        const src = node.attrs.src
        if (src.startsWith('data:') && src.length > MAX_INLINE_IMAGE_BYTES) {
          warnings.push(
            `Image "${node.name}" is inline and larger than ${Math.round(MAX_INLINE_IMAGE_BYTES / 1024)} KB — use a URL instead`
          )
        }
      }
    }
    node.children?.forEach(check)
  }
  tree.children?.forEach(check)
  return warnings
}
