import type { ExportNode } from './html-render'

export interface ValidationIssue {
  type: 'error' | 'warning'
  message: string
  nodeId?: string
  nodeName?: string
}

const ESSENTIAL_TAGS = ['header', 'main', 'footer'] as const
const CONTAINER_TAGS = ['div', 'section', 'main', 'header', 'footer', 'nav', 'article', 'aside']
const DEFAULT_NAMES = /^(rectangle|ellipse|frame|group|text)/i

function flatten(nodes: ExportNode[]): ExportNode[] {
  const result: ExportNode[] = []
  function walk(node: ExportNode) {
    result.push(node)
    node.children?.forEach(walk)
  }
  nodes.forEach(walk)
  return result
}

export function validateExportTree(nodes: ExportNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const all = flatten(nodes)
  const semantic = all.filter((n) => !n.decorative)
  const tags = semantic.map((n) => n.tag || 'div')

  for (const essential of ESSENTIAL_TAGS) {
    if (!tags.includes(essential)) {
      issues.push({ type: 'error', message: `Missing essential tag: <${essential}>` })
    }
  }

  const h1Count = tags.filter((t) => t === 'h1').length
  if (h1Count > 1) {
    issues.push({
      type: 'error',
      message: `Multiple <h1> tags found (${h1Count}) — keep only one per page`
    })
  }

  for (const node of semantic) {
    const tag = node.tag || 'div'
    const hasChildren = (node.children?.length ?? 0) > 0
    const layoutType = node.layout?.type || 'none'

    if (tag === 'div' && !hasChildren) {
      issues.push({
        type: 'warning',
        message: `Element "${node.name}" has no specific tag (defaults to <div>)`,
        nodeId: node.id,
        nodeName: node.name
      })
    }

    if (hasChildren && layoutType === 'none' && CONTAINER_TAGS.includes(tag)) {
      issues.push({
        type: 'warning',
        message: `Container "${node.name}" <${tag}> has children but no Flex/Grid declared`,
        nodeId: node.id,
        nodeName: node.name
      })
    }

    if (tag === 'img' && hasChildren) {
      issues.push({
        type: 'error',
        message: `Element "${node.name}" is <img> but has children — <img> must be a leaf`,
        nodeId: node.id,
        nodeName: node.name
      })
    }

    if ((tag === 'button' || tag === 'a') && DEFAULT_NAMES.test(node.name)) {
      issues.push({
        type: 'warning',
        message: `Element <${tag}> still has default name "${node.name}" — rename it for clarity`,
        nodeId: node.id,
        nodeName: node.name
      })
    }

    if (tag === 'img' && !hasChildren) {
      const src = node.attrs?.src
      const hasSrc = typeof src === 'string' && src.length > 0
      if (!hasSrc && !node.hasImageFill) {
        issues.push({
          type: 'warning',
          message: `Image "${node.name}" has no src — pick a file or URL in Tags tab`,
          nodeId: node.id,
          nodeName: node.name
        })
      }
    }
  }

  return issues
}

export function collectCriticalErrors(nodes: ExportNode[]): string[] {
  return validateExportTree(nodes)
    .filter((i) => i.type === 'error')
    .map((i) => i.message)
}

export function collectWarnings(nodes: ExportNode[]): string[] {
  return validateExportTree(nodes)
    .filter((i) => i.type === 'warning')
    .map((i) => i.message)
}
