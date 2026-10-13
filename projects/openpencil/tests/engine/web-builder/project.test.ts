import { describe, expect, test } from 'bun:test'

import {
  buildProjectContext,
  resolvePageHref,
  slugify,
  type PageInput
} from '@/app/web-builder/project'

describe('slugify', () => {
  test('lowercases and dashes separators', () => {
    expect(slugify('Home Page')).toBe('home-page')
    expect(slugify('  About   Us  ')).toBe('about-us')
  })

  test('strips diacritics', () => {
    expect(slugify('Café Menu')).toBe('cafe-menu')
  })

  test('keeps unicode letters (Arabic names survive)', () => {
    expect(slugify('من نحن')).toBe('من-نحن')
  })

  test('never returns empty', () => {
    expect(slugify('   ')).toBe('page')
    expect(slugify('!!!')).toBe('page')
  })
})

describe('buildProjectContext', () => {
  const pages: PageInput[] = [
    { id: 'p1', name: 'Home' },
    { id: 'p2', name: 'About' },
    { id: 'p3', name: 'About' }
  ]

  test('first page is home by default and becomes index.html', () => {
    const ctx = buildProjectContext(pages)
    expect(ctx.homeId).toBe('p1')
    expect(ctx.fileNameById.get('p1')).toBe('index.html')
  })

  test('deduplicates colliding slugs', () => {
    const ctx = buildProjectContext(pages)
    expect(ctx.fileNameById.get('p2')).toBe('about.html')
    expect(ctx.fileNameById.get('p3')).toBe('about-2.html')
  })

  test('explicit isHome wins over first page', () => {
    const ctx = buildProjectContext([
      { id: 'p1', name: 'Home' },
      { id: 'p2', name: 'Landing', isHome: true }
    ])
    expect(ctx.homeId).toBe('p2')
    expect(ctx.fileNameById.get('p2')).toBe('index.html')
    expect(ctx.fileNameById.get('p1')).toBe('home.html')
  })

  test('reserves index so a non-home page cannot collide with home', () => {
    const ctx = buildProjectContext([
      { id: 'p1', name: 'Home' },
      { id: 'p2', name: 'index' }
    ])
    expect(ctx.fileNameById.get('p1')).toBe('index.html')
    expect(ctx.fileNameById.get('p2')).toBe('index-2.html')
  })

  test('uses explicit slug when provided', () => {
    const ctx = buildProjectContext([
      { id: 'p1', name: 'Home' },
      { id: 'p2', name: 'About Us', slug: 'about' }
    ])
    expect(ctx.fileNameById.get('p2')).toBe('about.html')
  })
})

describe('resolvePageHref', () => {
  const ctx = buildProjectContext([
    { id: 'home', name: 'Home' },
    { id: 'about', name: 'About' }
  ])

  test('resolves to the target file name', () => {
    expect(resolvePageHref('home', ctx)).toBe('index.html')
    expect(resolvePageHref('about', ctx)).toBe('about.html')
  })

  test('returns empty for unknown pages', () => {
    expect(resolvePageHref('missing', ctx)).toBe('')
  })
})
