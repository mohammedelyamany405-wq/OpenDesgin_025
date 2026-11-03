import { describe, expect, test } from 'bun:test'

import {
  escapeTextValue,
  renderExport,
  type ExportNode
} from '@/app/web-builder/html-render'

describe('web-builder html-render', () => {
  test('exports TEXT node content inside the classified tag', () => {
    const tree: ExportNode[] = [
      {
        id: 'n1',
        name: 'Hero-h1',
        tag: 'h1',
        text: 'Hello world'
      }
    ]

    const { body } = renderExport(tree)
    expect(body).toContain('<h1>Hello world</h1>')
    expect(body).not.toContain('<h1></h1>')
  })

  test('escapes HTML special characters in text', () => {
    expect(escapeTextValue('A < B & C > D')).toBe('A &lt; B &amp; C &gt; D')

    const { body } = renderExport([
      { id: 'n2', name: 'Quote-p', tag: 'p', text: 'Use <strong> & "quotes"' }
    ])
    expect(body).toContain('<p>Use &lt;strong&gt; &amp; "quotes"</p>')
  })

  test('keeps empty non-text nodes as empty tags', () => {
    const { body } = renderExport([{ id: 'n3', name: 'Box', tag: 'div' }])
    expect(body).toContain('<div></div>')
  })

  test('does not emit text for decorative nodes that have no text', () => {
    const { body } = renderExport([
      { id: 'n4', name: 'Ornament', tag: 'img', decorative: true }
    ])
    expect(body).toContain('<div aria-hidden="true"></div>')
  })
})
