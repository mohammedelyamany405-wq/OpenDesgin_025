import { describe, expect, test } from 'bun:test'

import {
  elementComment,
  escapeAttrValue,
  escapeText,
  isVoidTag,
  shouldComment,
  tagLabelAr
} from '@/app/web-builder/export-format'

describe('web-builder export format', () => {
  test('escapeText escapes HTML-sensitive characters', () => {
    expect(escapeText('a<b>&c')).toBe('a&lt;b&gt;&amp;c')
    expect(escapeText('safe text')).toBe('safe text')
  })

  test('escapeAttrValue escapes quotes and ampersands', () => {
    expect(escapeAttrValue('say "hi" & <b>')).toBe('say &quot;hi&quot; &amp; &lt;b&gt;')
  })

  test('isVoidTag recognises void elements case-insensitively', () => {
    expect(isVoidTag('img')).toBe(true)
    expect(isVoidTag('IMG')).toBe(true)
    expect(isVoidTag('br')).toBe(true)
    expect(isVoidTag('div')).toBe(false)
  })

  test('shouldComment only comments non-default, non-decorative tags', () => {
    expect(shouldComment('div', false)).toBe(false)
    expect(shouldComment('h1', false)).toBe(true)
    expect(shouldComment('h1', true)).toBe(false)
    expect(shouldComment('header', true)).toBe(false)
  })

  test('tagLabelAr maps known tags and falls back to the raw tag', () => {
    expect(tagLabelAr('h1')).toBe('عنوان 1')
    expect(tagLabelAr('not-a-real-tag')).toBe('not-a-real-tag')
  })

  test('elementComment produces a bilingual, indented line', () => {
    expect(elementComment('HeroTitle', 'h1', false, '  ')).toBe(
      '  <!-- EN: HeroTitle <h1> | AR: HeroTitle (عنوان 1) -->\n'
    )
  })

  test('elementComment is empty for default or decorative nodes', () => {
    expect(elementComment('Box', 'div', false, '')).toBe('')
    expect(elementComment('Box', 'div', true, '')).toBe('')
    expect(elementComment('Glow', 'section', true, '')).toBe('')
  })
})
