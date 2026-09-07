import type { City } from '../../types/map'

export const CITIES: City[] = [
  { id: 'chicago', name: 'Chicago', country: 'United States', center: [-87.6298, 41.8868], zoom: 14 },
  { id: 'london', name: 'London', country: 'United Kingdom', center: [-0.1276, 51.5072], zoom: 13 },
  { id: 'mumbai', name: 'Mumbai', country: 'India', center: [72.8311, 18.9388], zoom: 14 },
  { id: 'new-york', name: 'New York', country: 'United States', center: [-73.9851, 40.7589], zoom: 13 },
]

export const INITIAL_CITY = CITIES[0]
export const MAP_STYLE_URL = import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/positron'

export function formatCoordinate(value: number, axis: 'latitude' | 'longitude'): string {
  const positive = axis === 'latitude' ? 'N' : 'E'
  const negative = axis === 'latitude' ? 'S' : 'W'
  return `${Math.abs(value).toFixed(4)}° ${value < 0 ? negative : positive}`
}
