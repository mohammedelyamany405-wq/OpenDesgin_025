import { decodeBase64, encodeBase64 } from '@open-pencil/core/bytes'
import { detectImageMime } from '@open-pencil/core/io/formats/svg'
import { collectGraphFontKeys, fontManager } from '@open-pencil/core/text'
import { styleToWeight } from '@open-pencil/scene-graph'
import type { SceneGraph } from '@open-pencil/scene-graph'

import { cssClassSlug } from './class-names'

export type ExportAssetMode = 'inline' | 'external'

export interface ExportAssetFile {
  path: string
  bytes: Uint8Array
}

export interface ResolvedFont {
  family: string
  style: string
  weight: number
  italic: boolean
  format: 'truetype' | 'opentype' | 'woff' | 'woff2'
  extension: 'ttf' | 'otf' | 'woff' | 'woff2'
  bytes: Uint8Array
}

export interface FontLoadResult {
  fonts: ResolvedFont[]
  missing: string[]
}

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif'
}

const FONT_FORMATS: Record<
  string,
  { format: ResolvedFont['format']; extension: ResolvedFont['extension'] }
> = {
  wOF2: { format: 'woff2', extension: 'woff2' },
  wOFF: { format: 'woff', extension: 'woff' },
  OTTO: { format: 'opentype', extension: 'otf' },
  '\u0000\u0001\u0000\u0000': { format: 'truetype', extension: 'ttf' },
  true: { format: 'truetype', extension: 'ttf' }
}

const FONT_MIMES: Record<ResolvedFont['format'], string> = {
  truetype: 'font/ttf',
  opentype: 'font/otf',
  woff: 'font/woff',
  woff2: 'font/woff2'
}

function sameBytes(a: Uint8Array | undefined, b: Uint8Array): boolean {
  if (!a || a.length !== b.length) return false
  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) return false
  }
  return true
}

function fnv1a(bytes: Uint8Array): string {
  let hash = 0x811c9dc5
  for (const byte of bytes) {
    hash ^= byte
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

function safeName(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, '')
  return cleaned || 'asset'
}

export function imageExtension(mime: string): string {
  return IMAGE_EXTENSIONS[mime] ?? 'png'
}

/** Stable project-relative path for a graph image referenced by its content hash. */
export function imageAssetPath(hash: string, bytes: Uint8Array): string {
  const extension = imageExtension(detectImageMime(bytes))
  return `assets/images/${safeName(hash)}.${extension}`
}

export function fontFormat(bytes: Uint8Array): {
  format: ResolvedFont['format']
  extension: ResolvedFont['extension']
} {
  const tag = String.fromCharCode(...bytes.slice(0, 4))
  return FONT_FORMATS[tag] ?? FONT_FORMATS.true
}

export function fontMime(format: ResolvedFont['format']): string {
  return FONT_MIMES[format]
}

export function fontAssetPath(font: ResolvedFont): string {
  const family = cssClassSlug(font.family) || 'font'
  const style = cssClassSlug(font.style) || 'regular'
  return `assets/fonts/${family}-${style}.${font.extension}`
}

interface ParsedDataURL {
  mime: string
  bytes: Uint8Array
}

export function parseImageDataURL(value: string): ParsedDataURL | null {
  const match = /^data:(image\/[\w.+-]+);base64,([\s\S]*)$/.exec(value)
  if (!match) return null
  try {
    return { mime: match[1], bytes: decodeBase64(match[2]) }
  } catch {
    return null
  }
}

/** Collects binary files once and guarantees collision-free project paths. */
export class ExportAssetStore {
  private readonly assets = new Map<string, Uint8Array>()

  add(path: string, bytes: Uint8Array): string {
    let candidate = path
    let suffix = 2
    while (this.assets.has(candidate) && !sameBytes(this.assets.get(candidate), bytes)) {
      const dot = path.lastIndexOf('.')
      candidate = `${path.slice(0, dot)}-${suffix}${path.slice(dot)}`
      suffix++
    }
    if (!this.assets.has(candidate)) this.assets.set(candidate, bytes)
    return candidate
  }

  files(): ExportAssetFile[] {
    return [...this.assets]
      .map(([path, bytes]) => ({ path, bytes }))
      .sort((a, b) => a.path.localeCompare(b.path))
  }
}

export function inlineImageResolver(graph: SceneGraph): (hash: string) => string | undefined {
  return (hash) => {
    const bytes = graph.images.get(hash)
    if (!bytes) return undefined
    return `data:${detectImageMime(bytes)};base64,${encodeBase64(bytes)}`
  }
}

export function externalImageResolver(
  graph: SceneGraph,
  store: ExportAssetStore
): (hash: string) => string | undefined {
  return (hash) => {
    const bytes = graph.images.get(hash)
    if (!bytes) return undefined
    return store.add(imageAssetPath(hash, bytes), bytes)
  }
}

/**
 * Rewrites inline image data URLs in element attributes to project asset paths.
 * Inline mode returns the attrs untouched.
 */
export function rewriteImageAttrs(
  attrs: Record<string, unknown> | undefined,
  mode: ExportAssetMode,
  store: ExportAssetStore
): Record<string, unknown> | undefined {
  if (!attrs || mode === 'inline') return attrs
  let changed = false
  const next: Record<string, unknown> = { ...attrs }
  for (const [key, value] of Object.entries(next)) {
    if (typeof value !== 'string') continue
    const parsed = parseImageDataURL(value)
    if (!parsed) continue
    next[key] = store.add(
      `assets/images/data-${fnv1a(parsed.bytes)}.${imageExtension(parsed.mime)}`,
      parsed.bytes
    )
    changed = true
  }
  return changed ? next : attrs
}

/** Loads every font face used by the given nodes, including web fonts. */
export async function loadExportFonts(
  graph: SceneGraph,
  nodeIds: readonly string[]
): Promise<FontLoadResult> {
  const keys = collectGraphFontKeys(graph, nodeIds)
  const fonts: ResolvedFont[] = []
  const missing: string[] = []

  for (const [family, style] of keys) {
    const data = await fontManager.loadFont(family, style)
    if (!data) {
      missing.push(`${family} ${style}`)
      continue
    }
    const bytes = new Uint8Array(data)
    const { format, extension } = fontFormat(bytes)
    fonts.push({
      family,
      style,
      weight: styleToWeight(style),
      italic: /italic/i.test(style),
      format,
      extension,
      bytes
    })
  }

  fonts.sort((a, b) =>
    `${a.family}:${a.weight}:${a.style}`.localeCompare(`${b.family}:${b.weight}:${b.style}`)
  )
  return { fonts, missing }
}

function cssString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

/** Builds `@font-face` rules, either self-contained or pointing at project assets. */
export function fontFaceCSS(
  fonts: readonly ResolvedFont[],
  mode: ExportAssetMode,
  store?: ExportAssetStore
): string {
  return fonts
    .map((font) => {
      let url: string
      if (mode === 'inline') {
        url = `data:${fontMime(font.format)};base64,${encodeBase64(font.bytes)}`
      } else {
        const path = fontAssetPath(font)
        url = store ? store.add(path, font.bytes) : path
      }
      const style = font.italic ? 'italic' : 'normal'
      return `@font-face { font-family: ${cssString(font.family)}; font-style: ${style}; font-weight: ${font.weight}; font-display: swap; src: url("${url}") format("${font.format}"); }`
    })
    .join('\n')
}

/** All node ids of the given pages, used to collect fonts project-wide. */
export function pageNodeIds(graph: SceneGraph, pageIds: readonly string[]): string[] {
  const ids: string[] = []
  for (const pageId of pageIds) {
    for (const child of graph.getChildren(pageId)) ids.push(child.id)
  }
  return ids
}
