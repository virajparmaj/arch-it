import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'

export const CLAIM_PROPERTIES = [
  'name', 'architect', 'architect:wikidata', 'start_date', 'building:architecture',
  'building', 'building:use', 'height', 'building:levels', 'website', 'contact:website',
  'engineer', 'engineer:wikidata', 'wikidata', 'heritage', 'addr:full',
  'addr:housenumber', 'addr:street', 'addr:unit', 'addr:postcode', 'addr:city', 'addr:state', 'addr:country',
] as const
export type ClaimProperty = typeof CLAIM_PROPERTIES[number]
export type NormalizedClaim =
  | { kind: 'text'; text: string }
  | { kind: 'list' | 'identifiers'; values: string[] }
  | { kind: 'date'; text: string; precision: 'year' | 'month' | 'day' }
  | { kind: 'quantity'; value: number; unit: 'm' | 'levels' }
  | { kind: 'url'; url: string }
export interface BuildingClaim {
  property: ClaimProperty
  /** Unchanged OSM tag string, including whitespace and list delimiters. */
  value: string
  source_id: string
  source_record_id: string
  raw_property: string
  normalized: NormalizedClaim | null
  status: 'normalized' | 'raw_only' | 'invalid'
  note: string | null
}

export interface BuildingProperties {
  building_id: string
  name: string | null
  centroid: [number, number]
  source_id: string
  source_record_id: string
  source_url: string
  geometry_source: { source_id: string; source_record_id: string }
  claims: BuildingClaim[]
}

export type BuildingFeature = Feature<Polygon | MultiPolygon, BuildingProperties> & { id: string }

export interface BuildingMetadata {
  schema_version: 2
  dataset_id: 'chicago-loop'
  label: string
  bbox: [number, number, number, number]
  selection_rule: string
  centroid_method: string
  source: {
    id: string
    name: string
    url: string
    license: string
    license_url: string
    retrieved_at: string
    snapshot_at: string
    raw_sha256: string
    raw_url: string
    acquisition_url: string
  }
  counts: { source_records: number; imported: number; named: number; excluded: number }
  exclusion_reasons: Record<string, number>
  excluded_records: { source_record_id: string; reason: string }[]
  tag_coverage: Record<ClaimProperty, { present: number; normalized: number; raw_only: number; invalid: number }>
  claim_diagnostics: BuildingClaim[]
}

export interface BuildingDataset extends FeatureCollection<Polygon | MultiPolygon, BuildingProperties> {
  features: BuildingFeature[]
  metadata: BuildingMetadata
}

export type BuildingLoadState =
  | { status: 'loading'; data: null }
  | { status: 'ready'; data: BuildingDataset }
  | { status: 'error'; data: null }

export type BuildingMiss = 'outside' | 'empty' | 'zoom'
