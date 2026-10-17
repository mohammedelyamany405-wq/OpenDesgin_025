import { describe, expect, test } from 'bun:test'

import {
  readStyleClasses,
  removeStyleClass,
  styleClassCSS,
  upsertStyleClass,
  STYLE_CLASSES_KEY,
  type StyleClass
} from '@/app/web-builder/style-classes'

function pageWith(value: unknown) {
  return {
    pluginData: [{ pluginId: 'open-pencil', key: STYLE_CLASSES_KEY, value: JSON.stringify(value) }]
  }
}

const card: StyleClass = { name: 'card', declarations: ['background: #fff', 'padding: 16px'] }

describe('web-builder style classes', () => {
  test('reads and normalizes saved classes', () => {
    const page = pageWith([
      { name: 'Hero Card', declarations: ['background: red;', 'color: white'] },
      { name: 'badge', declarations: ['border-radius: 8px'] }
    ])
    expect(readStyleClasses(page)).toEqual([
      { name: 'hero-card', declarations: ['background: red', 'color: white'] },
      { name: 'badge', declarations: ['border-radius: 8px'] }
    ])
  })

  test('ignores malformed entries and duplicate names', () => {
    const page = pageWith([
      null,
      {},
      { name: '', declarations: ['color: red'] },
      { name: 'card', declarations: 'nope' },
      { name: 'card', declarations: ['color: red'] },
      { name: 'card', declarations: ['color: blue'] }
    ])
    expect(readStyleClasses(page)).toEqual([{ name: 'card', declarations: ['color: red'] }])
  })

  test('returns an empty list for missing or invalid storage', () => {
    expect(readStyleClasses(null)).toEqual([])
    expect(readStyleClasses({})).toEqual([])
    expect(
      readStyleClasses({
        pluginData: [{ pluginId: 'open-pencil', key: STYLE_CLASSES_KEY, value: '{oops' }]
      })
    ).toEqual([])
  })

  test('upsert appends new classes and replaces existing ones', () => {
    const added = upsertStyleClass([], card)
    expect(added).toEqual([card])

    const replaced = upsertStyleClass(added, {
      name: 'card',
      declarations: ['color: black;']
    })
    expect(replaced).toEqual([{ name: 'card', declarations: ['color: black'] }])
  })

  test('upsert ignores empty names and normalizes declarations', () => {
    expect(upsertStyleClass([], { name: '   ', declarations: ['color: red'] })).toEqual([])
    expect(
      upsertStyleClass([], { name: 'Hero Card', declarations: ['color: red; ', ' '] })
    ).toEqual([{ name: 'hero-card', declarations: ['color: red'] }])
  })

  test('removes a class by name', () => {
    expect(removeStyleClass([card], 'card')).toEqual([])
    expect(removeStyleClass([card], 'other')).toEqual([card])
  })

  test('builds a css map and skips empty classes', () => {
    const map = styleClassCSS([card, { name: 'empty', declarations: [] }])
    expect(map.get('card')).toBe('background: #fff; padding: 16px')
    expect(map.has('empty')).toBe(false)
  })
})
