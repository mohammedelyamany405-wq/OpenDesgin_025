import type { Fill } from '@open-pencil/scene-graph'

import { solid } from '@/app/demo/colors'

import { SAMPLE, surface } from './palette'
import { frame, text } from './web'
import type { SampleContext } from './web'

const NAV_GAP = 28
const INK: Fill[] = [solid(SAMPLE.ink)]
const BODY: Fill[] = [solid(SAMPLE.body)]
const FOOTER_TEXT: Fill[] = [solid({ ...SAMPLE.white, a: 0.72 })]

function navLink(
  ctx: SampleContext,
  parentId: string,
  label: string,
  href: string,
  pageLink?: string
): string {
  return text(
    ctx,
    parentId,
    `${label} Link`,
    [0, 0, 80, 22],
    label,
    {
      fontSize: 15,
      fontWeight: 500,
      fontFamily: 'Inter',
      lineHeight: 22,
      textAutoResize: 'WIDTH_AND_HEIGHT',
      fills: BODY
    },
    { tag: 'a', attrs: { href }, pageLink }
  )
}

/** Shared header used by both sample pages. */
export function buildHeader(ctx: SampleContext, pageId: string): string {
  const headerId = frame(
    ctx,
    pageId,
    'Site Header',
    [0, 0, 1280, 80],
    {
      fills: surface(),
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      primaryAxisAlign: 'CENTER',
      counterAxisAlign: 'CENTER'
    },
    {
      tag: 'header',
      layout: {
        type: 'flex',
        direction: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        responsive: { tablet: { width: 'full' }, mobile: { width: 'full' } }
      }
    }
  )

  const contentId = frame(
    ctx,
    headerId,
    'Header Content',
    [0, 0, 1152, 80],
    {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      primaryAxisAlign: 'SPACE_BETWEEN',
      counterAxisAlign: 'CENTER'
    },
    {
      tag: 'div',
      classes: ['container'],
      layout: {
        type: 'flex',
        direction: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        responsive: { tablet: { width: 'full' }, mobile: { width: 'full' } }
      }
    }
  )

  text(
    ctx,
    contentId,
    'Brand Link',
    [0, 28, 120, 24],
    'Northwind',
    {
      fontSize: 20,
      fontWeight: 700,
      fontFamily: 'Inter',
      lineHeight: 24,
      textAutoResize: 'WIDTH_AND_HEIGHT',
      fills: INK
    },
    { tag: 'a', pageLink: ctx.homeId }
  )

  const navId = frame(
    ctx,
    contentId,
    'Main Nav',
    [840, 28, 312, 24],
    {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'HUG',
      primaryAxisAlign: 'MIN',
      counterAxisAlign: 'CENTER',
      itemSpacing: NAV_GAP
    },
    {
      tag: 'nav',
      layout: {
        type: 'flex',
        direction: 'row',
        alignItems: 'center',
        gap: `${NAV_GAP}px`,
        responsive: { mobile: { hidden: true } }
      }
    }
  )

  navLink(ctx, navId, 'Home', 'index.html', ctx.homeId)
  navLink(ctx, navId, 'About', 'about.html', ctx.aboutId)
  navLink(ctx, navId, 'Contact', '#contact')
  return headerId
}

/** Shared footer used by both sample pages. */
export function buildFooter(ctx: SampleContext, pageId: string, y: number): string {
  const footerId = frame(
    ctx,
    pageId,
    'Site Footer',
    [0, y, 1280, 140],
    {
      fills: [solid(SAMPLE.footer)],
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      primaryAxisAlign: 'CENTER',
      counterAxisAlign: 'CENTER'
    },
    {
      tag: 'footer',
      layout: {
        type: 'flex',
        direction: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        responsive: { tablet: { width: 'full' }, mobile: { width: 'full' } }
      }
    }
  )

  const contentId = frame(
    ctx,
    footerId,
    'Footer Content',
    [0, 0, 1152, 140],
    {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      primaryAxisAlign: 'SPACE_BETWEEN',
      counterAxisAlign: 'CENTER'
    },
    {
      tag: 'div',
      classes: ['container'],
      attrs: { id: 'contact' },
      layout: {
        type: 'flex',
        direction: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        responsive: {
          tablet: { width: 'full' },
          mobile: { width: 'full', direction: 'column', justifyContent: 'center', gap: '12px' }
        }
      }
    }
  )

  text(
    ctx,
    contentId,
    'Copyright',
    [0, 60, 320, 20],
    '© 2026 Northwind Studio',
    {
      fontSize: 14,
      fontWeight: 400,
      fontFamily: 'Inter',
      lineHeight: 20,
      textAutoResize: 'WIDTH_AND_HEIGHT',
      fills: FOOTER_TEXT
    },
    { tag: 'p' }
  )

  const navId = frame(
    ctx,
    contentId,
    'Footer Nav',
    [0, 60, 160, 20],
    {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'HUG',
      primaryAxisAlign: 'MIN',
      counterAxisAlign: 'CENTER',
      itemSpacing: 24
    },
    {
      tag: 'nav',
      layout: { type: 'flex', direction: 'row', alignItems: 'center', gap: '24px' }
    }
  )

  for (const label of ['Privacy', 'Terms']) {
    text(
      ctx,
      navId,
      `${label} Link`,
      [0, 0, 80, 20],
      label,
      {
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'Inter',
        lineHeight: 20,
        textAutoResize: 'WIDTH_AND_HEIGHT',
        fills: FOOTER_TEXT
      },
      { tag: 'a', attrs: { href: '#' } }
    )
  }

  return footerId
}
