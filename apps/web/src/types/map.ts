export interface City {
  id: string
  name: string
  country: string
  center: [longitude: number, latitude: number]
  zoom: number
}

export interface MapView {
  longitude: number
  latitude: number
  zoom: number
}

export interface MapDestination {
  city: City
  request: number
}
