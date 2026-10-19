import { gradient, solid } from '@/app/demo/colors'

import { SAMPLE } from './palette'
import {
  BODY_FILL,
  CARD_GAP,
  CONTENT_RESPONSIVE,
  INK_FILL,
  cardFrame,
  cardHeading,
  cardParagraph,
  contentFrame,
  mainFrame,
  pageButton,
  sectionFrame,
  sectionTitle,
  textResponsiveLayout
} from './shared'
import { frame, text } from './web'
import type { SampleContext } from './web'

const FEATURES = [
  {
    name: 'Local-first Card',
    title: 'Local-first',
    body: 'Your files never leave the machine. Export runs entirely in the browser.',
    gradient: [
      { color: SAMPLE.blue, position: 0 },
      { color: SAMPLE.sky, position: 1 }
    ]
  },
  {
    name: 'Classes Card',
    title: 'Reusable classes',
    body: 'Save a visual style once, then apply it to any element on the page.',
    gradient: [
      { color: SAMPLE.indigo, position: 0 },
      { color: SAMPLE.blue, position: 1 }
    ]
  },
  {
    name: 'Responsive Card',
    title: 'Explicit breakpoints',
    body: 'Move, hide, or resize only what you declare for tablet and mobile.',
    gradient: [
      { color: SAMPLE.teal, position: 0 },
      { color: SAMPLE.sky, position: 1 }
    ]
  }
] as const

function hero(ctx: SampleContext, mainId: string): void {
  const sectionId = sectionFrame(ctx, mainId, 'Hero Section', [0, 0, 1280, 760], {
    fill: SAMPLE.page
  })
  const contentId = contentFrame(ctx, sectionId, 'Hero Content', [0, 0, 1152, 760], { gap: 20 })

  text(
    ctx,
    contentId,
    'Eyebrow',
    [0, 0, 260, 20],
    'WEB BUILDER · PHASE 6',
    {
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Inter',
      letterSpacing: 1.4,
      lineHeight: 20,
      textAutoResize: 'WIDTH_AND_HEIGHT',
      fills: [solid(SAMPLE.blue)]
    },
    { tag: 'span' }
  )

  text(
    ctx,
    contentId,
    'Hero Title',
    [0, 0, 900, 124],
    'Design it visually.\nShip clean HTML.',
    {
      fontSize: 52,
      fontWeight: 700,
      fontFamily: 'Inter',
      lineHeight: 62,
      textAlignHorizontal: 'CENTER',
      textAutoResize: 'HEIGHT',
      fills: INK_FILL
    },
    { tag: 'h1', layout: textResponsiveLayout }
  )

  text(
    ctx,
    contentId,
    'Hero Subtitle',
    [0, 0, 720, 56],
    'A local-first design tool that exports semantic, responsive pages — without a single guessed value.',
    {
      fontSize: 18,
      fontWeight: 400,
      fontFamily: 'Inter',
      lineHeight: 28,
      textAlignHorizontal: 'CENTER',
      textAutoResize: 'HEIGHT',
      fills: BODY_FILL
    },
    { tag: 'p', layout: textResponsiveLayout }
  )

  pageButton(ctx, contentId, 'Hero Button', 'Try the sample')

  frame(
    ctx,
    contentId,
    'Hero Gradient',
    [0, 0, 720, 240],
    {
      cornerRadius: 20,
      fills: [
        gradient([
          { color: SAMPLE.blue, position: 0 },
          { color: SAMPLE.indigo, position: 1 }
        ])
      ]
    },
    { decorative: true, layout: { type: 'none', responsive: CONTENT_RESPONSIVE } }
  )
}

function featureCard(ctx: SampleContext, rowId: string, feature: (typeof FEATURES)[number]): void {
  const cardId = cardFrame(ctx, rowId, feature.name, [0, 0, 368, 280], {
    tag: 'article',
    grow: true
  })

  frame(
    ctx,
    cardId,
    'Card Icon',
    [0, 0, 52, 52],
    {
      cornerRadius: 14,
      fills: [gradient([...feature.gradient])]
    },
    { decorative: true }
  )

  cardHeading(ctx, cardId, 'Card Title', feature.title, 320)
  cardParagraph(ctx, cardId, 'Card Body', feature.body, 320)
}

function features(ctx: SampleContext, mainId: string): void {
  const sectionId = sectionFrame(ctx, mainId, 'Features Section', [0, 760, 1280, 640], {
    fill: SAMPLE.white,
    id: 'features'
  })
  const contentId = contentFrame(ctx, sectionId, 'Features Content', [0, 0, 1152, 640], {
    gap: 36
  })

  sectionTitle(
    ctx,
    contentId,
    'Features Title',
    'Everything you need to ship',
    'Semantic tags, flex layouts, reusable classes, and explicit responsive overrides.'
  )

  const rowId = frame(
    ctx,
    contentId,
    'Features Row',
    [0, 0, 1152, 280],
    {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      primaryAxisAlign: 'MIN',
      counterAxisAlign: 'MIN',
      itemSpacing: CARD_GAP
    },
    {
      tag: 'div',
      classes: ['auto-height'],
      layout: {
        type: 'flex',
        direction: 'row',
        alignItems: 'flex-start',
        gap: `${CARD_GAP}px`,
        responsive: {
          tablet: { width: 'full', direction: 'column', height: 'auto' },
          mobile: { width: 'full', direction: 'column', height: 'auto' }
        }
      }
    }
  )

  for (const feature of FEATURES) featureCard(ctx, rowId, feature)
}

function callToAction(ctx: SampleContext, mainId: string): void {
  const sectionId = sectionFrame(ctx, mainId, 'CTA Section', [0, 1400, 1280, 260], {
    fill: SAMPLE.ink,
    id: 'cta'
  })
  const contentId = contentFrame(ctx, sectionId, 'CTA Content', [0, 0, 1152, 260], { gap: 14 })

  text(
    ctx,
    contentId,
    'CTA Title',
    [0, 0, 640, 40],
    'Keep the sample as your starting point',
    {
      fontSize: 32,
      fontWeight: 700,
      fontFamily: 'Inter',
      lineHeight: 40,
      textAlignHorizontal: 'CENTER',
      textAutoResize: 'HEIGHT',
      fills: [solid(SAMPLE.white)]
    },
    { tag: 'h2', layout: textResponsiveLayout }
  )

  text(
    ctx,
    contentId,
    'CTA Body',
    [0, 0, 720, 52],
    'Open the layers, inspect every tag, then export a .fig file to continue in OpenPencil.',
    {
      fontSize: 16,
      fontWeight: 400,
      fontFamily: 'Inter',
      lineHeight: 26,
      textAlignHorizontal: 'CENTER',
      textAutoResize: 'HEIGHT',
      fills: [solid({ ...SAMPLE.white, a: 0.75 })]
    },
    { tag: 'p', layout: textResponsiveLayout }
  )

  pageButton(ctx, contentId, 'CTA Button', 'Download the sample')
}

export function buildHome(ctx: SampleContext, pageId: string): void {
  const mainId = mainFrame(ctx, pageId, 'Home Main', 80, 1660)
  hero(ctx, mainId)
  features(ctx, mainId)
  callToAction(ctx, mainId)
}
