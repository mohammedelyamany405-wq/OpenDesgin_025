import { describe, expect, test } from 'bun:test'

import type { Effect, Fill, Stroke } from '@open-pencil/scene-graph'

import {
  visualOnlyDeclarations,
  visualStyleDeclarations,
  type NodeStyleSource
} from '@/app/web-builder/export-style'

function solid(r: number, g: number, b: number, a = 1, opacity = 1): Fill {
  return { type: 'SOLID', color: { r, g, b, a }, opacity, visible: true }
}

function gradient(overrides: Partial<Fill> = {}): Fill {
  return {
    type: 'GRADIENT_LINEAR',
    color: { r: 1, g: 1, b: 1, a: 1 },
    opacity: 1,
    visible: true,
    gradientStops: [
      { color: { r: 1, g: 0, b: 0, a: 1 }, position: 0 },
      { color: { r: 0, g: 0, b: 1, a: 1 }, position: 1 }
    ],
    gradientTransform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 0, m12: 0.5 },
    ...overrides
  }
}

function imageFill(overrides: Partial<Fill> = {}): Fill {
  return {
    type: 'IMAGE',
    color: { r: 0, g: 0, b: 0, a: 1 },
    opacity: 1,
    visible: true,
    imageHash: 'hash-1',
    ...overrides
  }
}

function stroke(overrides: Partial<Stroke> = {}): Stroke {
  return {
    color: { r: 0, g: 0, b: 0, a: 1 },
    weight: 1,
    opacity: 1,
    visible: true,
    align: 'CENTER',
    ...overrides
  }
}

function effect(type: Effect['type'], overrides: Partial<Effect> = {}): Effect {
  return {
    type,
    color: { r: 0, g: 0, b: 0, a: 1 },
    offset: { x: 0, y: 0 },
    radius: 0,
    spread: 0,
    visible: true,
    ...overrides
  }
}

function style(node: NodeStyleSource): string {
  return visualStyleDeclarations(node).join('; ')
}

describe('web-builder export style', () => {
  test('declared box size is exported with border-box sizing', () => {
    expect(style({ width: 277.4958190917969, height: 77 })).toBe(
      'width: 277.496px; height: 77px; box-sizing: border-box'
    )
  })

  test('clipped content becomes overflow hidden', () => {
    expect(style({ width: 100, height: 50, clipsContent: true })).toContain('overflow: hidden')
  })

  test('auto-sized text exports no fixed box', () => {
    expect(
      style({ type: 'TEXT', textAutoResize: 'WIDTH_AND_HEIGHT', width: 120, height: 30 })
    ).toBe('')
    expect(
      style({ type: 'TEXT', textAutoResize: 'HEIGHT', width: 320, height: 90 })
    ).toBe('width: 320px; box-sizing: border-box')
    expect(style({ type: 'TEXT', textAutoResize: 'NONE', width: 320, height: 90 })).toBe(
      'width: 320px; height: 90px; box-sizing: border-box'
    )
  })

  test('solid fill becomes background-color on non-text nodes', () => {
    expect(style({ fills: [solid(1, 0, 0)] })).toContain('background-color: rgb(255, 0, 0)')
  })

  test('solid fill becomes color on text nodes', () => {
    const result = style({ type: 'TEXT', fills: [solid(0, 0, 1)] })
    expect(result).toContain('color: rgb(0, 0, 255)')
    expect(result).not.toContain('background-color')
  })

  test('fill opacity multiplies the color alpha', () => {
    expect(style({ fills: [solid(1, 0, 0, 0.5, 0.5)] })).toContain('rgba(255, 0, 0, 0.25)')
  })

  test('empty gradient and invisible fills are skipped', () => {
    expect(style({ fills: [gradient({ gradientStops: [] })] })).toBe('')
    expect(style({ fills: [gradient({ gradientTransform: undefined })] })).toBe('')
    expect(style({ fills: [{ ...solid(1, 0, 0), visible: false }] })).toBe('')
  })

  test('linear gradient maps to an angle from the renderer transform', () => {
    // default transform travels leftwards -> 270deg ("to left").
    const result = style({ width: 100, height: 50, fills: [gradient()] })
    expect(result).toBe(
      'width: 100px; height: 50px; box-sizing: border-box; background-image: linear-gradient(270deg, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)'
    )
  })

  test('vertical linear gradient uses 180deg', () => {
    const fill = gradient({
      gradientTransform: { m00: 0, m01: 0, m02: 0, m10: -1, m11: 0, m12: 1 }
    })
    expect(style({ width: 100, height: 100, fills: [fill] })).toContain(
      'linear-gradient(180deg, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)'
    )
  })

  test('gradient stop alpha is multiplied by the fill opacity', () => {
    const fill = gradient({ opacity: 0.5 })
    expect(style({ width: 100, height: 50, fills: [fill] })).toContain('rgba(255, 0, 0, 0.5) 0%')
  })

  test('radial gradient maps center and radius from the local matrix', () => {
    const fill = gradient({
      type: 'GRADIENT_RADIAL',
      gradientTransform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 }
    })
    expect(style({ width: 100, height: 100, fills: [fill] })).toContain(
      'radial-gradient(ellipse 50px 50px at 50px 50px, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)'
    )
  })

  test('angular gradient becomes a conic gradient', () => {
    const fill = gradient({
      type: 'GRADIENT_ANGULAR',
      gradientTransform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 }
    })
    expect(style({ width: 100, height: 100, fills: [fill] })).toContain(
      'conic-gradient(from 90deg at 50px 50px, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)'
    )
  })

  test('text keeps color-only fills and skips gradients', () => {
    expect(style({ type: 'TEXT', fills: [gradient()] })).toBe('')
  })

  test('image fill becomes a background image with its scale mode', () => {
    const resolve = () => 'data:image/png;base64,AAAA'
    const fill = imageFill({ imageScaleMode: 'FILL' })
    const result = visualStyleDeclarations(
      { width: 200, height: 100, fills: [fill] },
      resolve
    ).join('; ')
    expect(result).toContain('background-image: url("data:image/png;base64,AAAA")')
    expect(result).toContain('background-size: cover')
    expect(result).toContain('background-repeat: no-repeat')

    const fit = imageFill({ imageScaleMode: 'FIT' })
    expect(visualStyleDeclarations({ fills: [fit] }, resolve).join('; ')).toContain(
      'background-size: contain'
    )

    const tile = imageFill({ imageScaleMode: 'TILE' })
    expect(visualStyleDeclarations({ fills: [tile] }, resolve).join('; ')).toContain(
      'background-repeat: repeat'
    )
  })

  test('image fill without a resolver or known image is skipped', () => {
    expect(style({ fills: [imageFill()] })).toBe('')
    expect(visualStyleDeclarations({ fills: [imageFill()] }, () => undefined).join('; ')).toBe('')
  })

  test('stroke becomes a border, dashed when a dash pattern is set', () => {
    expect(style({ strokes: [stroke({ weight: 2 })] })).toContain('border: 2px solid rgb(0, 0, 0)')
    expect(style({ strokes: [stroke({ dashPattern: [4, 2] })] })).toContain(
      'border: 1px dashed rgb(0, 0, 0)'
    )
  })

  test('corner radius handles uniform and independent corners', () => {
    expect(style({ cornerRadius: 8 })).toBe('border-radius: 8px')
    expect(style({ cornerRadius: 0 })).toBe('')
    expect(style({ independentCorners: true, topLeftRadius: 4, bottomRightRadius: 6 })).toBe(
      'border-radius: 4px 0px 6px 0px'
    )
  })

  test('drop and inner shadows combine into one box-shadow', () => {
    const result = style({
      effects: [
        effect('DROP_SHADOW', { offset: { x: 0, y: 2 }, radius: 4, spread: 0 }),
        effect('INNER_SHADOW', { offset: { x: 0, y: 1 }, radius: 2, spread: 1 })
      ]
    })
    expect(result).toBe(
      'box-shadow: 0px 2px 4px 0px rgb(0, 0, 0), inset 0px 1px 2px 1px rgb(0, 0, 0)'
    )
  })

  test('layer and background blur emit filters', () => {
    expect(style({ effects: [effect('LAYER_BLUR', { radius: 5 })] })).toBe('filter: blur(5px)')
    expect(style({ effects: [effect('BACKGROUND_BLUR', { radius: 3 })] })).toBe(
      'backdrop-filter: blur(3px)'
    )
  })

  test('node opacity below 1 is emitted', () => {
    expect(style({ opacity: 0.5 })).toBe('opacity: 0.5')
    expect(style({ opacity: 1 })).toBe('')
  })

  test('text typography emits the declared font properties', () => {
    const result = visualStyleDeclarations({
      type: 'TEXT',
      fontFamily: 'Helvetica Neue',
      fontSize: 24,
      fontWeight: 700,
      italic: true,
      lineHeight: 32,
      letterSpacing: 1.5,
      textAlignHorizontal: 'CENTER',
      textCase: 'UPPER',
      textDecoration: 'UNDERLINE'
    })
    expect(result).toContain('font-family: \'Helvetica Neue\', system-ui, sans-serif')
    expect(result).toContain('font-size: 24px')
    expect(result).toContain('font-weight: 700')
    expect(result).toContain('font-style: italic')
    expect(result).toContain('line-height: 32px')
    expect(result).toContain('letter-spacing: 1.5px')
    expect(result).toContain('text-align: center')
    expect(result).toContain('text-transform: uppercase')
    expect(result).toContain('text-decoration: underline')
  })

  test('typography is not emitted for non-text nodes', () => {
    expect(style({ fontSize: 24, fontFamily: 'Arial' })).toBe('')
  })

  test('visual-only declarations omit the box size', () => {
    const result = visualOnlyDeclarations({
      width: 100,
      height: 50,
      fills: [solid(1, 0, 0)],
      cornerRadius: 8
    }).join('; ')
    expect(result).not.toContain('width:')
    expect(result).not.toContain('height:')
    expect(result).toContain('background-color:')
    expect(result).toContain('border-radius: 8px')
  })
})
