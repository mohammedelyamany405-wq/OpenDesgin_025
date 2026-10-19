import { computeAllLayouts } from '@open-pencil/core/layout'
import type { SceneGraph } from '@open-pencil/scene-graph'

import type { EditorStore } from '@/app/editor/session'

import { buildAbout } from './about'
import { buildFooter, buildHeader } from './chrome'
import { buildHome } from './home'
import { setBreakpoints, setPageMeta, setStyleClasses } from './web'
import type { SampleContext, StyleClassInput } from './web'

export interface SampleIds {
  homeId: string
  aboutId: string
}

const BREAKPOINTS = { tablet: 768, mobile: 480 } as const

const HOME_META = {
  name: 'Home',
  title: 'Northwind Studio — Web Builder sample',
  lang: 'en',
  description: 'A sample landing page exported by the OpenPencil Web Builder.',
  slug: 'home',
  isHome: true
}

const ABOUT_META = {
  name: 'About',
  title: 'About — Northwind Studio',
  lang: 'en',
  description: 'The story behind Northwind Studio.',
  slug: 'about',
  isHome: false
}

const STYLE_CLASSES: StyleClassInput[] = [
  {
    name: 'card',
    declarations: [
      'background-color: #ffffff',
      'border: 1px solid #e2e8f0',
      'border-radius: 16px',
      'padding: 24px',
      'box-shadow: 0 16px 40px rgba(15, 23, 42, 0.10)'
    ]
  },
  {
    name: 'auto-height',
    declarations: ['height: auto']
  },
  {
    name: 'btn-primary',
    declarations: [
      'background-color: #2563eb',
      'border-radius: 12px',
      'color: #ffffff',
      'box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28)'
    ]
  }
]

/**
 * Builds the sample site from scratch: two pages, semantic tags, flex layouts,
 * reusable classes, page links, and explicit tablet/mobile overrides.
 */
export function buildSampleProject(graph: SceneGraph): SampleIds {
  const existing = graph.getPages()[0]
  const home = existing ?? graph.addPage('Home')
  const about = graph.addPage('About')
  const ctx: SampleContext = { graph, homeId: home.id, aboutId: about.id }

  setPageMeta(graph, home.id, HOME_META)
  setPageMeta(graph, about.id, ABOUT_META)
  setBreakpoints(graph, home.id, BREAKPOINTS.tablet, BREAKPOINTS.mobile)
  setBreakpoints(graph, about.id, BREAKPOINTS.tablet, BREAKPOINTS.mobile)
  setStyleClasses(graph, home.id, STYLE_CLASSES)
  setStyleClasses(graph, about.id, STYLE_CLASSES)

  buildHeader(ctx, home.id)
  buildHome(ctx, home.id)
  buildFooter(ctx, home.id, 1740)

  buildHeader(ctx, about.id)
  buildAbout(ctx, about.id)
  buildFooter(ctx, about.id, 1240)

  computeAllLayouts(graph)
  return { homeId: home.id, aboutId: about.id }
}

/** Loads the sample into the active tab and frames the home page. */
export function createSampleDocument(store: EditorStore): SampleIds {
  store.state.documentName = 'web-builder-sample'
  const ids = buildSampleProject(store.graph)
  store.clearSelection()
  void store
    .switchPage(ids.homeId)
    .then(() => {
      store.requestRender()
      return store.fitCurrentPageToViewport()
    })
    .catch(() => undefined)
  return ids
}
