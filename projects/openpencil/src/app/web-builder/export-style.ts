import { colorToCSS } from '@open-pencil/core/color'
import type { Color, Effect, Fill, GradientTransform, Stroke } from '@open-pencil/scene-graph'

/**
 * Structural view of the node fields the visual exporter needs.
 * A real `SceneNode` satisfies this shape, and tests can build lightweight objects.
 */
export interface NodeStyleSource {
  type?: string
  width?: number
  height?: number
  clipsContent?: boolean
  textAutoResize?: string
  fills?: readonly Fill[] | null
  strokes?: readonly Stroke[] | null
  effects?: readonly Effect[] | null
  opacity?: number
  cornerRadius?: number
  independentCorners?: boolean
  topLeftRadius?: number
  topRightRadius?: number
  bottomRightRadius?: number
  bottomLeftRadius?: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: number
  italic?: boolean
  textAlignHorizontal?: string
  lineHeight?: number | null
  letterSpacing?: number
  textCase?: string
  textDecoration?: string
}

/**
 * Resolves a bitmap hash from the document image registry to a CSS-ready URL
 * (typically a `data:` URL). Returning `undefined` skips the image fill.
 */
export type ImageResolver = (imageHash: string) => string | undefined

/**
 * Rounds noisy designer values (e.g. 0.30000001) without losing meaningful precision.
 */
function round(value: number, digits: number = 3): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function withOpacity(color: Color, opacity: number | undefined): Color {
  const factor = typeof opacity === 'number' ? opacity : 1
  return { ...color, a: round(color.a * factor, 4) }
}

function firstVisible<T extends { visible?: boolean }>(
  items: readonly T[] | null | undefined
): T | undefined {
  return items?.find((item) => item.visible !== false)
}

/**
 * Exports the node's declared box size. Positions (x/y) are intentionally not
 * exported ("no X/Y conversion"); sizes are factual and required for backgrounds,
 * borders, radii, and shadows to be visible.
 */
function sizeDeclarations(node: NodeStyleSource): string[] {
  if (node.type === 'TEXT' && node.textAutoResize === 'WIDTH_AND_HEIGHT') return []
  const declarations: string[] = []
  if (typeof node.width === 'number' && node.width > 0) declarations.push(`width: ${round(node.width)}px`)
  if (typeof node.height === 'number' && node.height > 0)
    declarations.push(`height: ${round(node.height)}px`)
  if (declarations.length > 0) declarations.push('box-sizing: border-box')
  if (node.clipsContent) declarations.push('overflow: hidden')
  return declarations
}

function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360
}

/**
 * Serializes gradient stops sorted by position, multiplying each stop's alpha
 * by the fill opacity to mirror the renderer's whole-shader alpha.
 */
function gradientStopList(fill: Fill): string {
  return [...(fill.gradientStops ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${colorToCSS(withOpacity(stop.color, fill.opacity))} ${round(stop.position * 100, 2)}%`)
    .join(', ')
}

/**
 * Resolves the gradient's local frame: `scale(w,h) * transform` over the unit
 * square, plus the transformed unit-space center (0.5, 0.5). Shared by the
 * radial and angular converters.
 */
interface GradientFrame {
  transform: GradientTransform
  width: number
  height: number
  centerX: number
  centerY: number
}

function gradientFrame(fill: Fill, width: number, height: number): GradientFrame | null {
  const transform = fill.gradientTransform
  if (!transform) return null
  const w = width || 1
  const h = height || 1
  return {
    transform,
    width: w,
    height: h,
    centerX: (transform.m00 * 0.5 + transform.m01 * 0.5 + transform.m02) * w,
    centerY: (transform.m10 * 0.5 + transform.m11 * 0.5 + transform.m12) * h
  }
}

/**
 * The renderer places the first stop at `((m00+m02)w, (m10+m12)h)` and travels
 * toward `(m02*w, m12*h)`, i.e. direction `(-m00*w, -m10*h)`. CSS measures its
 * gradient angle clockwise from "up", so `angle = atan2(dx, -dy)`.
 */
function linearGradientCss(fill: Fill, width: number, height: number): string | null {
  const frame = gradientFrame(fill, width, height)
  if (!frame) return null
  const dx = -frame.transform.m00 * frame.width
  const dy = -frame.transform.m10 * frame.height
  const angle = normalizeDeg((Math.atan2(dx, -dy) * 180) / Math.PI)
  return `linear-gradient(${round(angle, 2)}deg, ${gradientStopList(fill)})`
}

/**
 * Center and radii come from the gradient's local matrix (`scale(w,h) * transform`)
 * applied to the unit-space center (0.5, 0.5) and radius 0.5. The renderer draws
 * `GRADIENT_DIAMOND` as a radial gradient, so both map to `radial-gradient`.
 */
function radialGradientCss(fill: Fill, width: number, height: number): string | null {
  const frame = gradientFrame(fill, width, height)
  if (!frame) return null
  const { transform: t, width: w, height: h, centerX: cx, centerY: cy } = frame
  const rx = 0.5 * Math.hypot(t.m00 * w, t.m10 * h)
  const ry = 0.5 * Math.hypot(t.m01 * w, t.m11 * h)
  if (rx <= 0 || ry <= 0) return null
  return `radial-gradient(ellipse ${round(rx)}px ${round(ry)}px at ${round(cx)}px ${round(
    cy
  )}px, ${gradientStopList(fill)})`
}

/**
 * Sweep gradients start along the transformed x-axis; the center matches the
 * radial case. Rotation is approximated by the start angle only (CSS conic
 * gradients cannot carry a non-uniform matrix).
 */
function angularGradientCss(fill: Fill, width: number, height: number): string | null {
  const frame = gradientFrame(fill, width, height)
  if (!frame) return null
  const { transform: t, width: w, height: h, centerX: cx, centerY: cy } = frame
  const from = normalizeDeg((Math.atan2(t.m00 * w, -t.m10 * h) * 180) / Math.PI)
  return `conic-gradient(from ${round(from, 2)}deg at ${round(cx)}px ${round(cy)}px, ${gradientStopList(
    fill
  )})`
}

/**
 * Maps a gradient fill to its CSS `background-image` value. A gradient without
 * stops or without a transform is skipped, matching the renderer.
 */
function gradientCss(fill: Fill, width: number, height: number): string | null {
  if (!fill.gradientStops || fill.gradientStops.length === 0) return null
  switch (fill.type) {
    case 'GRADIENT_LINEAR':
      return linearGradientCss(fill, width, height)
    case 'GRADIENT_RADIAL':
    case 'GRADIENT_DIAMOND':
      return radialGradientCss(fill, width, height)
    case 'GRADIENT_ANGULAR':
      return angularGradientCss(fill, width, height)
    default:
      return null
  }
}

function imageDeclarations(fill: Fill, resolveImage?: ImageResolver): string[] {
  if (!fill.imageHash || !resolveImage) return []
  const url = resolveImage(fill.imageHash)
  if (!url) return []
  const declarations = [`background-image: url("${url}")`, 'background-position: center']
  switch (fill.imageScaleMode ?? 'FILL') {
    case 'FIT':
      declarations.push('background-size: contain', 'background-repeat: no-repeat')
      break
    case 'TILE':
      declarations.push('background-size: auto', 'background-repeat: repeat')
      break
    default:
      declarations.push('background-size: cover', 'background-repeat: no-repeat')
  }
  return declarations
}

/**
 * Converts the first visible fill into CSS declarations. Solid fills become
 * background-color (or color on text); gradients become background-image; image
 * fills become a resolved background-image. Text keeps color-only fills.
 */
function fillDeclarations(node: NodeStyleSource, resolveImage?: ImageResolver): string[] {
  const fill = firstVisible(node.fills)
  if (!fill) return []
  if (node.type === 'TEXT') {
    return fill.type === 'SOLID'
      ? [`color: ${colorToCSS(withOpacity(fill.color, fill.opacity))}`]
      : []
  }
  if (fill.type === 'SOLID') {
    return [`background-color: ${colorToCSS(withOpacity(fill.color, fill.opacity))}`]
  }
  if (fill.type === 'IMAGE') return imageDeclarations(fill, resolveImage)
  const gradient = gradientCss(fill, node.width ?? 0, node.height ?? 0)
  return gradient ? [`background-image: ${gradient}`] : []
}

function strokeDeclaration(node: NodeStyleSource): string | null {
  const stroke = firstVisible(node.strokes)
  if (!stroke || !(stroke.weight > 0)) return null
  const style = stroke.dashPattern && stroke.dashPattern.length > 0 ? 'dashed' : 'solid'
  const color = colorToCSS(withOpacity(stroke.color, stroke.opacity))
  return `border: ${round(stroke.weight)}px ${style} ${color}`
}

function radiusDeclaration(node: NodeStyleSource): string | null {
  if (node.independentCorners) {
    const tl = round(node.topLeftRadius ?? 0)
    const tr = round(node.topRightRadius ?? 0)
    const br = round(node.bottomRightRadius ?? 0)
    const bl = round(node.bottomLeftRadius ?? 0)
    if (tl === 0 && tr === 0 && br === 0 && bl === 0) return null
    return `border-radius: ${tl}px ${tr}px ${br}px ${bl}px`
  }
  const radius = round(node.cornerRadius ?? 0)
  return radius > 0 ? `border-radius: ${radius}px` : null
}

function shadowDeclaration(node: NodeStyleSource): string | null {
  const shadows = (node.effects ?? []).filter(
    (effect) =>
      effect.visible !== false &&
      (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW')
  )
  if (shadows.length === 0) return null
  const parts = shadows.map((effect) => {
    const inset = effect.type === 'INNER_SHADOW' ? 'inset ' : ''
    const color = colorToCSS(effect.color)
    return `${inset}${round(effect.offset.x)}px ${round(effect.offset.y)}px ${round(
      effect.radius
    )}px ${round(effect.spread)}px ${color}`
  })
  return `box-shadow: ${parts.join(', ')}`
}

function blurDeclarations(node: NodeStyleSource): string[] {
  const declarations: string[] = []
  const layerBlur = (node.effects ?? []).find(
    (effect) => effect.visible !== false && effect.type === 'LAYER_BLUR'
  )
  if (layerBlur && layerBlur.radius > 0) declarations.push(`filter: blur(${round(layerBlur.radius)}px)`)
  const backgroundBlur = (node.effects ?? []).find(
    (effect) => effect.visible !== false && effect.type === 'BACKGROUND_BLUR'
  )
  if (backgroundBlur && backgroundBlur.radius > 0)
    declarations.push(`backdrop-filter: blur(${round(backgroundBlur.radius)}px)`)
  return declarations
}

function opacityDeclaration(node: NodeStyleSource): string | null {
  if (typeof node.opacity !== 'number' || node.opacity >= 1) return null
  return `opacity: ${round(node.opacity)}`
}

function quoteFamily(family: string): string {
  return family.includes(' ') && !family.includes(',') ? `'${family}'` : family
}

function mapAlign(value: string | undefined): string | null {
  switch (value) {
    case 'LEFT':
      return 'left'
    case 'CENTER':
      return 'center'
    case 'RIGHT':
      return 'right'
    case 'JUSTIFIED':
      return 'justify'
    default:
      return null
  }
}

function mapCase(value: string | undefined): string | null {
  switch (value) {
    case 'UPPER':
      return 'uppercase'
    case 'LOWER':
      return 'lowercase'
    case 'TITLE':
      return 'capitalize'
    default:
      return null
  }
}

function mapDecoration(value: string | undefined): string | null {
  switch (value) {
    case 'UNDERLINE':
      return 'underline'
    case 'STRIKETHROUGH':
      return 'line-through'
    default:
      return null
  }
}

function textDeclarations(node: NodeStyleSource): string[] {
  if (node.type !== 'TEXT') return []
  const declarations: string[] = []
  if (node.fontFamily) declarations.push(`font-family: ${quoteFamily(node.fontFamily)}`)
  if (typeof node.fontSize === 'number' && node.fontSize > 0)
    declarations.push(`font-size: ${round(node.fontSize)}px`)
  if (node.fontWeight) declarations.push(`font-weight: ${node.fontWeight}`)
  if (node.italic) declarations.push('font-style: italic')
  if (typeof node.lineHeight === 'number' && node.lineHeight > 0)
    declarations.push(`line-height: ${round(node.lineHeight)}px`)
  if (node.letterSpacing) declarations.push(`letter-spacing: ${round(node.letterSpacing)}px`)
  const align = mapAlign(node.textAlignHorizontal)
  if (align) declarations.push(`text-align: ${align}`)
  const transform = mapCase(node.textCase)
  if (transform) declarations.push(`text-transform: ${transform}`)
  const decoration = mapDecoration(node.textDecoration)
  if (decoration) declarations.push(`text-decoration: ${decoration}`)
  return declarations
}

/**
 * Converts a node's declared visual properties into CSS declarations.
 * Only explicit values are emitted ("no guessing"). Solid, gradient, and
 * image fills are supported; anything else is intentionally skipped.
 */
export function visualStyleDeclarations(
  node: NodeStyleSource,
  resolveImage?: ImageResolver
): string[] {
  const declarations: string[] = []
  declarations.push(...sizeDeclarations(node))
  declarations.push(...fillDeclarations(node, resolveImage))
  const stroke = strokeDeclaration(node)
  if (stroke) declarations.push(stroke)
  const radius = radiusDeclaration(node)
  if (radius) declarations.push(radius)
  const shadow = shadowDeclaration(node)
  if (shadow) declarations.push(shadow)
  declarations.push(...blurDeclarations(node))
  const opacity = opacityDeclaration(node)
  if (opacity) declarations.push(opacity)
  declarations.push(...textDeclarations(node))
  return declarations
}
