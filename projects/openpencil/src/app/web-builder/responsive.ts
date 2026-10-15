/**
 * Responsive overrides for the three-size export (Desktop / Tablet / Mobile).
 *
 * The designer explicitly declares what changes at each smaller breakpoint;
 * any field left unset means "inherit" and emits nothing ("no guessing").
 */

export type ResponsiveDevice = 'tablet' | 'mobile'

export interface ResponsiveOverrides {
  direction?: 'row' | 'column'
  hidden?: boolean
  width?: 'auto' | 'full'
  justifyContent?: string
  alignItems?: string
  gap?: string
  gridTemplateColumns?: string
}

export interface ResponsiveMap {
  tablet?: ResponsiveOverrides
  mobile?: ResponsiveOverrides
}

/**
 * Shape of the responsive-related fields inside the stored layout blob. The flat
 * `tabletDirection`/`mobileDirection` fields predate this module and are migrated
 * on read so older documents keep working.
 */
export interface LayoutResponsiveSource {
  responsive?: ResponsiveMap
  tabletDirection?: string
  mobileDirection?: string
}

function direction(value: string | undefined): 'row' | 'column' | undefined {
  return value === 'row' || value === 'column' ? value : undefined
}

/**
 * Reads the responsive overrides from a stored layout, folding the legacy flat
 * direction fields into the map. Unset devices are omitted.
 */
export function readResponsive(layout: LayoutResponsiveSource | null | undefined): ResponsiveMap {
  const result: ResponsiveMap = {}
  if (layout?.responsive?.tablet) result.tablet = { ...layout.responsive.tablet }
  if (layout?.responsive?.mobile) result.mobile = { ...layout.responsive.mobile }

  const tabletDirection = direction(layout?.tabletDirection)
  if (tabletDirection) result.tablet = { ...result.tablet, direction: tabletDirection }
  const mobileDirection = direction(layout?.mobileDirection)
  if (mobileDirection) result.mobile = { ...result.mobile, direction: mobileDirection }

  return result
}

/**
 * Converts one breakpoint's overrides into CSS declarations. Returns an empty
 * array when nothing was declared for that device.
 */
export function responsiveDeclarations(overrides: ResponsiveOverrides | undefined): string[] {
  if (!overrides) return []
  const declarations: string[] = []
  if (overrides.direction) declarations.push(`flex-direction: ${overrides.direction}`)
  if (overrides.hidden) declarations.push('display: none')
  if (overrides.width === 'full') declarations.push('width: 100%')
  else if (overrides.width === 'auto') declarations.push('width: auto')
  if (overrides.justifyContent) declarations.push(`justify-content: ${overrides.justifyContent}`)
  if (overrides.alignItems) declarations.push(`align-items: ${overrides.alignItems}`)
  if (overrides.gap) declarations.push(`gap: ${overrides.gap}`)
  if (overrides.gridTemplateColumns)
    declarations.push(`grid-template-columns: ${overrides.gridTemplateColumns}`)
  return declarations
}
