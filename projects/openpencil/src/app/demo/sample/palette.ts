import type { Color, Fill, Stroke } from '@open-pencil/scene-graph'

import { solid, thinStroke } from '@/app/demo/colors'
import { dropShadow } from '@/app/demo/effects'

/** Palette used by the Web Builder sample project. */
export const SAMPLE = {
  white: { r: 1, g: 1, b: 1, a: 1 },
  page: { r: 0.973, g: 0.98, b: 0.988, a: 1 },
  ink: { r: 0.059, g: 0.09, b: 0.165, a: 1 },
  body: { r: 0.28, g: 0.333, b: 0.412, a: 1 },
  muted: { r: 0.58, g: 0.639, b: 0.722, a: 1 },
  border: { r: 0.886, g: 0.91, b: 0.941, a: 1 },
  blue: { r: 0.145, g: 0.388, b: 0.922, a: 1 },
  indigo: { r: 0.31, g: 0.275, b: 0.898, a: 1 },
  sky: { r: 0.22, g: 0.741, b: 0.973, a: 1 },
  teal: { r: 0.078, g: 0.722, b: 0.651, a: 1 },
  footer: { r: 0.008, g: 0.024, b: 0.09, a: 1 }
} satisfies Record<string, Color>

export function surface(): Fill[] {
  return [solid(SAMPLE.white)]
}

export function borderStroke(): Stroke[] {
  return thinStroke(SAMPLE.border)
}

/** Soft elevation used by cards and primary buttons. */
export function cardShadow() {
  return dropShadow(0, 16, 40, 0, { r: 0.06, g: 0.09, b: 0.16, a: 0.1 })
}

export function buttonShadow() {
  return dropShadow(0, 10, 24, 0, { r: 0.145, g: 0.388, b: 0.922, a: 0.28 })
}
