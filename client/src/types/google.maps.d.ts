declare global {
  interface Window {
    google: typeof google;
    initMap?: () => void;
  }
  namespace google {
    namespace maps {
      interface LatLngLiteral { lat: number; lng: number }
      class Map {
        constructor(mapDiv: HTMLElement, opts?: any)
        setCenter(latLng: LatLngLiteral): void
        setZoom(zoom: number): void
        fitBounds(bounds: LatLngBounds): void
      }
      class Marker {
        constructor(opts?: any)
        setMap(map: Map | null): void
        addListener(eventName: string, handler: () => void): void
      }
      class Polyline {
        constructor(opts?: any)
        setMap(map: Map | null): void
      }
      class LatLngBounds {
        extend(latLng: LatLngLiteral): void
      }
      class StreetViewPanorama {
        constructor(container: HTMLElement, opts?: any)
        setPosition(position: LatLngLiteral): void
        setVisible(visible: boolean): void
      }
      enum MapTypeId {
        ROADMAP = 'roadmap',
        SATELLITE = 'satellite',
        HYBRID = 'hybrid',
        TERRAIN = 'terrain'
      }
      namespace places {
        class PlacesService {
          constructor(mapDiv: HTMLElement | Map)
          textSearch(request: any, callback: (results: any[], status: any) => void): void
        }
        enum PlacesServiceStatus {
          OK = 'OK',
          ZERO_RESULTS = 'ZERO_RESULTS',
          OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
          REQUEST_DENIED = 'REQUEST_DENIED',
          INVALID_REQUEST = 'INVALID_REQUEST',
          UNKNOWN_ERROR = 'UNKNOWN_ERROR'
        }
      }
    }
  }
}
export {};
