import { readFileSync } from 'node:fs'
import type { Map as LibreMap, MapMouseEvent } from 'maplibre-gl'
import { describe, expect, it, vi } from 'vitest'
import { parseBuildingDataset } from './data'
import { BUILDING_FILL, mountBuildingLayers, setBuildingSelection } from './layers'

const dataset = parseBuildingDataset(JSON.parse(readFileSync('apps/web/public/data/chicago-loop/buildings.geojson', 'utf8')))

function setup() {
  const handlers = new Map<string, (event: MapMouseEvent) => void>()
  const sourceIds = new Set<string>()
  const layerIds = new Set<string>()
  const canvas = document.createElement('canvas')
  const renderer = {
    addSource: vi.fn((id: string) => sourceIds.add(id)),
    addLayer: vi.fn((layer: { id: string }) => layerIds.add(layer.id)),
    getStyle: () => ({ layers: [{ id: 'place-label', type: 'symbol' }] }),
    getLayer: (id: string) => layerIds.has(id),
    getSource: (id: string) => sourceIds.has(id),
    removeLayer: vi.fn((id: string) => layerIds.delete(id)),
    removeSource: vi.fn((id: string) => sourceIds.delete(id)),
    setFilter: vi.fn(),
    getCanvas: () => canvas,
    getZoom: vi.fn(() => 15.5),
    queryRenderedFeatures: vi.fn(() => [] as { id: number; properties: { building_id: string } }[]),
    on: vi.fn((name: string, layerOrHandler: string | ((event: MapMouseEvent) => void), handler?: (event: MapMouseEvent) => void) => handlers.set(name, typeof layerOrHandler === 'function' ? layerOrHandler : handler!)),
    off: vi.fn((name: string) => handlers.delete(name)),
  }
  const select = vi.fn()
  const miss = vi.fn()
  const map = renderer as unknown as LibreMap
  const dispose = mountBuildingLayers(map, dataset, select, miss)
  const click = (lng = -87.629, lat = 41.886) => handlers.get('click')!({ lngLat: { lng, lat }, point: { x: 100, y: 100 } } as MapMouseEvent)
  return { renderer, map, select, miss, dispose, click, handlers }
}

describe('building selection layer', () => {
  it('retains canonical IDs in properties and promotes them through vector tiling', () => {
    const { renderer, click, select, map } = setup()
    const building = dataset.features[0]
    expect(renderer.addSource).toHaveBeenCalledWith('archit-buildings', expect.objectContaining({ promoteId: 'building_id' }))
    // Vector serialization can coerce feature.id to a number; picking must use the preserved property.
    renderer.queryRenderedFeatures.mockReturnValue([{ id: 5, properties: { building_id: building.id } }])
    click()
    expect(select).toHaveBeenCalledWith(building)
    expect(renderer.queryRenderedFeatures).toHaveBeenCalledWith(expect.anything(), { layers: [BUILDING_FILL] })
    setBuildingSelection(map, building.id)
    expect(renderer.setFilter).toHaveBeenCalledWith('archit-building-selected', ['==', ['get', 'building_id'], building.id])
  })

  it('switches between different rendered feature hits', () => {
    const { renderer, click, select } = setup()
    for (const feature of dataset.features.slice(0, 3)) {
      renderer.queryRenderedFeatures.mockReturnValue([{ id: 0, properties: { building_id: feature.id } }])
      click()
      expect(select).toHaveBeenLastCalledWith(feature)
    }
  })

  it('reports outside coverage, zoomed-out, and empty clicks without inventing buildings', () => {
    const { renderer, click, select, miss } = setup()
    click(-0.1276, 51.5072)
    expect(miss).toHaveBeenLastCalledWith('outside')
    renderer.getZoom.mockReturnValue(10)
    click()
    expect(miss).toHaveBeenLastCalledWith('zoom')
    renderer.getZoom.mockReturnValue(16)
    click()
    expect(miss).toHaveBeenLastCalledWith('empty')
    expect(select).not.toHaveBeenCalled()
  })

  it('removes handlers and layers when data is replaced', () => {
    const { renderer, dispose, handlers } = setup()
    dispose()
    expect(handlers.size).toBe(0)
    expect(renderer.removeLayer).toHaveBeenCalledTimes(4)
    expect(renderer.removeSource).toHaveBeenCalledTimes(2)
  })

  it('does not call destroyed style methods after the map is removed', () => {
    const { renderer, dispose, handlers } = setup()
    handlers.get('remove')!({} as MapMouseEvent)
    dispose()
    expect(renderer.removeLayer).not.toHaveBeenCalled()
    expect(renderer.removeSource).not.toHaveBeenCalled()
  })
})
