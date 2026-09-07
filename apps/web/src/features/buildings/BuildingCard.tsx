import { useEffect, useRef } from 'react'
import { ArrowLeft, ExternalLink, MapPin, Download } from 'lucide-react'
import type { BuildingFeature, BuildingMetadata } from '../../types/building'
import { BUILDINGS_URL } from './data'

interface BuildingCardProps {
  building: BuildingFeature
  metadata: BuildingMetadata
  onClose: () => void
}

export function BuildingCard({ building, metadata, onClose }: BuildingCardProps) {
  const title = useRef<HTMLHeadingElement>(null)
  const p = building.properties
  const polygons = building.geometry.type === 'Polygon' ? [building.geometry.coordinates] : building.geometry.coordinates
  const ringCount = polygons.reduce((count, rings) => count + rings.length, 0)
  const retrieved = new Date(metadata.source.retrieved_at).toISOString().slice(0, 10)

  useEffect(() => { title.current?.focus({ preventScroll: true }) }, [building.id])

  return (
    <section className="building-card" aria-labelledby="building-title">
      <button className="back-button" onClick={onClose}><ArrowLeft size={16} aria-hidden="true" /> Back to exploring</button>
      <div className="section-label"><span className="live-dot" /> SELECTED BUILDING</div>
      <h2 id="building-title" ref={title} tabIndex={-1}>{p.name ?? 'Unnamed building'}</h2>
      <p className="building-location"><MapPin size={14} aria-hidden="true" /> Chicago Loop pilot</p>
      {!p.name && <p className="missing-name">No building name is recorded in this snapshot.</p>}
      <dl className="building-facts">
        <div><dt>Footprint</dt><dd>{building.geometry.type} · {polygons.length} {polygons.length === 1 ? 'part' : 'parts'}{ringCount > polygons.length ? ` · ${ringCount - polygons.length} courtyard ring(s)` : ''}</dd></div>
        <div><dt>Centroid <span>(latitude, longitude)</span></dt><dd className="coordinates">{p.centroid[1].toFixed(6)}, {p.centroid[0].toFixed(6)}</dd></div>
        <div><dt>Source identifier</dt><dd><a href={p.source_url} target="_blank" rel="noreferrer">{p.source_record_id}<ExternalLink size={13} aria-hidden="true" /></a></dd></div>
        <div><dt>Internal building ID</dt><dd className="building-id">{p.building_id}</dd></div>
      </dl>
      <details className="building-source" open>
        <summary>Source & provenance</summary>
        <p>Footprint{p.name ? ' and name' : ''} from <a href={p.source_url} target="_blank" rel="noreferrer">OpenStreetMap</a>. Retrieved {retrieved} (UTC).</p>
        <p>Snapshot: <time dateTime={metadata.source.snapshot_at}>{metadata.source.snapshot_at.replace('T', ' ').replace('Z', ' UTC')}</time></p>
        <p>Approximate centroid calculated from the footprint. Boundary-crossing and invalid outlines are excluded from this pilot.</p>
        <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer">ODbL 1.0 license <ExternalLink size={12} aria-hidden="true" /></a>
      </details>
      <a className="dataset-download" href={BUILDINGS_URL} download="chicago-loop-buildings.geojson"><Download size={15} aria-hidden="true" /> Download pilot GeoJSON</a>
      <p className="building-next">Architects and building stories will follow in later phases.</p>
    </section>
  )
}
