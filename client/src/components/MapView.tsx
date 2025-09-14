import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './MapView.module.css';
import SimpleMapView from './SimpleMapView';

interface Activity {
  time: string;
  activity: string;
  location: string;
  description: string;
  cost: string;
  coordinates: [number, number];
}

interface Day {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
}

interface MapViewProps {
  itinerary: Day[];
}

const MapView: React.FC<MapViewProps> = ({ itinerary }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Check if Mapbox token is available
    const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    if (!mapboxToken || mapboxToken === 'your_mapbox_access_token_here') {
      setMapError(true);
      return;
    }

    // Set the access token
    (mapboxgl as any).accessToken = mapboxToken;

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [0, 0], // Will be updated when we have coordinates
        zoom: 2
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl());

      map.current.on('load', () => {
        setMapLoaded(true);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
      return;
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers and sources
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Clean up existing route layer and source
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    // Collect all coordinates
    const allCoordinates: [number, number][] = [];
    const bounds = new mapboxgl.LngLatBounds();

    itinerary.forEach((day, dayIndex) => {
      day.activities.forEach((activity, activityIndex) => {
        if (activity.coordinates && activity.coordinates[0] !== 0 && activity.coordinates[1] !== 0) {
          // Handle both [lng, lat] and [lat, lng] formats
          let [lng, lat] = activity.coordinates;
          
          // If coordinates seem to be in [lat, lng] format (common AI mistake), swap them
          if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
            [lng, lat] = [lat, lng];
          }
          
          // Validate coordinates are reasonable
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            allCoordinates.push([lng, lat]);
            bounds.extend([lng, lat]);

            // Create marker
            const markerElement = document.createElement('div');
            markerElement.className = styles['custom-marker'];
            markerElement.innerHTML = `
              <div class="${styles['marker-content']}">
                <div class="${styles['marker-number']}">${dayIndex + 1}.${activityIndex + 1}</div>
                <div class="${styles['marker-time']}">${activity.time}</div>
              </div>
            `;

            // Add marker to map
            if (map.current) {
              new mapboxgl.Marker(markerElement)
                .setLngLat([lng, lat])
                .setPopup(
                  new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`
                      <div class="${styles['popup-content']}">
                        <h3 class="${styles['popup-title']}">${activity.activity}</h3>
                        <p class="${styles['popup-location']}">📍 ${activity.location}</p>
                        <p class="${styles['popup-time']}">🕐 ${activity.time}</p>
                        <p class="${styles['popup-cost']}">💰 ${activity.cost}</p>
                        <p class="${styles['popup-description']}">${activity.description}</p>
                      </div>
                    `)
                )
                .addTo(map.current);
            }
          }
        }
      });
    });

    // Fit map to show all markers
    if (allCoordinates.length > 0 && map.current) {
      if (allCoordinates.length === 1) {
        map.current.setCenter(allCoordinates[0]);
        map.current.setZoom(10);
      } else {
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }

    // Add route line if we have multiple points
    if (allCoordinates.length > 1 && map.current) {
      try {
        // Remove existing route layer and source if they exist
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }

        // Add new route source and layer
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: allCoordinates
            }
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 3,
            'line-opacity': 0.8
          }
        });
      } catch (error) {
        console.warn('Error adding route to map:', error);
      }
    } else if (allCoordinates.length <= 1 && map.current) {
      // Remove route layer and source if we don't have enough points
      try {
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }
      } catch (error) {
        console.warn('Error removing route from map:', error);
      }
    }

    // Cleanup function
    return () => {
      if (map.current) {
        // Remove existing markers
        const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
        existingMarkers.forEach(marker => marker.remove());
        
        // Remove route layer and source
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }
      }
    };
  }, [itinerary, mapLoaded]);

  if (mapError) {
    return <SimpleMapView itinerary={itinerary} />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Trip Map</h3>
        <p className="text-gray-600">Interactive map showing your travel route and activities</p>
      </div>
      
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="w-full h-96"
          style={{ minHeight: '400px' }}
        />
        
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;