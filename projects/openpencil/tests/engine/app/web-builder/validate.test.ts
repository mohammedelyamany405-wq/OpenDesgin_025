import { describe, expect, test } from 'bun:test'

import type { ExportNode } from '@/app/web-builder/html-render'
import { validateExportTree } from '@/app/web-builder/validate'

function node(partial: Partial<ExportNode> & { id: string; name: string }): ExportNode {
  return {
    tag: 'div',
    ...partial
  }
}

describe('web-builder validateExportTree', () => {
  test('reports missing essential tags as errors', () => {
    const issues = validateExportTree([node({ id: '1', name: 'Box', tag: 'div' })])
    const errors = issues.filter((i) => i.type === 'error').map((i) => i.message)
    expect(errors).toContain('Missing essential tag: <header>')
    expect(errors).toContain('Missing essential tag: <main>')
    expect(errors).toContain('Missing essential tag: <footer>')
  })

  test('does not count decorative nodes toward essential tags or h1', () => {
    const issues = validateExportTree([
      node({ id: 'h', name: 'Fake-header', tag: 'header', decorative: true }),
      node({ id: 'm', name: 'Fake-main', tag: 'main', decorative: true }),
      node({ id: 'f', name: 'Fake-footer', tag: 'footer', decorative: true }),
      node({ id: 't', name: 'Fake-h1', tag: 'h1', decorative: true })
    ])
    const errors = issues.filter((i) => i.type === 'error').map((i) => i.message)
    expect(errors).toContain('Missing essential tag: <header>')
    expect(errors).toContain('Missing essential tag: <main>')
    expect(errors).toContain('Missing essential tag: <footer>')
    expect(errors.some((m) => m.includes('<h1>'))).toBe(false)
  })

  test('does not flag decorative img with children as a critical error', () => {
    const issues = validateExportTree([
      node({ id: 'header', name: 'Top', tag: 'header' }),
      node({ id: 'main', name: 'Content', tag: 'main' }),
      node({ id: 'footer', name: 'Bottom', tag: 'footer' }),
      node({
        id: 'ornament',
        name: 'Ornament',
        tag: 'img',
        decorative: true,
        children: [node({ id: 'child', name: 'Inner', tag: 'div' })]
      })
    ])
    expect(issues.some((i) => i.type === 'error' && i.message.includes('<img>'))).toBe(false)
  })

  test('flags non-decorative img with children as a critical error', () => {
    const issues = validateExportTree([
      node({ id: 'header', name: 'Top', tag: 'header' }),
      node({ id: 'main', name: 'Content', tag: 'main' }),
      node({ id: 'footer', name: 'Bottom', tag: 'footer' }),
      node({
        id: 'photo',
        name: 'Photo',
        tag: 'img',
        children: [node({ id: 'child', name: 'Inner', tag: 'div' })]
      })
    ])
    const imgError = issues.find((i) => i.type === 'error' && i.message.includes('Photo'))
    expect(imgError?.message).toContain('<img>')
    expect(imgError?.nodeId).toBe('photo')
  })

  test('skips per-node warnings on decorative leaves', () => {
    const issues = validateExportTree([
      node({ id: 'header', name: 'Top', tag: 'header' }),
      node({ id: 'main', name: 'Content', tag: 'main' }),
      node({ id: 'footer', name: 'Bottom', tag: 'footer' }),
      node({ id: 'deco', name: 'Sparkle', tag: 'div', decorative: true })
    ])
    expect(issues.some((i) => i.nodeId === 'deco')).toBe(false)
  })

  test('does not warn about img src when the node has an image fill', () => {
    const issues = validateExportTree([
      node({ id: 'header', name: 'Top', tag: 'header' }),
      node({ id: 'main', name: 'Content', tag: 'main' }),
      node({ id: 'footer', name: 'Bottom', tag: 'footer' }),
      node({ id: 'photo', name: 'Photo', tag: 'img', hasImageFill: true })
    ])
    expect(issues.some((i) => i.nodeId === 'photo')).toBe(false)
  })
})
