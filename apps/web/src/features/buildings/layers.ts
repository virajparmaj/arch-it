import type { Map, MapMouseEvent } from 'maplibre-gl'
import type { BuildingDataset, BuildingFeature, BuildingMiss } from '../../types/building'
import { BUILDING_MIN_ZOOM, isInPilot } from './data'

const SOURCE = 'archit-buildings'
const COVERAGE = 'archit-pilot-coverage'
export const BUILDING_FILL = 'archit-building-fill'
const OUTLINE = 'archit-building-outline'
export const SELECTED = 'archit-building-selected'
const BOUNDARY = 'archit-pilot-boundary'

export function setBuildingSelection(map: Map, id: string | null) {
  if (map.getLayer(SELECTED)) map.setFilter(SELECTED, ['==', ['get', 'building_id'], id ?? ''])
}

export function mountBuildingLayers(
  map: Map,
  dataset: BuildingDataset,
  onSelect: (building: BuildingFeature) => void,
  onMiss: (reason: BuildingMiss) => void,
): () => void {
  const lookup = new globalThis.Map(dataset.features.map((feature) => [feature.id, feature]))
  const [w, s, e, n] = dataset.metadata.bbox
  let removed = false
  map.addSource(SOURCE, {
    type: 'geojson',
    promoteId: 'building_id',
    // Full records stay in application state; the renderer needs geometry and identity only.
    data: { type: 'FeatureCollection', features: dataset.features.map((feature) => ({ type: 'Feature', id: feature.id, geometry: feature.geometry, properties: { building_id: feature.id } })) },
    attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a> · <a href="/data/chicago-loop/buildings.geojson" target="_blank">Pilot data (ODbL)</a>',
  })
  map.addSource(COVERAGE, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]] } } })
  const beforeId = map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id
  map.addLayer({ id: BUILDING_FILL, source: SOURCE, type: 'fill', minzoom: BUILDING_MIN_ZOOM, paint: { 'fill-color': '#c26848', 'fill-opacity': 0.30 } }, beforeId)
  map.addLayer({ id: OUTLINE, source: SOURCE, type: 'line', minzoom: BUILDING_MIN_ZOOM, paint: { 'line-color': '#ae5c40', 'line-width': 1, 'line-opacity': 0.7 } }, beforeId)
  map.addLayer({ id: SELECTED, source: SOURCE, type: 'fill', minzoom: BUILDING_MIN_ZOOM, filter: ['==', ['get', 'building_id'], ''], paint: { 'fill-color': '#d64722', 'fill-opacity': 0.75, 'fill-outline-color': '#732b15' } }, beforeId)
  map.addLayer({ id: BOUNDARY, source: COVERAGE, type: 'line', paint: { 'line-color': '#a4472f', 'line-width': 1.5, 'line-dasharray': [4, 3] } }, beforeId)

  function click(event: MapMouseEvent) {
    const longitude = ((event.lngLat.lng + 180) % 360 + 360) % 360 - 180
    if (!isInPilot(longitude, event.lngLat.lat)) { onMiss('outside'); return }
    if (map.getZoom() < BUILDING_MIN_ZOOM) { onMiss('zoom'); return }
    // Query our layer only: basemap feature IDs and names are not canonical identities.
    const hits = map.queryRenderedFeatures(event.point, { layers: [BUILDING_FILL] })
    const building = hits.map((hit) => lookup.get(String(hit.properties.building_id))).find(Boolean)
    if (building) onSelect(building)
    else onMiss('empty')
  }

  const enter = () => { map.getCanvas().style.cursor = 'pointer' }
  const leave = () => { map.getCanvas().style.cursor = '' }
  const remove = () => { removed = true }
  map.on('click', click)
  map.on('mouseenter', BUILDING_FILL, enter)
  map.on('mouseleave', BUILDING_FILL, leave)
  map.on('remove', remove)

  return () => {
    map.off('click', click)
    map.off('mouseenter', BUILDING_FILL, enter)
    map.off('mouseleave', BUILDING_FILL, leave)
    map.off('remove', remove)
    if (removed) return
    leave()
    for (const layer of [SELECTED, OUTLINE, BUILDING_FILL, BOUNDARY]) if (map.getLayer(layer)) map.removeLayer(layer)
    for (const source of [SOURCE, COVERAGE]) if (map.getSource(source)) map.removeSource(source)
  }
}
