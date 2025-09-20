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
    }
  }
}
export {};
