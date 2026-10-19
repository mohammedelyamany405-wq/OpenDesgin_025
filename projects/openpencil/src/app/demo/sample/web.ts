import type { PluginDataEntry, SceneGraph, SceneNode } from '@open-pencil/scene-graph'

import {
  ATTRS_KEY,
  DECORATIVE_KEY,
  PAGE_LINK_KEY,
  PLUGIN_ID,
  TAG_KEY
} from '@/app/web-builder/tag-attrs'
import type { ResponsiveMap } from '@/app/web-builder/responsive'

export const LAYOUT_KEY = 'web-builder-layout'
export const CLASSES_KEY = 'web-builder-classes'
export const BREAKPOINTS_KEY = 'web-builder-breakpoints'
export const PAGE_KEY = 'web-builder-page'
export const STYLE_CLASSES_KEY = 'web-builder-style-classes'

export type Box = readonly [x: number, y: number, width: number, height: number]

export interface FlexLayout {
  type: 'none' | 'flex' | 'grid'
  direction?: 'row' | 'column'
  justifyContent?: string
  alignItems?: string
  gap?: string
  flexWrap?: boolean
  gridTemplateColumns?: string
  gridTemplateRows?: string
  responsive?: ResponsiveMap
}

export interface WebOptions {
  tag?: string
  layout?: FlexLayout
  attrs?: Record<string, string | number | boolean>
  decorative?: boolean
  classes?: readonly string[]
  pageLink?: string
}

export interface SampleContext {
  graph: SceneGraph
  homeId: string
  aboutId: string
}

export interface PageMeta {
  name: string
  title: string
  lang: string
  description: string
  slug: string
  isHome: boolean
}

export interface StyleClassInput {
  name: string
  declarations: readonly string[]
}

function pluginDataFor(web: WebOptions | undefined): PluginDataEntry[] {
  if (!web) return []
  const entries: PluginDataEntry[] = []
  if (web.tag) entries.push({ pluginId: PLUGIN_ID, key: TAG_KEY, value: web.tag })
  if (web.decorative) entries.push({ pluginId: PLUGIN_ID, key: DECORATIVE_KEY, value: 'true' })
  if (web.attrs && Object.keys(web.attrs).length > 0)
    entries.push({ pluginId: PLUGIN_ID, key: ATTRS_KEY, value: JSON.stringify(web.attrs) })
  if (web.layout)
    entries.push({ pluginId: PLUGIN_ID, key: LAYOUT_KEY, value: JSON.stringify(web.layout) })
  if (web.classes && web.classes.length > 0)
    entries.push({ pluginId: PLUGIN_ID, key: CLASSES_KEY, value: JSON.stringify(web.classes) })
  if (web.pageLink)
    entries.push({ pluginId: PLUGIN_ID, key: PAGE_LINK_KEY, value: web.pageLink })
  return entries
}

/** Creates a frame-like node with Web Builder metadata attached in one step. */
export function frame(
  ctx: SampleContext,
  parentId: string,
  name: string,
  box: Box,
  overrides: Partial<SceneNode> = {},
  web?: WebOptions
): string {
  const [x, y, width, height] = box
  const node = ctx.graph.createNode('FRAME', parentId, {
    ...overrides,
    name,
    x,
    y,
    width,
    height,
    pluginData: pluginDataFor(web)
  })
  return node.id
}

/** Creates a text node with Web Builder metadata attached in one step. */
export function text(
  ctx: SampleContext,
  parentId: string,
  name: string,
  box: Box,
  content: string,
  overrides: Partial<SceneNode> = {},
  web?: WebOptions
): string {
  const [x, y, width, height] = box
  const node = ctx.graph.createNode('TEXT', parentId, {
    ...overrides,
    name,
    x,
    y,
    width,
    height,
    text: content,
    pluginData: pluginDataFor(web)
  })
  return node.id
}

function replaceEntry(
  entries: readonly PluginDataEntry[],
  key: string,
  value: string
): PluginDataEntry[] {
  return [
    ...entries.filter((entry) => !(entry.pluginId === PLUGIN_ID && entry.key === key)),
    { pluginId: PLUGIN_ID, key, value }
  ]
}

export function setPageMeta(graph: SceneGraph, pageId: string, meta: PageMeta): void {
  const page = graph.getNode(pageId)
  if (!page) return
  const { name, ...data } = meta
  graph.updateNode(pageId, {
    name,
    pluginData: replaceEntry(page.pluginData, PAGE_KEY, JSON.stringify(data))
  })
}

export function setBreakpoints(
  graph: SceneGraph,
  pageId: string,
  tablet: number,
  mobile: number
): void {
  const page = graph.getNode(pageId)
  if (!page) return
  graph.updateNode(pageId, {
    pluginData: replaceEntry(page.pluginData, BREAKPOINTS_KEY, JSON.stringify({ tablet, mobile }))
  })
}

export function setStyleClasses(
  graph: SceneGraph,
  pageId: string,
  classes: readonly StyleClassInput[]
): void {
  const page = graph.getNode(pageId)
  if (!page) return
  const payload = classes.map((item) => ({
    name: item.name,
    declarations: [...item.declarations]
  }))
  graph.updateNode(pageId, {
    pluginData: replaceEntry(page.pluginData, STYLE_CLASSES_KEY, JSON.stringify(payload))
  })
}
