import type { Color, Fill } from '@open-pencil/scene-graph'

import { solid } from '@/app/demo/colors'
import type { ResponsiveMap } from '@/app/web-builder/responsive'

import { SAMPLE, borderStroke, buttonShadow, cardShadow, surface } from './palette'
import { frame, text } from './web'
import type { Box, FlexLayout, SampleContext } from './web'

export const CARD_GAP = 24

export const INK_FILL: Fill[] = [solid(SAMPLE.ink)]
export const BODY_FILL: Fill[] = [solid(SAMPLE.body)]

export const SECTION_RESPONSIVE: ResponsiveMap = {
  tablet: { width: 'full', height: 'auto', padding: '72px 0' },
  mobile: { width: 'full', height: 'auto', padding: '72px 0' }
}

export const CONTENT_RESPONSIVE: ResponsiveMap = {
  tablet: { width: 'full', height: 'auto' },
  mobile: { width: 'full', height: 'auto' }
}

const FULL_WIDTH = {
  tablet: { width: 'full' as const },
  mobile: { width: 'full' as const }
}

/** Narrow layout blob used only to declare responsive width on a text node. */
export const textResponsiveLayout: FlexLayout = { type: 'none', responsive: FULL_WIDTH }

/** Full-width section shell with a centered flex row/column. */
export function sectionFrame(
  ctx: SampleContext,
  parentId: string,
  name: string,
  box: Box,
  options: { fill: Color; direction?: 'row' | 'column'; id?: string }
): string {
  const horizontal = options.direction === 'row'
  return frame(
    ctx,
    parentId,
    name,
    box,
    {
      fills: [solid(options.fill)],
      layoutMode: horizontal ? 'HORIZONTAL' : 'VERTICAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      primaryAxisAlign: 'CENTER',
      counterAxisAlign: 'CENTER'
    },
    {
      tag: 'section',
      attrs: options.id ? { id: options.id } : undefined,
      layout: {
        type: 'flex',
        direction: options.direction ?? 'column',
        justifyContent: 'center',
        alignItems: 'center',
        responsive: SECTION_RESPONSIVE
      }
    }
  )
}

/** Centered content wrapper; `container` supplies the page gutters. */
export function contentFrame(
  ctx: SampleContext,
  parentId: string,
  name: string,
  box: Box,
  options: { direction?: 'row' | 'column'; gap: number; responsive?: ResponsiveMap }
): string {
  const horizontal = options.direction === 'row'
  return frame(
    ctx,
    parentId,
    name,
    box,
    {
      layoutMode: horizontal ? 'HORIZONTAL' : 'VERTICAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      primaryAxisAlign: 'CENTER',
      counterAxisAlign: 'CENTER',
      itemSpacing: options.gap
    },
    {
      tag: 'div',
      classes: ['container'],
      layout: {
        type: 'flex',
        direction: options.direction ?? 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: `${options.gap}px`,
        responsive: options.responsive ?? CONTENT_RESPONSIVE
      }
    }
  )
}

/** Page root that stacks sections vertically. */
export function mainFrame(
  ctx: SampleContext,
  pageId: string,
  name: string,
  y: number,
  height: number
): string {
  return frame(
    ctx,
    pageId,
    name,
    [0, y, 1280, height],
    {
      layoutMode: 'VERTICAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      primaryAxisAlign: 'MIN',
      counterAxisAlign: 'MIN'
    },
    {
      tag: 'main',
      layout: { type: 'flex', direction: 'column', responsive: CONTENT_RESPONSIVE }
    }
  )
}

/** Reusable card shell that demonstrates the saved `card` style class. */
export function cardFrame(
  ctx: SampleContext,
  parentId: string,
  name: string,
  box: Box,
  options: { tag: 'article' | 'aside'; grow?: boolean }
): string {
  return frame(
    ctx,
    parentId,
    name,
    box,
    {
      cornerRadius: 16,
      fills: surface(),
      strokes: borderStroke(),
      effects: [cardShadow()],
      layoutMode: 'VERTICAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      primaryAxisAlign: 'CENTER',
      counterAxisAlign: 'MIN',
      itemSpacing: 12,
      paddingLeft: 24,
      paddingRight: 24,
      paddingTop: 24,
      paddingBottom: 24,
      layoutGrow: options.grow ? 1 : 0
    },
    {
      tag: options.tag,
      classes: ['card'],
      layout: {
        type: 'flex',
        direction: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '12px',
        responsive: CONTENT_RESPONSIVE
      }
    }
  )
}

export function cardHeading(
  ctx: SampleContext,
  parentId: string,
  name: string,
  content: string,
  width: number
): string {
  return text(
    ctx,
    parentId,
    name,
    [0, 0, width, 28],
    content,
    {
      fontSize: 20,
      fontWeight: 600,
      fontFamily: 'Inter',
      lineHeight: 28,
      textAutoResize: 'HEIGHT',
      fills: INK_FILL
    },
    { tag: 'h3', layout: textResponsiveLayout }
  )
}

export function cardParagraph(
  ctx: SampleContext,
  parentId: string,
  name: string,
  content: string,
  width: number
): string {
  return text(
    ctx,
    parentId,
    name,
    [0, 0, width, 24],
    content,
    {
      fontSize: 15,
      fontWeight: 400,
      fontFamily: 'Inter',
      lineHeight: 24,
      textAutoResize: 'HEIGHT',
      fills: BODY_FILL
    },
    { tag: 'p', layout: textResponsiveLayout }
  )
}

export function pageButton(
  ctx: SampleContext,
  parentId: string,
  name: string,
  label: string
): string {
  const buttonId = frame(
    ctx,
    parentId,
    name,
    [0, 0, 180, 56],
    {
      cornerRadius: 12,
      fills: [solid(SAMPLE.blue)],
      effects: [buttonShadow()],
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'HUG',
      primaryAxisAlign: 'CENTER',
      counterAxisAlign: 'CENTER',
      paddingLeft: 28,
      paddingRight: 28,
      paddingTop: 16,
      paddingBottom: 16
    },
    {
      tag: 'button',
      attrs: { type: 'button' },
      classes: ['btn-primary'],
      layout: {
        type: 'flex',
        direction: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }
    }
  )

  text(
    ctx,
    buttonId,
    `${label} Label`,
    [0, 0, 120, 20],
    label,
    {
      fontSize: 16,
      fontWeight: 600,
      fontFamily: 'Inter',
      lineHeight: 20,
      textAutoResize: 'WIDTH_AND_HEIGHT',
      fills: [solid(SAMPLE.white)]
    },
    { tag: 'span' }
  )

  return buttonId
}

export function sectionTitle(
  ctx: SampleContext,
  parentId: string,
  name: string,
  title: string,
  subtitle: string
): void {
  text(
    ctx,
    parentId,
    name,
    [0, 0, 720, 44],
    title,
    {
      fontSize: 36,
      fontWeight: 700,
      fontFamily: 'Inter',
      lineHeight: 44,
      textAlignHorizontal: 'CENTER',
      textAutoResize: 'HEIGHT',
      fills: INK_FILL
    },
    { tag: 'h2', layout: textResponsiveLayout }
  )

  text(
    ctx,
    parentId,
    `${name} Description`,
    [0, 0, 640, 28],
    subtitle,
    {
      fontSize: 17,
      fontWeight: 400,
      fontFamily: 'Inter',
      lineHeight: 28,
      textAlignHorizontal: 'CENTER',
      textAutoResize: 'HEIGHT',
      fills: BODY_FILL
    },
    { tag: 'p', layout: textResponsiveLayout }
  )
}
