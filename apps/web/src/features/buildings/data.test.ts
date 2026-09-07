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
    expect(unnamed.properties.claims).toEqual([])
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

  it('distinguishes the pilot boundary from worldwide basemap coverage', () => {
    expect(isInPilot(-87.629, 41.886)).toBe(true)
    expect(isInPilot(-0.1276, 51.5072)).toBe(false)
    expect(isInPilot(-87.635, 41.886)).toBe(false)
  })
})
