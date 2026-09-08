import { useEffect, useId, useRef } from 'react'
import { ChevronLeft, ChevronRight, Download, ExternalLink, MapPin, X } from 'lucide-react'
import type { BuildingClaim, BuildingFeature, BuildingMetadata } from '../../types/building'
import { BUILDINGS_URL } from './data'
import { CLAIM_LABELS, claimText, safeWebsite } from './claims'
import { formatCoordinate } from '../map/config'

interface BuildingPanelProps {
  building: BuildingFeature
  buildings: BuildingFeature[]
  metadata: BuildingMetadata
  focusRequest: number
  onSelect: (building: BuildingFeature) => void
  onClose: () => void
}

interface BuildingFact {
  label: string
  value: string
}

function buildingLabel(building: BuildingFeature): string {
  return building.properties.name?.trim() || 'Unnamed building'
}

function BuildingFacts({ facts }: { facts: BuildingFact[] }) {
  return <dl className="building-facts">{facts.map(({ label, value }) => (
    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
  ))}</dl>
}

function ClaimValue({ claim }: { claim: BuildingClaim }) {
  const n = claim.normalized
  const text = claimText(claim)
  if (n?.kind === 'url' && safeWebsite(n.url)) return <a href={n.url} target="_blank" rel="noopener noreferrer">{text}<span className="sr-only"> (opens in a new tab)</span></a>
  return <>{text}</>
}

function ArchitectureClaims({ claims, sourceUrl }: { claims: BuildingClaim[]; sourceUrl: string }) {
  return <dl className="building-facts architecture-claims">{claims.map((claim) => <div key={claim.property}>
    <dt>{CLAIM_LABELS[claim.property]}</dt>
    <dd><ClaimValue claim={claim} />
      {claim.normalized?.kind === 'date' && <span className="claim-note">{claim.normalized.precision} precision</span>}
      {claim.note && <span className="claim-note">{claim.note}</span>}
      <a className="claim-source" href={sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`OpenStreetMap source for ${CLAIM_LABELS[claim.property]} (opens in a new tab)`}>OSM source <ExternalLink size={12} aria-hidden="true" /></a>
    </dd>
  </div>)}</dl>
}

export function BuildingPanel({ building, buildings, metadata, focusRequest, onSelect, onClose }: BuildingPanelProps) {
  const headingId = useId()
  const title = useRef<HTMLHeadingElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const p = building.properties
  const name = buildingLabel(building)
  const index = buildings.findIndex((item) => item.id === building.id)
  const polygons = building.geometry.type === 'Polygon' ? [building.geometry.coordinates] : building.geometry.coordinates
  const holes = polygons.reduce((count, rings) => count + rings.length - 1, 0)
  const retrieved = new Date(metadata.source.retrieved_at).toISOString().slice(0, 10)
  const attributes = p.claims.filter((claim) => claim.property !== 'name')
  const missingArchitecture = [
    { property: 'architect', label: 'architect' }, { property: 'start_date', label: 'start date' },
    { property: 'building:architecture', label: 'style' },
  ].filter(({ property }) => !p.claims.some((claim) => claim.property === property && claim.value.trim()))
  const facts: BuildingFact[] = [
    { label: 'Footprint', value: `${polygons.length === 1 ? 'One mapped outline' : `${polygons.length} mapped parts`}${holes ? ` · ${holes} ${holes === 1 ? 'interior hole' : 'interior holes'}` : ''}` },
    { label: 'Approximate center', value: `${formatCoordinate(p.centroid[1], 'latitude')}, ${formatCoordinate(p.centroid[0], 'longitude')}` },
  ]

  // Opening or picking on the map announces the new surface. Navigation inside
  // the panel retains the user's control, so repeated keyboard switching works.
  useEffect(() => { title.current?.focus({ preventScroll: true }) }, [focusRequest])
  useEffect(() => { if (content.current) content.current.scrollTop = 0 }, [building.id, focusRequest])

  return (
    <section className="building-panel" aria-labelledby={headingId}>
      <header className="building-panel-header">
        <span className="section-label"><span className="live-dot" /> BUILDING DETAILS</span>
        <button className="panel-close" onClick={onClose} aria-label="Close building details" title="Close building details (Escape)"><X size={19} aria-hidden="true" /></button>
      </header>
      <div className="building-navigation">
        <label className="sr-only" htmlFor={`${headingId}-picker`}>Choose a pilot building</label>
        <select id={`${headingId}-picker`} value={building.id} onChange={(event) => {
          const next = buildings.find((item) => item.id === event.target.value)
          if (next) onSelect(next)
        }}>
          {buildings.map((item, i) => <option key={item.id} value={item.id}>{i + 1}. {buildingLabel(item)}{!item.properties.name ? ` · ${item.properties.centroid[1].toFixed(4)}, ${item.properties.centroid[0].toFixed(4)}` : ''}</option>)}
        </select>
        <button aria-label="Previous building" disabled={index <= 0} onClick={() => onSelect(buildings[index - 1])}><ChevronLeft size={18} aria-hidden="true" /></button>
        <button aria-label="Next building" disabled={index >= buildings.length - 1} onClick={() => onSelect(buildings[index + 1])}><ChevronRight size={18} aria-hidden="true" /></button>
      </div>
      <p className="sr-only" role="status">{name}. Building {index + 1} of {buildings.length}.</p>
      <div className="building-panel-content" ref={content}>
        <h2 id={headingId} ref={title} tabIndex={-1}>{name}</h2>
        <p className="building-location"><MapPin size={15} aria-hidden="true" /> Chicago · Loop pilot</p>
        {!p.name?.trim() && <p className="missing-name">No name is recorded for this building in the pilot snapshot.</p>}
        <BuildingFacts facts={facts} />
        <p className="building-note">The center is calculated from the footprint; it is not an entrance or a street address.</p>
        <section className="building-architecture" aria-label="Recorded building attributes">
          <h3>Recorded attributes</h3>
          <p className="building-note">OSM contributor claims from this snapshot. Architect names are unresolved text; a start date can describe opening or completion. Building type does not establish current use.</p>
          <ArchitectureClaims claims={attributes} sourceUrl={p.source_url} />
          {missingArchitecture.length > 0 && <div className="building-unavailable"><p>No {missingArchitecture.map(({ label }) => label).join(', ')} recorded in this snapshot. Missing tags do not establish that the information is unknown elsewhere.</p></div>}
          <p className="building-note">Pilot coverage: {metadata.tag_coverage.architect.present} of {metadata.counts.imported} buildings have architect text; {metadata.tag_coverage.start_date.present} have a start date.</p>
        </section>

        <section className="building-source" aria-label="Building sources">
          <h3>Source</h3>
          <a className="source-reference" href={p.source_url} target="_blank" rel="noopener noreferrer">View this building on OpenStreetMap <ExternalLink size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
          <p>Mapped outline and recorded attributes from OpenStreetMap contributors. Retrieved <time dateTime={metadata.source.retrieved_at}>{retrieved}</time> (UTC).</p>
          <p>Data licensed under <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noopener noreferrer">ODbL 1.0<span className="sr-only"> (opens in a new tab)</span></a>.</p>
        </section>

        <details className="building-details" key={building.id}>
          <summary>Source & technical details</summary>
          <BuildingFacts facts={[
            { label: 'Internal building ID', value: p.building_id },
            { label: 'Source record', value: p.source_record_id },
            { label: 'Source dataset', value: p.source_id },
            { label: 'Geometry', value: building.geometry.type },
            { label: 'Center (latitude, longitude)', value: `${p.centroid[1].toFixed(6)}, ${p.centroid[0].toFixed(6)}` },
            { label: 'Source snapshot (UTC)', value: new Date(metadata.source.snapshot_at).toISOString() },
          ]} />
          {p.claims.length > 0 && <><h3>Raw source claims</h3><p>Original values are kept unchanged. Identifiers are OSM assertions; they do not resolve people, firms, or matching buildings.</p>{p.claims.map((claim) => <dl className="raw-claim" key={claim.property}><dt>{claim.raw_property}</dt><dd>{claim.value || '(empty string)'}</dd><dt>Source record</dt><dd><a href={p.source_url} target="_blank" rel="noopener noreferrer">{claim.source_record_id}<span className="sr-only"> (opens in a new tab)</span></a></dd><dt>Handling</dt><dd>{claim.status}{claim.note ? ` · ${claim.note}` : ''}</dd></dl>)}</>}
          <p>Approximate area-weighted center in longitude/latitude coordinates. Interior holes describe geometry, not a confirmed courtyard use. This bounded pilot excludes boundary-crossing or invalid outlines.</p>
          <a className="dataset-download" href={BUILDINGS_URL} download="chicago-loop-buildings.geojson"><Download size={15} aria-hidden="true" /> Download pilot GeoJSON</a>
          <a className="dataset-download" href="/data/chicago-loop/source.json" download="chicago-loop-source.json"><Download size={15} aria-hidden="true" /> Download original OSM snapshot</a>
          <p className="source-checksum">Original snapshot SHA-256: <code>{metadata.source.raw_sha256}</code></p>
        </details>
      </div>
    </section>
  )
}
