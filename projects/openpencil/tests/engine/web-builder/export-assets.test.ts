import { describe, expect, test } from 'bun:test'

import { encodeBase64 } from '@open-pencil/core/bytes'
import { SceneGraph } from '@open-pencil/scene-graph'

import {
  ExportAssetStore,
  externalImageResolver,
  fontAssetPath,
  fontFaceCSS,
  fontFormat,
  imageAssetPath,
  imageExtension,
  inlineImageResolver,
  pageNodeIds,
  parseImageDataURL,
  rewriteImageAttrs,
  type ResolvedFont
} from '@/app/web-builder/export-assets'

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x01])
const JPEG = new Uint8Array([0xff, 0xd8, 0x01])
const TTF = new Uint8Array([0x00, 0x01, 0x00, 0x00, 0x01])
const OTTO = new Uint8Array([0x4f, 0x54, 0x54, 0x4f, 0x01])
const WOFF = new Uint8Array([0x77, 0x4f, 0x46, 0x46, 0x01])
const WOFF2 = new Uint8Array([0x77, 0x4f, 0x46, 0x32, 0x01])

function font(overrides: Partial<ResolvedFont> = {}): ResolvedFont {
  return {
    family: 'Inter',
    style: 'SemiBold',
    weight: 600,
    italic: false,
    format: 'truetype',
    extension: 'ttf',
    bytes: TTF,
    ...overrides
  }
}

describe('export asset paths', () => {
  test('maps known image mimes and falls back to png', () => {
    expect(imageExtension('image/png')).toBe('png')
    expect(imageExtension('image/jpeg')).toBe('jpg')
    expect(imageExtension('image/webp')).toBe('webp')
    expect(imageExtension('image/unknown')).toBe('png')
  })

  test('builds hashed image paths from the detected bytes', () => {
    expect(imageAssetPath('abc123', PNG)).toBe('assets/images/abc123.png')
    expect(imageAssetPath('abc123', JPEG)).toBe('assets/images/abc123.jpg')
  })

  test('detects font formats from their signature tags', () => {
    expect(fontFormat(TTF)).toEqual({ format: 'truetype', extension: 'ttf' })
    expect(fontFormat(OTTO)).toEqual({ format: 'opentype', extension: 'otf' })
    expect(fontFormat(WOFF)).toEqual({ format: 'woff', extension: 'woff' })
    expect(fontFormat(WOFF2)).toEqual({ format: 'woff2', extension: 'woff2' })
    expect(fontFormat(new Uint8Array([1, 2, 3, 4]))).toEqual({
      format: 'truetype',
      extension: 'ttf'
    })
  })

  test('slugifies the family and style of font asset paths', () => {
    expect(fontAssetPath(font())).toBe('assets/fonts/inter-semibold.ttf')
    expect(fontAssetPath(font({ family: 'Noto Naskh Arabic', style: 'Regular' }))).toBe(
      'assets/fonts/noto-naskh-arabic-regular.ttf'
    )
  })
})

describe('parseImageDataURL', () => {
  test('parses base64 image data URLs', () => {
    const parsed = parseImageDataURL(`data:image/png;base64,${encodeBase64(PNG)}`)
    expect(parsed?.mime).toBe('image/png')
    expect(parsed?.bytes).toEqual(PNG)
  })

  test('rejects non-image and malformed values', () => {
    expect(parseImageDataURL('https://example.com/a.png')).toBeNull()
    expect(parseImageDataURL('data:text/plain;base64,aGVsbG8=')).toBeNull()
    expect(parseImageDataURL('data:image/png;base64,%%%')).toBeNull()
  })
})

describe('ExportAssetStore', () => {
  test('reuses an identical asset and keeps files sorted', () => {
    const store = new ExportAssetStore()
    expect(store.add('assets/images/b.png', PNG)).toBe('assets/images/b.png')
    expect(store.add('assets/images/b.png', PNG)).toBe('assets/images/b.png')
    expect(store.add('assets/images/a.png', JPEG)).toBe('assets/images/a.png')
    expect(store.files().map((file) => file.path)).toEqual([
      'assets/images/a.png',
      'assets/images/b.png'
    ])
  })

  test('suffixes colliding paths that hold different bytes', () => {
    const store = new ExportAssetStore()
    expect(store.add('assets/fonts/Inter.ttf', TTF)).toBe('assets/fonts/Inter.ttf')
    expect(store.add('assets/fonts/Inter.ttf', OTTO)).toBe('assets/fonts/Inter-2.ttf')
    expect(store.add('assets/fonts/Inter.ttf', WOFF)).toBe('assets/fonts/Inter-3.ttf')
    expect(store.files()).toHaveLength(3)
  })
})

describe('image resolvers', () => {
  test('inlines images as data URLs', () => {
    const graph = new SceneGraph()
    graph.images.set('hash-1', PNG)
    expect(inlineImageResolver(graph)('hash-1')).toBe(`data:image/png;base64,${encodeBase64(PNG)}`)
    expect(inlineImageResolver(graph)('missing')).toBeUndefined()
  })

  test('writes external images once and returns project paths', () => {
    const graph = new SceneGraph()
    graph.images.set('hash-1', PNG)
    const store = new ExportAssetStore()
    const resolve = externalImageResolver(graph, store)
    expect(resolve('hash-1')).toBe('assets/images/hash-1.png')
    expect(resolve('hash-1')).toBe('assets/images/hash-1.png')
    expect(store.files()).toHaveLength(1)
  })

  test('rewrites inline data URL attributes only in external mode', () => {
    const dataURL = `data:image/png;base64,${encodeBase64(PNG)}`
    const attrs = { src: dataURL, alt: 'logo' }
    const inlineStore = new ExportAssetStore()
    expect(rewriteImageAttrs(attrs, 'inline', inlineStore)).toBe(attrs)

    const store = new ExportAssetStore()
    const rewritten = rewriteImageAttrs(attrs, 'external', store)
    expect(rewritten?.src).toMatch(/^assets\/images\/data-[0-9a-f]{8}\.png$/)
    expect(rewritten?.alt).toBe('logo')
    expect(store.files()).toHaveLength(1)
    expect(rewriteImageAttrs(undefined, 'external', store)).toBeUndefined()
  })
})

describe('fontFaceCSS', () => {
  test('embeds font bytes inline as base64', () => {
    const css = fontFaceCSS([font()], 'inline')
    expect(css).toContain("font-family: 'Inter'")
    expect(css).toContain('font-weight: 600')
    expect(css).toContain(`url("data:font/ttf;base64,${encodeBase64(TTF)}") format("truetype")`)
  })

  test('points at project font assets in external mode and registers them', () => {
    const store = new ExportAssetStore()
    const css = fontFaceCSS([font({ italic: true, style: 'Italic' })], 'external', store)
    expect(css).toContain('font-style: italic')
    expect(css).toContain('url("assets/fonts/inter-italic.ttf")')
    expect(store.files().map((file) => file.path)).toEqual(['assets/fonts/inter-italic.ttf'])
  })
})

describe('pageNodeIds', () => {
  test('collects the direct children of every requested page', () => {
    const graph = new SceneGraph()
    const home = graph.addPage('Home')
    const about = graph.addPage('About')
    const header = graph.createNode('RECTANGLE', home.id, { name: 'Header' })
    graph.createNode('TEXT', header.id, { name: 'Title' })
    const footer = graph.createNode('RECTANGLE', home.id, { name: 'Footer' })
    graph.createNode('RECTANGLE', about.id, { name: 'Hero' })

    expect(pageNodeIds(graph, [home.id])).toEqual([header.id, footer.id])
    expect(pageNodeIds(graph, [home.id, about.id])).toHaveLength(3)
    expect(pageNodeIds(graph, [])).toEqual([])
  })
})
