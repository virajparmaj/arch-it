import { CLAIM_PROPERTIES, type BuildingClaim, type ClaimProperty } from '../../types/building'

export const CLAIM_LABELS: Record<ClaimProperty, string> = {
  name: 'Name', architect: 'Architect · OSM attribution', 'architect:wikidata': 'Architect identifiers · unresolved',
  start_date: 'Start date · as recorded', 'building:architecture': 'Architectural style',
  building: 'Building type', 'building:use': 'Current use · as recorded', height: 'Height',
  'building:levels': 'Above-ground levels · excluding roof', website: 'Website', 'contact:website': 'Contact website',
  engineer: 'Engineer tag · role unresolved', 'engineer:wikidata': 'Engineer identifiers · unresolved',
  wikidata: 'Building identifier · unresolved', heritage: 'Heritage · OSM claim',
  'addr:full': 'Full address · as recorded', 'addr:housenumber': 'House number', 'addr:street': 'Street',
  'addr:unit': 'Unit', 'addr:postcode': 'Postcode', 'addr:city': 'City', 'addr:state': 'State', 'addr:country': 'Country',
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function safeWebsite(value: string): boolean {
  if (!/^https?:\/\//i.test(value) || /[\s\\;]/u.test(value)
    || [...value].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)
    || /%(?:0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return false
  try {
    const url = new URL(value)
    const authority = value.split('/')[2]
    return !!url.hostname && !url.username && !url.password && !authority.includes('@')
      && /^[A-Za-z0-9.:-]+$/.test(authority)
      && url.hostname.split('.').every((part) => /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(part))
      && (!url.port || Number(url.port) > 0)
  } catch { return false }
}

function validNormalized(claim: Record<string, unknown>): boolean {
  const n = claim.normalized
  if (!record(n) || typeof claim.value !== 'string') return false
  const raw = claim.value.trim()
  if (!raw) return false
  const property = claim.property
  if (property === 'website' || property === 'contact:website') return n.kind === 'url' && n.url === raw && safeWebsite(raw)
  if (property === 'architect' || property === 'building:architecture' || property === 'architect:wikidata' || property === 'engineer:wikidata' || property === 'wikidata') {
    const identifiers = property !== 'architect' && property !== 'building:architecture'
    return n.kind === (identifiers ? 'identifiers' : 'list') && Array.isArray(n.values)
      && JSON.stringify(n.values) === JSON.stringify(raw.split(';').map((part) => part.trim()))
      && n.values.every((item) => typeof item === 'string' && (identifiers ? /^Q[1-9][0-9]*$/.test(item) : !!item))
  }
  if (property === 'start_date') {
    const precision = { 4: 'year', 7: 'month', 10: 'day' }[raw.length]
    if (n.kind !== 'date' || n.text !== raw || n.precision !== precision || !/^[0-9]{4}(?:-[0-9]{2}(?:-[0-9]{2})?)?$/.test(raw) || raw.startsWith('0000')) return false
    const full = raw + (raw.length === 4 ? '-01-01' : raw.length === 7 ? '-01' : '')
    const date = new Date(full)
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === full
  }
  if (property === 'height' || property === 'building:levels') {
    if (n.kind !== 'quantity' || typeof n.value !== 'number' || !Number.isFinite(n.value)) return false
    if (property === 'building:levels') return n.unit === 'levels' && /^[0-9]{1,15}$/.test(raw) && Number(raw) === n.value
    const metric = raw.match(/^([0-9]+(?:\.[0-9]+)?)(?: m)?$/)
    const feet = raw.match(/^([0-9]+)'(?:([0-9]+(?:\.[0-9]+)?)")?$/)
    let expected: number | null = null
    if (metric) expected = Number(metric[1])
    else if (feet && Number(feet[2] ?? 0) < 12) expected = Number(feet[1]) * 0.3048 + Number(feet[2] ?? 0) * 0.0254
    return n.unit === 'm' && n.value > 0 && expected !== null && Math.abs(expected - n.value) <= 1e-9 * n.value
  }
  return property !== 'engineer' && n.kind === 'text' && n.text === raw
}

export function validClaim(value: unknown, sourceId: string, recordId: string): boolean {
  if (!record(value) || !CLAIM_PROPERTIES.includes(value.property as ClaimProperty)
    || value.raw_property !== `tags.${value.property}` || typeof value.value !== 'string'
    || value.source_id !== sourceId || value.source_record_id !== recordId) return false
  if (value.status === 'normalized') return value.note === null && validNormalized(value)
  return (value.status === 'raw_only' || value.status === 'invalid') && value.normalized === null
    && typeof value.note === 'string' && value.note.length > 0
}

export function claimText(claim: BuildingClaim): string {
  const n = claim.normalized
  if (!n) return claim.value.trim() || 'Empty source value'
  if (n.kind === 'quantity') return `${n.value}${n.unit === 'm' ? ' m' : ''}`
  if (n.kind === 'list' || n.kind === 'identifiers') return n.values.join('; ')
  if (n.kind === 'url') return n.url
  if (n.kind === 'text' && claim.property === 'building' && n.text === 'yes') return 'Type unspecified (building=yes)'
  if (n.kind === 'text' && claim.property === 'heritage' && n.text === 'yes') return 'Registered; level unspecified (heritage=yes)'
  if (n.kind === 'text' || n.kind === 'date') return n.text
  return claim.value
}
