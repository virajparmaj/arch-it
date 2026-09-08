import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { isInPilot, parseBuildingDataset } from './data'

function snapshot() {
  return JSON.parse(readFileSync('apps/web/public/data/chicago-loop/buildings.geojson', 'utf8'))
}

describe('published building data contract', () => {
  it('accepts the actual pilot and preserves unknown names and source references', () => {
    const dataset = parseBuildingDataset(snapshot())
    expect(dataset.features).toHaveLength(345)
    const unnamed = dataset.features.find((feature) => feature.properties.name === null)!
    expect(unnamed.properties.claims.some((claim) => claim.property === 'name')).toBe(false)
    expect(dataset.features.some((feature) => feature.properties.source_record_id.startsWith('osm:relation/'))).toBe(true)
    expect(dataset.metadata.source.license).toBe('ODbL-1.0')
  })

  it('rejects duplicate canonical IDs', () => {
    const dataset = snapshot()
    dataset.features[1] = dataset.features[0]
    expect(() => parseBuildingDataset(dataset)).toThrow()
  })

  it('rejects unsourced displayed names and misleading source links', () => {
    const dataset = snapshot()
    dataset.features[0].properties.name = 'An invented name'
    expect(() => parseBuildingDataset(dataset)).toThrow()
    const changedLink = snapshot()
    changedLink.features[0].properties.source_url = 'javascript:alert(1)'
    expect(() => parseBuildingDataset(changedLink)).toThrow()
  })

  it('rejects malformed rings and truncated snapshots', () => {
    const dataset = snapshot()
    dataset.features[0].geometry.coordinates[0].pop()
    expect(() => parseBuildingDataset(dataset)).toThrow()
    const truncated = snapshot()
    truncated.features.pop()
    expect(() => parseBuildingDataset(truncated)).toThrow()
  })

  it('validates raw claim labels and the checksum displayed by the panel', () => {
    const badClaim = snapshot()
    badClaim.features[0].properties.claims[0].raw_property = { invalid: true }
    expect(() => parseBuildingDataset(badClaim)).toThrow()
    const badChecksum = snapshot()
    badChecksum.metadata.source.raw_sha256 = 'not a checksum'
    expect(() => parseBuildingDataset(badChecksum)).toThrow()
  })

  it('distinguishes the pilot boundary from worldwide basemap coverage', () => {
    expect(isInPilot(-87.629, 41.886)).toBe(true)
    expect(isInPilot(-0.1276, 51.5072)).toBe(false)
    expect(isInPilot(-87.635, 41.886)).toBe(false)
  })

  it('rejects duplicate claims, mismatched claim records, and fabricated normalized numbers', () => {
    for (const mutate of [
      (claims: Record<string, unknown>[]) => claims.push(claims[0]),
      (claims: Record<string, unknown>[]) => { claims[0].source_record_id = 'osm:way/1' },
      (claims: Record<string, unknown>[]) => { claims.find((claim) => claim.property === 'height')!.normalized = { kind: 'quantity', value: 999, unit: 'm' } },
    ]) {
      const dataset = snapshot()
      const feature = dataset.features.find((item: { properties: { claims: { property: string }[] } }) => item.properties.claims.some((claim) => claim.property === 'height'))
      mutate(feature.properties.claims)
      expect(() => parseBuildingDataset(dataset)).toThrow()
    }
  })

  it('rejects unsafe normalized URLs and inaccurate coverage statistics', () => {
    const unsafe = snapshot()
    const feature = unsafe.features.find((item: { properties: { claims: { property: string }[] } }) => item.properties.claims.some((claim) => claim.property === 'website'))
    const website = feature.properties.claims.find((claim: { property: string }) => claim.property === 'website')
    website.value = 'javascript:alert(1)'
    website.normalized = { kind: 'url', url: website.value }
    expect(() => parseBuildingDataset(unsafe)).toThrow()
    const coverage = snapshot()
    coverage.metadata.tag_coverage.architect.present = 345
    expect(() => parseBuildingDataset(coverage)).toThrow()
  })
})
