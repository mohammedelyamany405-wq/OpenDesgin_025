import { describe, expect, test } from 'bun:test'

import { MAX_INLINE_IMAGE_BYTES } from '@/app/web-builder/tag-attrs'
import {
  collectCriticalErrors,
  collectWarnings,
  hasExportableContent,
  type ExportTreeNode
} from '@/app/web-builder/export-rules'

function page(children: ExportTreeNode[]): ExportTreeNode {
  return { name: 'Page', children }
}

const goodPage = page([
  { name: 'Header', tag: 'header' },
  { name: 'Main', tag: 'main', children: [{ name: 'Title', tag: 'h1' }] },
  { name: 'Footer', tag: 'footer' }
])

describe('hasExportableContent', () => {
  test('is false for missing or empty trees', () => {
    expect(hasExportableContent(null)).toBe(false)
    expect(hasExportableContent(undefined)).toBe(false)
    expect(hasExportableContent(page([]))).toBe(false)
  })

  test('is true when at least one element exists', () => {
    expect(hasExportableContent(page([{ name: 'Box', tag: 'div' }]))).toBe(true)
  })
})

describe('collectCriticalErrors', () => {
  test('accepts a well-formed page', () => {
    expect(collectCriticalErrors(goodPage)).toEqual([])
  })

  test('requires header, main and footer', () => {
    const errors = collectCriticalErrors(page([{ name: 'Main', tag: 'main' }]))
    expect(errors).toContain('Missing essential tag: <header>')
    expect(errors).toContain('Missing essential tag: <footer>')
  })

  test('rejects more than one h1', () => {
    const errors = collectCriticalErrors(
      page([
        { name: 'Header', tag: 'header' },
        { name: 'Main', tag: 'main', children: [{ name: 'A', tag: 'h1' }, { name: 'B', tag: 'h1' }] },
        { name: 'Footer', tag: 'footer' }
      ])
    )
    expect(errors.some((e) => e.startsWith('Multiple <h1>'))).toBe(true)
  })

  test('rejects an img element that has children', () => {
    const errors = collectCriticalErrors(
      page([
        { name: 'Header', tag: 'header' },
        { name: 'Main', tag: 'main', children: [{ name: 'Pic', tag: 'img', children: [{ name: 'x' }] }] },
        { name: 'Footer', tag: 'footer' }
      ])
    )
    expect(errors.some((e) => e.includes('is <img> but has children'))).toBe(true)
  })

  test('does not count a decorative element as a real tag', () => {
    const errors = collectCriticalErrors(
      page([
        { name: 'FakeHeader', tag: 'header', decorative: true },
        { name: 'Main', tag: 'main' },
        { name: 'Footer', tag: 'footer' }
      ])
    )
    expect(errors).toContain('Missing essential tag: <header>')
  })
})

describe('collectWarnings', () => {
  test('flags an unclassified leaf div', () => {
    const warnings = collectWarnings(page([{ name: 'Box', tag: 'div' }]))
    expect(warnings.some((w) => w.includes('has no specific tag'))).toBe(true)
  })

  test('flags a container with children but no layout', () => {
    const warnings = collectWarnings(
      page([{ name: 'Wrap', tag: 'section', children: [{ name: 'Text', tag: 'p' }] }])
    )
    expect(warnings.some((w) => w.includes('no Flex/Grid'))).toBe(true)
  })

  test('does not warn when a real layout is declared', () => {
    const warnings = collectWarnings(
      page([
        {
          name: 'Wrap',
          tag: 'section',
          layout: { type: 'flex' },
          children: [{ name: 'Text', tag: 'p' }]
        }
      ])
    )
    expect(warnings.some((w) => w.includes('no Flex/Grid'))).toBe(false)
  })

  test('flags a button that still has a default name', () => {
    const warnings = collectWarnings(page([{ name: 'Rectangle 1', tag: 'button' }]))
    expect(warnings.some((w) => w.includes('still has default name'))).toBe(true)
  })

  test('flags an image without a src', () => {
    const warnings = collectWarnings(page([{ name: 'Hero', tag: 'img' }]))
    expect(warnings.some((w) => w.includes('has no src'))).toBe(true)
  })

  test('flags an oversized inline image', () => {
    const src = `data:image/png;base64,${'A'.repeat(MAX_INLINE_IMAGE_BYTES + 16)}`
    const warnings = collectWarnings(page([{ name: 'Hero', tag: 'img', attrs: { src } }]))
    expect(warnings.some((w) => w.includes('is inline and larger than'))).toBe(true)
  })

  test('does not flag a small inline image', () => {
    const src = `data:image/png;base64,${'A'.repeat(1024)}`
    const warnings = collectWarnings(page([{ name: 'Hero', tag: 'img', attrs: { src } }]))
    expect(warnings.some((w) => w.includes('is inline and larger than'))).toBe(false)
  })

  test('ignores decorative elements for tag-related warnings', () => {
    const warnings = collectWarnings(page([{ name: 'Glow', tag: 'div', decorative: true }]))
    expect(warnings).toEqual([])
  })
})
