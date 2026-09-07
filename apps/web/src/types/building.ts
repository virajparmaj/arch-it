import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'

export interface BuildingProperties {
  building_id: string
  name: string | null
  centroid: [number, number]
  source_id: string
  source_record_id: string
  source_url: string
  geometry_source: { source_id: string; source_record_id: string }
  claims: { property: 'name'; value: string; source_id: string; source_record_id: string; raw_property: string }[]
}

export type BuildingFeature = Feature<Polygon | MultiPolygon, BuildingProperties> & { id: string }

export interface BuildingMetadata {
  schema_version: 1
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
