import type { BuildingDataset } from '../../types/building'

export const BUILDINGS_URL = '/data/chicago-loop/buildings.geojson'
export const PILOT_BBOX: [number, number, number, number] = [-87.634, 41.882, -87.624, 41.890]
export const BUILDING_MIN_ZOOM = 14

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function point(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && value.every(Number.isFinite)
    && Math.abs(value[0]) <= 180 && Math.abs(value[1]) <= 90
}

function polygon(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every((ring) =>
    Array.isArray(ring) && ring.length >= 4 && ring.every(point)
    && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1])
}

function validFeature(value: unknown, sourceId: string): boolean {
  if (!record(value) || value.type !== 'Feature' || !record(value.properties) || !record(value.geometry)) return false
  const p = value.properties
  const geometry = value.geometry
  const external = typeof p.source_record_id === 'string' && /^osm:(way|relation)\/\d+$/.test(p.source_record_id)
  if (typeof value.id !== 'string' || value.id !== p.building_id || !external || p.source_id !== sourceId) return false
  if (p.name !== null && typeof p.name !== 'string') return false
  if (p.source_url !== `https://www.openstreetmap.org/${(p.source_record_id as string).slice(4)}`) return false
  if (!point(p.centroid) || !record(p.geometry_source) || p.geometry_source.source_id !== sourceId || p.geometry_source.source_record_id !== p.source_record_id) return false
  if (!Array.isArray(p.claims) || !p.claims.every((claim) => record(claim) && claim.property === 'name' && typeof claim.value === 'string' && claim.source_id === sourceId && claim.source_record_id === p.source_record_id)) return false
  if (p.name !== null && !p.claims.some((claim) => claim.value.trim() === p.name)) return false
  return geometry.type === 'Polygon' ? polygon(geometry.coordinates)
    : geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates) && geometry.coordinates.length > 0 && geometry.coordinates.every(polygon)
}

export function parseBuildingDataset(value: unknown): BuildingDataset {
  const fail = () => { throw new Error('The building snapshot is invalid or incomplete.') }
  if (!record(value) || value.type !== 'FeatureCollection' || !record(value.metadata) || !Array.isArray(value.features)) return fail()
  const metadata = value.metadata
  if (metadata.schema_version !== 1 || metadata.dataset_id !== 'chicago-loop' || !record(metadata.source) || !record(metadata.counts)) return fail()
  if (JSON.stringify(metadata.bbox) !== JSON.stringify(PILOT_BBOX)) return fail()
  const source = metadata.source
  if (typeof source.id !== 'string' || source.name !== 'OpenStreetMap' || source.license !== 'ODbL-1.0') return fail()
  if (typeof source.retrieved_at !== 'string' || !Number.isFinite(Date.parse(source.retrieved_at)) || typeof source.snapshot_at !== 'string' || !Number.isFinite(Date.parse(source.snapshot_at))) return fail()
  if (value.features.length < 1 || value.features.length > 2000 || metadata.counts.imported !== value.features.length) return fail()
  if (!value.features.every((feature) => validFeature(feature, source.id as string))) return fail()
  if (new Set(value.features.map((feature) => feature.id)).size !== value.features.length) return fail()
  return value as unknown as BuildingDataset
}

export function isInPilot(longitude: number, latitude: number): boolean {
  const [west, south, east, north] = PILOT_BBOX
  return longitude >= west && longitude <= east && latitude >= south && latitude <= north
}
