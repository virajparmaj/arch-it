import { useEffect, useRef, useState } from 'react'
import { Map, NavigationControl, ScaleControl, GeolocateControl, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { RefreshCw, WifiOff, X } from 'lucide-react'
import { INITIAL_CITY, MAP_STYLE_URL } from './config'
import type { MapDestination, MapView } from '../../types/map'
import type { BuildingDataset, BuildingFeature, BuildingMiss } from '../../types/building'
import { mountBuildingLayers, setBuildingSelection } from '../buildings/layers'
import 'maplibre-gl/dist/maplibre-gl.css'

// MapLibre 6 ships a separate worker; Vite must bundle its sibling imports too.
setWorkerUrl(workerUrl)

interface MapCanvasProps {
  destination: MapDestination
  onViewChange: (view: MapView) => void
  onExplore: () => void
  buildings?: BuildingDataset | null
  selectedBuildingId?: string | null
  onBuildingSelect?: (building: BuildingFeature) => void
  onBuildingMiss?: (reason: BuildingMiss) => void
}

type MapStatus = 'loading' | 'ready' | 'unavailable' | 'unsupported'
const CONTEXT_LOST_NOTICE = 'The map display was interrupted. Reload the map to restore it.'

export default function MapCanvas({ destination, onViewChange, onExplore, buildings, selectedBuildingId, onBuildingSelect, onBuildingMiss }: MapCanvasProps) {
  const container = useRef<HTMLDivElement>(null)
  const instance = useRef<Map | null>(null)
  const lastView = useRef({ center: INITIAL_CITY.center, zoom: INITIAL_CITY.zoom })
  const [status, setStatus] = useState<MapStatus>('loading')
  const [loadedMap, setLoadedMap] = useState<Map | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!container.current) return
    let map: Map
    let hasLoaded = false
    let disposed = false

    function loadFailure() {
      if (!disposed && !hasLoaded) setStatus('unavailable')
    }

    // A blocked tile host must never leave the user on an endless spinner.
    const timeout = window.setTimeout(loadFailure, 20_000)
    try {
      map = new Map({
        container: container.current,
        style: MAP_STYLE_URL,
        center: lastView.current.center,
        zoom: lastView.current.zoom,
        minZoom: 1,
        maxZoom: 19,
        attributionControl: { compact: true },
        canvasContextAttributes: { antialias: true },
        locale: { 'Map.Title': 'Interactive world map. Use arrow keys to pan and plus or minus to zoom.' },
      })
    } catch (error) {
      console.error('Map initialization failed', error)
      window.clearTimeout(timeout)
      container.current.replaceChildren()
      // External renderer initialization can fail synchronously (for example, no WebGL).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('unsupported')
      return
    }

    instance.current = map
    map.addControl(new NavigationControl({ visualizePitch: true }), 'top-right')
    map.addControl(new ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left')
    const geolocate = new GeolocateControl({
      positionOptions: { enableHighAccuracy: false, timeout: 10_000 },
      trackUserLocation: false,
      showAccuracyCircle: true,
      fitBoundsOptions: { maxZoom: 16 },
    })
    map.addControl(geolocate, 'top-right')
    geolocate.on('error', (event: { code: number }) => {
      if (event.code === 1) setNotice('Location access is off. Allow it in your browser settings, or keep exploring the map.')
      else setNotice('We couldn’t find your location. Try again, or choose a city to explore.')
    })
    geolocate.on('geolocate', () => { setNotice(null); onExplore() })

    function updateView() {
      const { lng, lat } = map.getCenter()
      const longitude = ((lng + 180) % 360 + 360) % 360 - 180
      const zoom = map.getZoom()
      lastView.current = { center: [longitude, lat], zoom }
      onViewChange({ longitude, latitude: lat, zoom })
    }

    map.on('load', () => {
      hasLoaded = true
      window.clearTimeout(timeout)
      setStatus('ready')
      setLoadedMap(map)
      updateView()
    })
    map.on('error', (event) => {
      console.warn('Map resource failed', event.error)
      if (!hasLoaded) setStatus('unavailable')
      else setNotice('Some map details couldn’t load. Check your connection and reload the map to try again.')
    })
    map.on('moveend', updateView)
    map.on('movestart', (event) => { if (event.originalEvent) onExplore() })
    map.on('webglcontextlost', () => setNotice(CONTEXT_LOST_NOTICE))
    map.on('webglcontextrestored', () => setNotice((current) => current === CONTEXT_LOST_NOTICE ? null : current))

    function onOffline() { setNotice('You’re offline. Loaded areas may stay visible; reconnect to explore more.') }
    function onOnline() { setNotice('Connection restored. Reload the map if any areas are still missing.') }
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    if (!navigator.onLine) onOffline()

    return () => {
      disposed = true
      window.clearTimeout(timeout)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
      instance.current = null
      map.remove()
    }
  }, [attempt, onViewChange, onExplore])

  useEffect(() => {
    lastView.current = { center: destination.city.center, zoom: destination.city.zoom }
    instance.current?.flyTo({
      center: destination.city.center,
      zoom: destination.city.zoom,
      bearing: 0,
      pitch: 0,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1600,
    })
  }, [destination])

  useEffect(() => {
    // Readiness belongs to a renderer instance, not a boolean retained across HMR/retry.
    if (!loadedMap || loadedMap !== instance.current || !buildings || !onBuildingSelect || !onBuildingMiss) return
    return mountBuildingLayers(loadedMap, buildings, onBuildingSelect, onBuildingMiss)
  }, [loadedMap, buildings, onBuildingSelect, onBuildingMiss])

  useEffect(() => {
    if (loadedMap && loadedMap === instance.current && buildings) setBuildingSelection(loadedMap, selectedBuildingId ?? null)
  }, [loadedMap, buildings, selectedBuildingId])

  function retry() {
    setStatus('loading')
    setNotice(null)
    setAttempt((value) => value + 1)
  }

  return (
    <>
      <div className="map-canvas" ref={container} aria-label="Interactive world map. Use arrow keys to pan and plus or minus to zoom." />
      {status === 'loading' && <div className="map-message" role="status"><span className="loading-dot" /><strong>Opening the atlas…</strong><p>Finding your place in the world.</p></div>}
      {(status === 'unavailable' || status === 'unsupported') && (
        <div className="map-message map-failure" role="alert">
          <WifiOff size={26} strokeWidth={1.5} aria-hidden="true" />
          <h2>{status === 'unsupported' ? 'The map couldn’t start.' : 'The map is out of reach.'}</h2>
          <p>{status === 'unsupported' ? 'Try enabling hardware acceleration or opening this page in a browser with WebGL support.' : 'Check your internet connection and try again. The map provider may be temporarily unavailable.'}</p>
          <button className="primary-button" onClick={retry}><RefreshCw size={16} aria-hidden="true" /> Try again</button>
        </div>
      )}
      {notice && <div className="map-notice" role="status"><p>{notice}</p><button onClick={retry}>Reload map</button><button className="dismiss-notice" onClick={() => setNotice(null)} aria-label="Dismiss notice"><X size={18} aria-hidden="true" /></button></div>}
    </>
  )
}
