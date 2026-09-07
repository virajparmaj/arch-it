import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MapCanvas from './MapCanvas'
import { CITIES } from './config'

type EventPayload = { originalEvent?: Event; error?: Error; code?: number }
type EventHandler = (event: EventPayload) => void

const doubles = vi.hoisted(() => {
  const failure = { enabled: false }
  const maps: Renderer[] = []
  const locators: EventSource[] = []

  class EventSource {
    handlers = new Map<string, EventHandler[]>()
    on(name: string, handler: EventHandler) {
      this.handlers.set(name, [...(this.handlers.get(name) ?? []), handler])
      return this
    }
    emit(name: string, event: EventPayload = {}) {
      this.handlers.get(name)?.forEach((handler) => handler(event))
    }
  }

  class Renderer extends EventSource {
    flyTo = vi.fn()
    remove = vi.fn()
    addControl = vi.fn()
    getCenter = () => ({ lng: -87.6298, lat: 41.8868 })
    getZoom = () => 14
    constructor() {
      super()
      if (failure.enabled) throw new Error('WebGL unavailable')
      maps.push(this)
    }
  }

  class Locator extends EventSource {
    constructor() { super(); locators.push(this) }
  }

  return { maps, locators, failure, Renderer, Locator }
})

vi.mock('maplibre-gl', () => ({
  Map: doubles.Renderer,
  NavigationControl: class {},
  ScaleControl: class {},
  GeolocateControl: doubles.Locator,
  setWorkerUrl: vi.fn(),
}))

let host: HTMLDivElement
let root: Root
const onViewChange = vi.fn()
const onExplore = vi.fn()

function renderMap(cityIndex = 0, request = 0) {
  act(() => root.render(<MapCanvas destination={{ city: CITIES[cityIndex], request }} onViewChange={onViewChange} onExplore={onExplore} />))
}

function latestMap() {
  return doubles.maps[doubles.maps.length - 1]
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  doubles.maps.length = 0
  doubles.locators.length = 0
  doubles.failure.enabled = false
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})

afterEach(() => {
  act(() => root.unmount())
  host.remove()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('map lifecycle and recovery', () => {
  it('clears loading after a map load and reports the camera', () => {
    renderMap()
    expect(host.textContent).toContain('Opening the atlas')
    act(() => latestMap().emit('load'))
    expect(host.textContent).not.toContain('Opening the atlas')
    expect(onViewChange).toHaveBeenCalledWith({ longitude: expect.closeTo(-87.6298, 4), latitude: 41.8868, zoom: 14 })
    act(() => vi.advanceTimersByTime(20_000))
    expect(host.querySelector('[role="alert"]')).toBeNull()
  })

  it('navigates to cities without recreating the map and respects reduced motion', () => {
    renderMap()
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    renderMap(1, 1)
    expect(doubles.maps).toHaveLength(1)
    expect(latestMap().flyTo).toHaveBeenLastCalledWith(expect.objectContaining({ center: CITIES[1].center, zoom: CITIES[1].zoom, duration: 0 }))
    act(() => latestMap().emit('movestart', { originalEvent: new MouseEvent('mousedown') }))
    expect(onExplore).toHaveBeenCalledOnce()
  })

  it('offers retry after a stalled load and disposes the previous renderer', () => {
    renderMap()
    const first = latestMap()
    act(() => vi.advanceTimersByTime(20_000))
    expect(host.textContent).toContain('The map is out of reach')
    act(() => host.querySelector<HTMLButtonElement>('button')!.click())
    expect(first.remove).toHaveBeenCalledOnce()
    expect(doubles.maps).toHaveLength(2)
    act(() => latestMap().emit('load'))
    expect(host.querySelector('[role="alert"]')).toBeNull()
  })

  it('shows an initialization failure and recovers when WebGL becomes available', () => {
    doubles.failure.enabled = true
    renderMap()
    expect(host.textContent).toContain('The map couldn’t start')
    doubles.failure.enabled = false
    act(() => host.querySelector<HTMLButtonElement>('button')!.click())
    act(() => latestMap().emit('load'))
    expect(host.querySelector('[role="alert"]')).toBeNull()
  })

  it('explains denied geolocation without replacing a loaded map', () => {
    renderMap()
    act(() => latestMap().emit('load'))
    act(() => doubles.locators[0].emit('error', { code: 1 }))
    expect(host.textContent).toContain('Location access is off')
    expect(host.querySelector('[role="alert"]')).toBeNull()
    act(() => doubles.locators[0].emit('geolocate'))
    expect(host.textContent).not.toContain('Location access is off')
    expect(onExplore).toHaveBeenCalledOnce()
  })

  it('clears an interrupted-renderer notice after context restoration', () => {
    renderMap()
    act(() => latestMap().emit('load'))
    act(() => latestMap().emit('webglcontextlost'))
    expect(host.textContent).toContain('map display was interrupted')
    act(() => latestMap().emit('webglcontextrestored'))
    expect(host.textContent).not.toContain('map display was interrupted')
  })

  it('removes renderer resources and load timers on unmount', () => {
    renderMap()
    const map = latestMap()
    act(() => root.render(null))
    expect(map.remove).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })
})
