declare module 'mapbox-gl' {
  export class Map {
    constructor(options: MapOptions);
    on(event: string, callback: () => void): void;
    addControl(control: any): void;
    setCenter(center: [number, number]): void;
    setZoom(zoom: number): void;
    fitBounds(bounds: any, options?: any): void;
    addSource(id: string, source: any): void;
    addLayer(layer: any): void;
    getSource(id: string): any;
    getLayer(id: string): any;
    removeSource(id: string): void;
    removeLayer(id: string): void;
    remove(): void;
  }

  export class Marker {
    constructor(element: HTMLElement);
    setLngLat(coordinates: [number, number]): Marker;
    setPopup(popup: Popup): Marker;
    addTo(map: Map): Marker;
  }

  export class Popup {
    constructor(options?: PopupOptions);
    setHTML(html: string): Popup;
  }

  export class NavigationControl {
    constructor();
  }

  export class LngLatBounds {
    constructor();
    extend(coordinates: [number, number]): LngLatBounds;
  }

  interface MapOptions {
    container: HTMLElement;
    style: string;
    center: [number, number];
    zoom: number;
  }

  interface PopupOptions {
    offset?: number;
  }

  // Add accessToken property to the main mapboxgl namespace
  namespace mapboxgl {
    export let accessToken: string;
  }
}