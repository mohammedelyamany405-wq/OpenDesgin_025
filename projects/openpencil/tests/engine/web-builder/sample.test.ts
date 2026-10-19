import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@open-pencil/scene-graph'
import type { SceneNode } from '@open-pencil/scene-graph'

import { buildSampleProject } from '@/app/demo/sample/document'
import {
  BREAKPOINTS_KEY,
  CLASSES_KEY,
  LAYOUT_KEY,
  PAGE_KEY,
  STYLE_CLASSES_KEY
} from '@/app/demo/sample/web'
import { readResponsive } from '@/app/web-builder/responsive'
import { readStyleClasses } from '@/app/web-builder/style-classes'
import { DECORATIVE_KEY, PAGE_LINK_KEY, TAG_KEY } from '@/app/web-builder/tag-attrs'

function entryValue(node: SceneNode, key: string): string | undefined {
  return node.pluginData.find((entry) => entry.pluginId === 'open-pencil' && entry.key === key)
    ?.value
}

function tagOf(node: SceneNode): string | undefined {
  const decorative = node.pluginData.some(
    (entry) => entry.pluginId === 'open-pencil' && entry.key === DECORATIVE_KEY
  )
  if (decorative) return 'div'
  return entryValue(node, TAG_KEY)
}

function nodeById(graph: SceneGraph, id: string): SceneNode {
  const node = graph.getNode(id)
  if (!node) throw new Error(`missing node ${id}`)
  return node
}

function pageNodes(graph: SceneGraph, pageId: string): SceneNode[] {
  const result: SceneNode[] = []
  function walk(id: string) {
    const node = graph.getNode(id)
    if (!node) return
    result.push(node)
    for (const childId of node.childIds) walk(childId)
  }
  for (const childId of nodeById(graph, pageId).childIds) walk(childId)
  return result
}

function classesOf(node: SceneNode): string[] {
  return JSON.parse(entryValue(node, CLASSES_KEY) ?? '[]') as string[]
}

describe('Web Builder sample project', () => {
  const graph = new SceneGraph()
  const ids = buildSampleProject(graph)
  const pages = graph.getPages()
  const nodes = pages.flatMap((page) => pageNodes(graph, page.id))

  test('builds a home page and an about page with metadata', () => {
    expect(pages).toHaveLength(2)
    const home = nodeById(graph, ids.homeId)
    const about = nodeById(graph, ids.aboutId)

    expect(home.name).toBe('Home')
    expect(about.name).toBe('About')
    expect(JSON.parse(entryValue(home, PAGE_KEY) ?? '{}').isHome).toBe(true)
    expect(JSON.parse(entryValue(about, PAGE_KEY) ?? '{}')).toEqual({
      title: 'About — Northwind Studio',
      lang: 'en',
      description: 'The story behind Northwind Studio.',
      slug: 'about',
      isHome: false
    })
  })

  test('stores page breakpoints and reusable classes on both pages', () => {
    for (const page of pages) {
      expect(entryValue(page, BREAKPOINTS_KEY)).toBe(JSON.stringify({ tablet: 768, mobile: 480 }))
      const classes = readStyleClasses(page)
      expect(classes.map((item) => item.name)).toEqual(['card', 'auto-height', 'btn-primary'])
      expect(classes[0]?.declarations).toContain('padding: 24px')
    }
  })

  test('keeps the semantic skeleton valid on every page', () => {
    for (const page of pages) {
      const tags = pageNodes(graph, page.id).map(tagOf)
      expect(tags).toContain('header')
      expect(tags).toContain('main')
      expect(tags).toContain('footer')
      expect(tags.filter((tag) => tag === 'h1')).toHaveLength(1)
    }
  })

  test('applies the saved classes to the cards and buttons', () => {
    const cards = nodes.filter((node) => tagOf(node) === 'article')
    const buttons = nodes.filter((node) => tagOf(node) === 'button')

    expect(cards).toHaveLength(3)
    expect(buttons).toHaveLength(2)
    for (const card of cards) expect(classesOf(card)).toContain('card')
    for (const button of buttons) expect(classesOf(button)).toContain('btn-primary')
  })

  test('links the about page and the home page by page id', () => {
    const links = nodes.filter((node) => entryValue(node, PAGE_LINK_KEY) !== undefined)
    const targets = links.map((node) => entryValue(node, PAGE_LINK_KEY))
    expect(targets).toContain(ids.homeId)
    expect(targets).toContain(ids.aboutId)
  })

  test('declares explicit mobile overrides instead of guessing', () => {
    const row = nodes.find((node) => node.name === 'Features Row')
    if (!row) throw new Error('features row missing')
    const layout = JSON.parse(entryValue(row, LAYOUT_KEY) ?? '{}')
    const responsive = readResponsive(layout)
    expect(responsive.mobile).toEqual({ width: 'full', direction: 'column', height: 'auto' })
    expect(responsive.tablet).toEqual({ width: 'full', direction: 'column', height: 'auto' })
  })

  test('releases fixed heights and adds section spacing on smaller screens', () => {
    const shells = [
      'Home Main',
      'Hero Section',
      'Features Section',
      'CTA Section',
      'About Main',
      'Intro Section',
      'Story Section'
    ]
    for (const name of shells) {
      const node = nodes.find((item) => item.name === name)
      if (!node) throw new Error(`${name} missing`)
      const responsive = readResponsive(JSON.parse(entryValue(node, LAYOUT_KEY) ?? '{}'))
      expect(responsive.tablet).toMatchObject({ width: 'full', height: 'auto' })
      expect(responsive.mobile).toMatchObject({ width: 'full', height: 'auto' })
    }

    const features = nodes.find((item) => item.name === 'Features Section')
    if (!features) throw new Error('features section missing')
    const responsive = readResponsive(JSON.parse(entryValue(features, LAYOUT_KEY) ?? '{}'))
    expect(responsive.mobile?.padding).toBe('72px 0')
  })

  test('keeps style class data on pages only', () => {
    const contentNodes = nodes.filter((node) => node.type !== 'CANVAS')
    expect(contentNodes.every((node) => entryValue(node, STYLE_CLASSES_KEY) === undefined)).toBe(
      true
    )
  })
})
