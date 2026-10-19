import type { ResponsiveMap } from '@/app/web-builder/responsive'

import { SAMPLE } from './palette'
import {
  BODY_FILL,
  CONTENT_RESPONSIVE,
  INK_FILL,
  cardFrame,
  cardHeading,
  cardParagraph,
  contentFrame,
  mainFrame,
  sectionFrame,
  textResponsiveLayout
} from './shared'
import { frame, text } from './web'
import type { SampleContext } from './web'

const STORY = [
  'Northwind started as a two-person studio shipping design systems for small teams. We kept rebuilding the same pages by hand, so we built a tool that exports what we actually drew.',
  'Every exported value comes from a layer you can inspect — no hidden defaults, no generated guesses. If it is not in the file, it is not in the page.'
]

const VALUES = ['Craft over speed', 'Clear over clever', 'Local over locked-in']

const STORY_RESPONSIVE: ResponsiveMap = {
  tablet: { width: 'full', direction: 'column', gap: '24px', height: 'auto' },
  mobile: { width: 'full', direction: 'column', gap: '24px', height: 'auto' }
}

function intro(ctx: SampleContext, mainId: string): void {
  const sectionId = sectionFrame(ctx, mainId, 'Intro Section', [0, 0, 1280, 360], {
    fill: SAMPLE.page
  })
  const contentId = contentFrame(ctx, sectionId, 'Intro Content', [0, 0, 1152, 360], { gap: 16 })

  text(
    ctx,
    contentId,
    'About Title',
    [0, 0, 900, 112],
    'We build calm software',
    {
      fontSize: 48,
      fontWeight: 700,
      fontFamily: 'Inter',
      lineHeight: 56,
      textAlignHorizontal: 'CENTER',
      textAutoResize: 'HEIGHT',
      fills: INK_FILL
    },
    { tag: 'h1', layout: textResponsiveLayout }
  )

  text(
    ctx,
    contentId,
    'About Subtitle',
    [0, 0, 720, 56],
    'A small studio making design tools that stay out of the way — and pages that stay readable.',
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
}

function story(ctx: SampleContext, mainId: string): void {
  const sectionId = sectionFrame(ctx, mainId, 'Story Section', [0, 360, 1280, 800], {
    fill: SAMPLE.white,
    direction: 'row',
    id: 'story'
  })
  const contentId = contentFrame(ctx, sectionId, 'Story Content', [0, 0, 1152, 800], {
    direction: 'row',
    gap: 48,
    responsive: STORY_RESPONSIVE
  })

  const copyId = frame(
    ctx,
    contentId,
    'Story Copy',
    [0, 0, 560, 320],
    {
      layoutMode: 'VERTICAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      primaryAxisAlign: 'CENTER',
      counterAxisAlign: 'MIN',
      itemSpacing: 16
    },
    {
      tag: 'div',
      layout: {
        type: 'flex',
        direction: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '16px',
        responsive: CONTENT_RESPONSIVE
      }
    }
  )

  text(
    ctx,
    copyId,
    'Story Title',
    [0, 0, 560, 44],
    'Our story',
    {
      fontSize: 36,
      fontWeight: 700,
      fontFamily: 'Inter',
      lineHeight: 44,
      textAutoResize: 'HEIGHT',
      fills: INK_FILL
    },
    { tag: 'h2', layout: textResponsiveLayout }
  )

  STORY.forEach((paragraph, index) => {
    text(
      ctx,
      copyId,
      `Story Paragraph ${index + 1}`,
      [0, 0, 560, 78],
      paragraph,
      {
        fontSize: 16,
        fontWeight: 400,
        fontFamily: 'Inter',
        lineHeight: 26,
        textAutoResize: 'HEIGHT',
        fills: BODY_FILL
      },
      { tag: 'p', layout: textResponsiveLayout }
    )
  })

  const cardId = cardFrame(ctx, contentId, 'Values Card', [0, 0, 480, 420], { tag: 'aside' })
  cardHeading(ctx, cardId, 'Values Title', 'What we value', 432)
  for (const value of VALUES) {
    cardParagraph(ctx, cardId, `${value} Value`, `— ${value}`, 432)
  }
}

export function buildAbout(ctx: SampleContext, pageId: string): void {
  const mainId = mainFrame(ctx, pageId, 'About Main', 80, 1160)
  intro(ctx, mainId)
  story(ctx, mainId)
}
