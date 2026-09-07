import { lazy, Suspense, useCallback, useState } from 'react'
import { ArrowDown, ArrowUpRight, Compass, Globe2, Layers3, MapPin } from 'lucide-react'
import { CITIES, INITIAL_CITY, formatCoordinate } from './features/map/config'
import type { City, MapView } from './types/map'

const MapCanvas = lazy(() => import('./features/map/MapCanvas'))

export default function App() {
  const [destination, setDestination] = useState({ city: INITIAL_CITY, request: 0 })
  const [activeCity, setActiveCity] = useState<string | null>(INITIAL_CITY.id)
  const [view, setView] = useState<MapView>({ longitude: INITIAL_CITY.center[0], latitude: INITIAL_CITY.center[1], zoom: INITIAL_CITY.zoom })
  const onExplore = useCallback(() => setActiveCity(null), [])

  function goToCity(city: City) {
    setDestination((previous) => ({ city, request: previous.request + 1 }))
    setActiveCity(city.id)
  }

  return (
    <div className="atlas">
      <a className="skip-link" href="#world-map">Skip to map</a>
      <aside className="sidebar" aria-label="Explore the atlas">
        <header className="brand">
          <img className="brand-mark" src="/favicon.svg" width="40" height="40" alt="" />
          <span className="brand-name">arch it<span className="brand-period">.</span></span>
          <span className="edition">ATLAS / 01</span>
        </header>

        <div className="sidebar-content">
          <div className="section-label"><span className="live-dot" /> THE BUILT WORLD, OPEN TO EXPLORE</div>
          <h1>Every place has<br />a story.</h1>
          <p className="intro">Start with a city. Follow a street.<br />See where the map takes you.</p>
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

          <div className="next-chapter">
            <Layers3 size={20} strokeWidth={1.5} aria-hidden="true" />
            <div><p className="chapter-title">A map is just the beginning.</p><p>Building stories and the people behind them are coming next.</p></div>
          </div>
        </div>

        <footer className="sidebar-footer">
          <span><Globe2 size={15} aria-hidden="true" /> Made with open map data</span>
          <details className="about"><summary>About this atlas</summary><p>Arch It is an architecture discovery project. This first edition lets you explore the map; building details aren’t available yet.</p><p>Map data © OpenStreetMap contributors. You can explore without sharing your location.</p></details>
        </footer>
      </aside>

      <main id="world-map" className="map-panel" tabIndex={-1} aria-label="World map">
        <div className="map-heading"><Compass size={19} strokeWidth={1.6} aria-hidden="true" /><span>Explore</span><span className="heading-divider">/</span><span className="heading-secondary">World atlas</span></div>
        <Suspense fallback={<div className="map-message" role="status"><span className="loading-dot" /><strong>Opening the atlas…</strong></div>}>
          <MapCanvas destination={destination} onViewChange={setView} onExplore={onExplore} />
        </Suspense>
        <div className="map-readout" aria-label="Map center coordinates">
          <MapPin size={15} aria-hidden="true" />
          <span>{formatCoordinate(view.latitude, 'latitude')}</span><span className="readout-divider" />
          <span>{formatCoordinate(view.longitude, 'longitude')}</span>
        </div>
        <div className="map-hint" aria-hidden="true">Drag to explore · Scroll to zoom</div>
      </main>
    </div>
  )
}
