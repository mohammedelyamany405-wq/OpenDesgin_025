import { describe, expect, test } from 'bun:test'

import {
  createClassNamer,
  createRuleClassRegistry,
  cssClassSlug
} from '@/app/web-builder/class-names'

describe('web-builder class names', () => {
  test('slugs readable latin names', () => {
    expect(cssClassSlug('Hero Card')).toBe('hero-card')
    expect(cssClassSlug('  Primary   Button ')).toBe('primary-button')
  })

  test('normalizes separators and drops invalid symbols', () => {
    expect(cssClassSlug('Card / Hero!')).toBe('card-hero')
    expect(cssClassSlug('nav_bar__item')).toBe('nav-bar-item')
  })

  test('keeps non-latin letters', () => {
    expect(cssClassSlug('بطاقة المنتج')).toBe('بطاقة-المنتج')
  })

  test('prefixes leading digits', () => {
    expect(cssClassSlug('3 Cards')).toBe('el-3-cards')
  })

  test('returns empty for unusable names', () => {
    expect(cssClassSlug('')).toBe('')
    expect(cssClassSlug('!!!')).toBe('')
  })

  test('keeps generated names unique', () => {
    const name = createClassNamer()
    expect(name('Card')).toBe('card')
    expect(name('Card')).toBe('card-2')
    expect(name('card')).toBe('card-3')
  })

  test('never reuses reserved names', () => {
    const name = createClassNamer(['container', 'card'])
    expect(name('Container')).toBe('container-2')
    expect(name('Card')).toBe('card-2')
  })

  test('falls back to the provided id-based name', () => {
    const name = createClassNamer()
    expect(name('', 'el-12:34')).toBe('el-12-34')
    expect(name('', '')).toBe('el')
  })

  test('reuses one class per identical rule set', () => {
    const registry = createRuleClassRegistry(['container'])
    expect(registry.assign('rules-a', 'Card')).toEqual({ className: 'card', created: true })
    expect(registry.assign('rules-a', 'Other Card')).toEqual({
      className: 'card',
      created: false
    })
    expect(registry.assign('rules-b', 'Card')).toEqual({ className: 'card-2', created: true })
    expect(registry.assign('rules-c', 'Container').className).toBe('container-2')
  })
})
