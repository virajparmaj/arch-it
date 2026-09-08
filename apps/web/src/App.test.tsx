import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { parseBuildingDataset } from './features/buildings/data'
import type { BuildingClaim, BuildingFeature } from './types/building'

const dataset = parseBuildingDataset(JSON.parse(readFileSync('apps/web/public/data/chicago-loop/buildings.geojson', 'utf8')))
const map = vi.hoisted(() => ({ props: {} as { selectedBuildingId?: string; buildingDestination?: { building: BuildingFeature }; onBuildingSelect: (item: BuildingFeature) => void; onBuildingMiss: (reason: string) => void } }))
vi.mock('./features/map/MapCanvas', () => ({ default: (props: typeof map.props) => {
  map.props = props
  return <canvas tabIndex={0} aria-label="Test map" />
} }))

let host: HTMLDivElement
let root: Root
function button(label: string) {
  return [...host.querySelectorAll('button')].find((element) => element.getAttribute('aria-label') === label || element.textContent === label)!
}
function panel() { return host.querySelector('.building-panel')! }
function title() { return panel().querySelector('h2')! }
function select(item: BuildingFeature) { act(() => map.props.onBuildingSelect(item)) }
function choose(index: number) {
  const picker = host.querySelector('select')!
  picker.focus()
  act(() => { picker.value = dataset.features[index].id; picker.dispatchEvent(new Event('change', { bubbles: true })) })
}

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => dataset }))
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
})
afterEach(() => {
  act(() => root.unmount())
  host.remove()
  vi.unstubAllGlobals()
})

describe('building panel selection and focus', () => {
  it('opens a real named building, keeps identifiers in details, and restores map focus on close', () => {
    const named = dataset.features[0]
    select(named)
    expect(title().textContent).toBe(named.properties.name)
    expect(document.activeElement).toBe(title())
    expect(panel().querySelector('.source-reference')?.getAttribute('href')).toBe(named.properties.source_url)
    expect(panel().querySelector('details')?.open).toBe(false)
    expect(panel().querySelector('details')?.textContent).toContain(named.id)
    expect(panel().querySelector('.building-facts')?.textContent).not.toContain(named.id)
    act(() => button('Close building details').click())
    expect(host.querySelector('.building-panel')).toBeNull()
    expect(map.props.selectedBuildingId).toBe(named.id)
    expect(document.activeElement?.tagName).toBe('CANVAS')
    act(() => button('Reopen building details').click())
    expect(title().textContent).toBe(named.properties.name)
  })

  it('switches to a real unnamed building without stale facts, source links, or expanded details', () => {
    select(dataset.features[0])
    panel().querySelector('details')!.open = true
    choose(2)
    expect(title().textContent).toBe('Unnamed building')
    expect(panel().querySelector('.building-panel-content')?.textContent).not.toContain(dataset.features[0].properties.name)
    expect(panel().textContent).toContain('No name is recorded')
    expect(panel().textContent).toContain('No architect, start date, style recorded in this snapshot')
    expect(panel().querySelector('.source-reference')?.getAttribute('href')).toBe(dataset.features[2].properties.source_url)
    expect(panel().querySelector('details')?.open).toBe(false)
    expect(document.activeElement?.tagName).toBe('SELECT')
    expect(map.props.buildingDestination?.building.id).toBe(dataset.features[2].id)
    const next = button('Next building')
    next.focus()
    act(() => next.click())
    expect(map.props.selectedBuildingId).toBe(dataset.features[3].id)
    expect(document.activeElement).toBe(next)
  })

  it('supports keyboard entry, Escape, reopen, and clearing on map miss or city navigation', () => {
    const browse = button('Browse pilot buildings')
    browse.focus()
    act(() => browse.click())
    expect(document.activeElement).toBe(title())
    const id = map.props.selectedBuildingId
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(host.querySelector('.building-panel')).toBeNull()
    expect(map.props.selectedBuildingId).toBe(id)
    expect(document.activeElement).toBe(browse)
    act(() => browse.click())
    act(() => map.props.onBuildingMiss('empty'))
    expect(map.props.selectedBuildingId).toBeNull()
    expect(host.textContent).toContain('No imported footprint here')
    select(dataset.features[0])
    act(() => button('Close building details').click())
    act(() => host.querySelectorAll<HTMLButtonElement>('.city-button')[1].click())
    expect(map.props.selectedBuildingId).toBeNull()
    expect(map.props.buildingDestination).toBeNull()
  })

  it('renders the longest actual pilot name and relation geometry without treating holes as courtyards', () => {
    const longest = dataset.features.reduce((a, b) => (a.properties.name?.length ?? 0) > (b.properties.name?.length ?? 0) ? a : b)
    select(longest)
    expect(title().textContent).toBe('George W. Dunne Cook County Administration Building')
    const relation = dataset.features.find((item) => item.properties.source_record_id.startsWith('osm:relation/'))!
    select(relation)
    expect(panel().querySelector('.building-facts')?.textContent).toContain('1 interior hole')
    expect(panel().querySelector('.source-reference')?.getAttribute('href')).toBe('https://www.openstreetmap.org/relation/15899437')
    expect(panel().querySelector('.source-reference')?.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('recenters a previously visited building and makes an explicitly refocused heading visible', () => {
    select(dataset.features[0])
    choose(2)
    const firstDestination = map.props.buildingDestination
    select(dataset.features[1])
    choose(2)
    expect(map.props.buildingDestination).not.toBe(firstDestination)
    expect(map.props.buildingDestination?.building.id).toBe(dataset.features[2].id)
    const content = panel().querySelector('.building-panel-content')!
    content.scrollTop = 400
    act(() => button('Focus building details').click())
    expect(content.scrollTop).toBe(0)
    expect(document.activeElement).toBe(title())
    act(() => button('Close building details').click())
    expect(document.activeElement).toBe(button('Reopen building details'))
  })

  it('shows real architecture claims and raw provenance, then switches to a truly sparse record', () => {
    const rich = dataset.features.find((item) => item.properties.source_record_id === 'osm:way/126982631')!
    select(rich)
    const attributes = panel().querySelector('.architecture-claims')!
    expect(attributes.textContent).toContain('Holabird & Roche; Schmidt, Garden & Martin')
    expect(attributes.textContent).toContain('1899year precision')
    expect(attributes.textContent).toContain('86 m')
    expect([...attributes.querySelectorAll('.claim-source')].every((link) => link.getAttribute('href') === rich.properties.source_url)).toBe(true)
    expect(panel().querySelector('details')?.textContent).toContain('Holabird & Roche;Schmidt, Garden & Martin')
    expect(panel().querySelector('details')?.textContent).toContain('tags.architect')
    const sparse = dataset.features.findIndex((item) => item.properties.source_record_id === 'osm:way/234052883')
    choose(sparse)
    expect(panel().querySelector('.architecture-claims')?.textContent).toContain('Type unspecified (building=yes)')
    expect(panel().textContent).not.toContain('Holabird')
    expect(panel().textContent).not.toContain('86 m')
  })

  it('retains zero levels and full date precision, with safe website links and unresolved IDs', () => {
    select(dataset.features.find((item) => item.properties.source_record_id === 'osm:way/145208575')!)
    expect(panel().querySelector('.architecture-claims')?.textContent).toContain('Above-ground levels · excluding roof0')
    select(dataset.features.find((item) => item.properties.source_record_id === 'osm:way/124873919')!)
    expect(panel().querySelector('.architecture-claims')?.textContent).toContain('1921-10-26day precision')
    expect(panel().querySelector('.architecture-claims')?.textContent).toContain('Registered; level unspecified')
    const website = panel().querySelector('.architecture-claims a:not(.claim-source)')!
    expect(website.getAttribute('href')).toBe('https://www.thechicagotheatre.com')
    expect(website.getAttribute('rel')).toBe('noopener noreferrer')
    expect(panel().querySelector('.architecture-claims')?.textContent).toContain('Building identifier · unresolved')
    expect(panel().querySelector('a[href*="wikidata.org"]')).toBeNull()
  })

  it('renders synthetic uncertain and malformed claims as escaped non-links', () => {
    // These edge cases are fixtures only; none are added to the shipped pilot.
    const fixture = structuredClone(dataset.features.find((item) => item.properties.source_record_id === 'osm:way/234052883')!)
    const p = fixture.properties
    const rawClaims: [BuildingClaim['property'], string][] = [
      ['architect', '<img src=x onerror=alert(1)>;A;;B'], ['start_date', '1914..1918'],
      ['height', '12,5 m'], ['building:levels', '2.5'], ['website', 'javascript:alert(1)'],
    ]
    p.claims.push(...rawClaims.map(([property, value]): BuildingClaim => ({ property, value, raw_property: `tags.${property}`, source_id: p.source_id, source_record_id: p.source_record_id, normalized: null, status: 'raw_only', note: 'Source text retained; no value inferred.' })))
    select(fixture)
    const attributes = panel().querySelector('.architecture-claims')!
    for (const [, raw] of rawClaims) expect(attributes.textContent).toContain(raw)
    expect(attributes.querySelector('img')).toBeNull()
    expect(attributes.querySelector('a[href^="javascript:"]')).toBeNull()
    expect(attributes.querySelectorAll('a:not(.claim-source)')).toHaveLength(0)
    expect(attributes.textContent).toContain('no value inferred')
  })
})
