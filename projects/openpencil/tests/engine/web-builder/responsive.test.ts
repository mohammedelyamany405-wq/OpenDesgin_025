import { describe, expect, test } from 'bun:test'

import {
  readResponsive,
  responsiveDeclarations,
  type LayoutResponsiveSource,
  type ResponsiveOverrides
} from '@/app/web-builder/responsive'

describe('web-builder responsive', () => {
  test('reads declared per-device overrides', () => {
    const layout: LayoutResponsiveSource = {
      responsive: { tablet: { direction: 'column' }, mobile: { hidden: true, width: 'full' } }
    }
    expect(readResponsive(layout)).toEqual({
      tablet: { direction: 'column' },
      mobile: { hidden: true, width: 'full' }
    })
  })

  test('migrates legacy flat direction fields', () => {
    expect(readResponsive({ tabletDirection: 'column', mobileDirection: 'row' })).toEqual({
      tablet: { direction: 'column' },
      mobile: { direction: 'row' }
    })
  })

  test('legacy "inherit" direction is ignored', () => {
    expect(readResponsive({ tabletDirection: 'inherit' })).toEqual({})
  })

  test('empty layout yields an empty map', () => {
    expect(readResponsive(null)).toEqual({})
    expect(readResponsive({})).toEqual({})
  })

  test('declarations cover each override field', () => {
    const overrides: ResponsiveOverrides = {
      direction: 'column',
      hidden: true,
      width: 'full',
      height: 'auto',
      padding: '72px 0',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      gridTemplateColumns: '1fr'
    }
    expect(responsiveDeclarations(overrides)).toEqual([
      'flex-direction: column',
      'display: none',
      'width: 100%',
      'height: auto',
      'padding: 72px 0',
      'justify-content: center',
      'align-items: center',
      'gap: 12px',
      'grid-template-columns: 1fr'
    ])
  })

  test('width auto and width full map distinctly', () => {
    expect(responsiveDeclarations({ width: 'auto' })).toEqual(['width: auto'])
    expect(responsiveDeclarations({ width: 'full' })).toEqual(['width: 100%'])
  })

  test('height auto releases fixed canvas heights', () => {
    expect(responsiveDeclarations({ height: 'auto' })).toEqual(['height: auto'])
  })

  test('padding overrides spacing at a breakpoint', () => {
    expect(responsiveDeclarations({ padding: '72px 0' })).toEqual(['padding: 72px 0'])
  })

  test('hidden false emits nothing', () => {
    expect(responsiveDeclarations({ hidden: false })).toEqual([])
  })

  test('empty overrides emit nothing', () => {
    expect(responsiveDeclarations(undefined)).toEqual([])
    expect(responsiveDeclarations({})).toEqual([])
  })
})
