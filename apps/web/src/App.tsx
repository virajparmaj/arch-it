import { lazy, Suspense, useCallback, useState } from 'react'
import { ArrowDown, ArrowUpRight, Compass, Globe2, MapPin } from 'lucide-react'
import { CITIES, INITIAL_CITY, formatCoordinate } from './features/map/config'
import type { City, MapView } from './types/map'
import type { BuildingFeature, BuildingMiss } from './types/building'
import { useBuildings } from './features/buildings/useBuildings'
import { BuildingCard } from './features/buildings/BuildingCard'
import { isInPilot } from './features/buildings/data'

const MapCanvas = lazy(() => import('./features/map/MapCanvas'))

export default function App() {
  const [destination, setDestination] = useState({ city: INITIAL_CITY, request: 0 })
  const [activeCity, setActiveCity] = useState<string | null>(INITIAL_CITY.id)
  const [view, setView] = useState<MapView>({ longitude: INITIAL_CITY.center[0], latitude: INITIAL_CITY.center[1], zoom: INITIAL_CITY.zoom })
  const onExplore = useCallback(() => setActiveCity(null), [])
  const buildings = useBuildings()
  const [selected, setSelected] = useState<BuildingFeature | null>(null)
  const [miss, setMiss] = useState<BuildingMiss | null>(null)
  const onBuildingSelect = useCallback((building: BuildingFeature) => { setSelected(building); setMiss(null) }, [])
  const onBuildingMiss = useCallback((reason: BuildingMiss) => { setSelected(null); setMiss(reason) }, [])
  const inPilot = isInPilot(view.longitude, view.latitude)
  const onViewChange = useCallback((next: MapView) => { setView(next); setMiss(null) }, [])
  let pilotSummary = 'Building snapshot unavailable'
  if (buildings.data) pilotSummary = `${buildings.data.features.length} building footprints`
  else if (buildings.status === 'loading') pilotSummary = 'Loading building footprints…'
  let selectionInstruction = 'Select a highlighted building to inspect its footprint.'
  if (miss === 'outside' || !inPilot) selectionInstruction = 'Building selection is available in the Chicago Loop pilot.'
  else if (miss === 'zoom' || view.zoom < 14) selectionInstruction = 'Zoom in to select individual building footprints.'
  else if (miss === 'empty') selectionInstruction = 'No imported footprint here. Select a highlighted building.'

  function retryBuildings() {
    setSelected(null)
    setMiss(null)
    buildings.retry()
  }

  function goToCity(city: City) {
    setDestination((previous) => ({ city, request: previous.request + 1 }))
    setActiveCity(city.id)
    setSelected(null)
    setMiss(null)
  }

  return (
    <div className={`atlas ${selected ? 'has-selection' : ''}`}>
      <a className="skip-link" href="#world-map">Skip to map</a>
      <aside className="sidebar" aria-label="Explore the atlas">
        <header className="brand">
          <img className="brand-mark" src="/favicon.svg" width="40" height="40" alt="" />
          <span className="brand-name">arch it<span className="brand-period">.</span></span>
          <span className="edition">ATLAS / 02</span>
        </header>

        {selected && buildings.data ? <BuildingCard building={selected} metadata={buildings.data.metadata} onClose={() => setSelected(null)} /> : <div className="sidebar-content">
          <div className="section-label"><span className="live-dot" /> THE BUILT WORLD, OPEN TO EXPLORE</div>
          <h1>Every building<br />starts somewhere.</h1>
          <p className="intro">Select a highlighted footprint to see its geometry, identity, and source.</p>
          <div className="city-heading"><h2>Choose a starting point</h2><ArrowDown size={16} aria-hidden="true" /></div>
          <nav className="city-list" aria-label="Jump to a city">
            {CITIES.map((city, index) => (
              <button key={city.id} className={`city-button ${activeCity === city.id ? 'is-active' : ''}`} aria-pressed={activeCity === city.id} onClick={() => goToCity(city)}>
                <span className="city-index">0{index + 1}</span>
                <span className="city-text"><span className="city-name">{city.name}</span><span className="city-country">{city.country}</span></span>
                <ArrowUpRight className="city-arrow" size={19} aria-hidden="true" />
              </button>
            ))}
          </nav>

          <div className="pilot-summary">
            <span className="pilot-swatch" aria-hidden="true" />
            <div><strong>Chicago Loop pilot</strong><p>{pilotSummary}</p><p className="pilot-note">The dashed outline marks the pilot. Other cities have a basemap only.</p></div>
          </div>
        </div>}


        <footer className="sidebar-footer">
          <span><Globe2 size={15} aria-hidden="true" /> Made with open map data</span>
          <details className="about"><summary>About this atlas</summary><p>Arch It is an architecture discovery project. Select imported footprints in the Chicago Loop pilot. Architecture metadata and worldwide building coverage are coming later.</p><p>Map data © OpenStreetMap contributors. You can explore without sharing your location.</p></details>
        </footer>
      </aside>

      <main id="world-map" className="map-panel" tabIndex={-1} aria-label="World map">
        <div className="map-heading"><Compass size={19} strokeWidth={1.6} aria-hidden="true" /><span>Explore</span><span className="heading-divider">/</span><span className="heading-secondary">Chicago pilot</span></div>
        <Suspense fallback={<div className="map-message" role="status"><span className="loading-dot" /><strong>Opening the atlas…</strong></div>}>
          <MapCanvas destination={destination} onViewChange={onViewChange} onExplore={onExplore}
            buildings={buildings.data} selectedBuildingId={selected?.id ?? null}
            onBuildingSelect={onBuildingSelect} onBuildingMiss={onBuildingMiss} />
        </Suspense>
        <div className="pilot-status" role="status">
          {buildings.status === 'loading' && <p>Loading Chicago building footprints…</p>}
          {buildings.status === 'error' && <><p>Building footprints couldn’t load. You can still explore the map.</p><button onClick={retryBuildings}>Retry footprints</button></>}
          {buildings.status === 'ready' && <>
            <p>{selectionInstruction}</p>
            {(!inPilot || miss === 'outside' || miss === 'zoom' || view.zoom < 14) && <button onClick={() => goToCity(INITIAL_CITY)}>Return to pilot</button>}
          </>}
        </div>
        <div className="map-readout" aria-label="Map center coordinates">
          <MapPin size={15} aria-hidden="true" />
          <span>{formatCoordinate(view.latitude, 'latitude')}</span><span className="readout-divider" />
          <span>{formatCoordinate(view.longitude, 'longitude')}</span>
        </div>

      </main>
    </div>
  )
}
