import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import WeatherDisplay from './WeatherDisplay';

interface Activity { 
  time: string; 
  activity: string; 
  location: string; 
  description: string; 
  cost: string; 
  coordinates: [number, number];
  weather?: any;
  aqi?: string;
  aqiValue?: number;
}
interface Day { day: number; date: string; title: string; activities: Activity[]; }

interface GoogleMapCanvasProps {
  itinerary: Day[] | any;
  weather?: any;
  city?: string;
  onSelectLocation?: (name: string) => void;
  onVoiceResponse?: (response: string) => void;
  mapData?: any;
  travelMode?: string;
}

declare const google: any;

const GoogleMapCanvas: React.FC<GoogleMapCanvasProps> = ({ itinerary, weather, city, onSelectLocation, onVoiceResponse, mapData, travelMode }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const markersRef = useRef<any[]>([]);
  const polylineRefs = useRef<any[]>([]);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [descriptors, setDescriptors] = useState<any>(null);
  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const [streetView, setStreetView] = useState<any>(null);

  // Generate voice response for map clicks
  const generateVoiceResponse = useCallback(async (locationName: string) => {
    if (!onVoiceResponse) return;
    
    try {
      const response = await axios.post('/api/chat-travel', {
        message: `Tell me about ${locationName} for ${travelMode || 'friends'} travel`,
        conversationHistory: [],
        currentLocation: city || '',
        userId: 'map_click_' + Date.now()
      });
      
      if (response.data.message) {
        onVoiceResponse(response.data.message);
      }
    } catch (error) {
      console.error('Error generating voice response:', error);
    }
  }, [onVoiceResponse, travelMode, city]);

  useEffect(() => {
        const init = () => {
          if (!mapRef.current) return;
          console.log('Initializing map...');
          // Default to world center for full world view
          const defaultCenter: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
          mapInstance.current = new google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: 0, // Maximum zoom out - lines reach corners
            mapTypeId: 'roadmap',
            streetViewControl: false,
            mapTypeControl: false,
            gestureHandling: 'greedy', // Allow better panning
            zoomControl: true,
            scrollwheel: true,
            disableDoubleClickZoom: false,
            minZoom: 1, // Allow very zoomed out view
            maxZoom: 18,
            restriction: {
              latLngBounds: {
                north: 85,
                south: -85,
                west: -180,
                east: 180
              }
            }
          });
          console.log('Map initialized successfully');
          setLoaded(true);

          // Click-to-select: reverse geocode clicked point and notify parent
          if (onSelectLocation) {
            let tempMarker: any = null;
            mapInstance.current.addListener('click', async (e: any) => {
              try {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                // Drop/update a temporary marker
                if (tempMarker) tempMarker.setMap(null);
                tempMarker = new google.maps.Marker({ map: mapInstance.current, position: { lat, lng } });

                const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
                const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
                const resp = await axios.get(url);
                const comp = resp.data?.results?.[0];
                const name = comp?.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                onSelectLocation(name);
                
                // Generate voice response for the clicked location
                await generateVoiceResponse(name);
              } catch (error) {
                console.error('Geocoding error:', error);
              }
            });
          }
        };

    // Load script if needed
    if (!(window as any).google || !(window as any).google.maps) {
      const existing = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', init, { once: true });
        return;
      }
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-google-maps', 'true');
      script.onload = init;
      document.body.appendChild(script);
    } else {
      init();
    }

    return () => {
      // no special cleanup required
    };
  }, []);

  useEffect(() => {
    if (!loaded || !mapInstance.current) return;

    // Clear previous overlays
    if (polylineRefs.current.length > 0) {
      polylineRefs.current.forEach((p) => { try { p.setMap(null); } catch {} });
      polylineRefs.current = [];
    }
    if (markersRef.current.length > 0) {
      markersRef.current.forEach((m) => { try { m.setMap(null); } catch {} });
      markersRef.current = [];
    }

    // Add fresh overlays
    const bounds = new google.maps.LatLngBounds();
    const normalizedPoints: google.maps.LatLngLiteral[] = [];
    const adjustedPath: google.maps.LatLngLiteral[] = [];
    let anchorLng: number | null = null;

    // Handle both old format (array of days) and new format (object with places)
    if (Array.isArray(itinerary)) {
      // Old format - array of days
      itinerary.forEach((day) => {
        day.activities.forEach((a: any) => {
        if (!a.coordinates) return;
        let [lng, lat] = a.coordinates;
        if (Math.abs(lat) > 90 || Math.abs(lng) > 180) [lng, lat] = [lat, lng];
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
        // Calculate unwrapped coordinates first
        if (anchorLng === null) anchorLng = lng;
        const k = Math.round(((anchorLng || 0) - lng) / 360);
        const unwrappedLng = lng + k * 360;
        
        // Use the SAME unwrapped coordinates for both markers and polyline
        const pos = { lat, lng: unwrappedLng } as google.maps.LatLngLiteral;
        normalizedPoints.push(pos);
        bounds.extend(pos);
        adjustedPath.push({ lat, lng: unwrappedLng });

        const marker = new google.maps.Marker({
          map: mapInstance.current,
          position: pos,
          title: a.activity,
        });
        markersRef.current.push(marker);

        marker.addListener('click', async () => {
          setSelectedPin({ activity: a.activity, location: a.location, coordinates: [lng, lat] });
          try {
            const descriptorsResponse = await axios.get(`/api/geo/descriptors?lng=${lng}&lat=${lat}`);
            setDescriptors(descriptorsResponse.data);
            const streetViewResponse = await axios.get(`/api/streetview?lat=${lat}&lng=${lng}`);
            setStreetView(streetViewResponse.data);
            if (descriptorsResponse.data.landmarks && descriptorsResponse.data.landmarks.length > 0) {
              const landmark = descriptorsResponse.data.landmarks[0];
              if (landmark.place_id && !String(landmark.place_id).startsWith('demo_')) {
                try {
                  const detailsResponse = await axios.get(`/api/places/details/${landmark.place_id}`);
                  setPlaceDetails(detailsResponse.data);
                } catch (error) {
                  console.error('Error fetching place details:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error fetching place information:', error);
          }
        });
      });
    });
    } else {
      // New format - object with places and foodPlaces
      // Add destination marker
      if (itinerary.destination) {
        const dest = itinerary.destination;
        let [lng, lat] = dest.coordinates;
        if (Math.abs(lat) > 90 || Math.abs(lng) > 180) [lng, lat] = [lat, lng];
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          if (anchorLng === null) anchorLng = lng;
          const k = Math.round(((anchorLng || 0) - lng) / 360);
          const unwrappedLng = lng + k * 360;
          const pos = { lat, lng: unwrappedLng } as google.maps.LatLngLiteral;
          normalizedPoints.push(pos);
          bounds.extend(pos);
          adjustedPath.push({ lat, lng: unwrappedLng });

          const marker = new google.maps.Marker({
            map: mapInstance.current,
            position: pos,
            title: dest.name,
          });
          markersRef.current.push(marker);
        }
      }

      // Add places markers
      if (itinerary.places) {
        itinerary.places.forEach((place: any) => {
          if (!place.coordinates) return;
          let [lng, lat] = place.coordinates;
          if (Math.abs(lat) > 90 || Math.abs(lng) > 180) [lng, lat] = [lat, lng];
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            if (anchorLng === null) anchorLng = lng;
            const k = Math.round(((anchorLng || 0) - lng) / 360);
            const unwrappedLng = lng + k * 360;
            const pos = { lat, lng: unwrappedLng } as google.maps.LatLngLiteral;
            normalizedPoints.push(pos);
            bounds.extend(pos);
            adjustedPath.push({ lat, lng: unwrappedLng });

            const marker = new google.maps.Marker({
              map: mapInstance.current,
              position: pos,
              title: place.name,
            });
            
            // Add click listener for place details
            marker.addListener('click', async () => {
              setSelectedPin({ 
                activity: place.name, 
                location: place.location, 
                coordinates: [lng, lat],
                placeId: place.placeId,
                rating: place.rating,
                priceLevel: place.priceLevel
              });
              
              // Fetch detailed place information
              if (place.placeId) {
                try {
                  const response = await axios.get(`/api/place-details/${place.placeId}`);
                  setPlaceDetails(response.data);
                } catch (error) {
                  console.error('Error fetching place details:', error);
                }
              }
            });
            
            markersRef.current.push(marker);
          }
        });
      }

      // Add food places markers
      if (itinerary.foodPlaces) {
        itinerary.foodPlaces.forEach((place: any) => {
          if (!place.coordinates) return;
          let [lng, lat] = place.coordinates;
          if (Math.abs(lat) > 90 || Math.abs(lng) > 180) [lng, lat] = [lat, lng];
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            if (anchorLng === null) anchorLng = lng;
            const k = Math.round(((anchorLng || 0) - lng) / 360);
            const unwrappedLng = lng + k * 360;
            const pos = { lat, lng: unwrappedLng } as google.maps.LatLngLiteral;
            normalizedPoints.push(pos);
            bounds.extend(pos);
            adjustedPath.push({ lat, lng: unwrappedLng });

            const marker = new google.maps.Marker({
              map: mapInstance.current,
              position: pos,
              title: place.name,
            });
            markersRef.current.push(marker);
          }
        });
      }
    }

    if (adjustedPath.length > 1) {
      const polyline = new google.maps.Polyline({
        map: mapInstance.current,
        path: adjustedPath,
        geodesic: false,
        strokeColor: '#10b981',
        strokeOpacity: 0.9,
        strokeWeight: 3,
      });
      polylineRefs.current.push(polyline);
      mapInstance.current.fitBounds(bounds);
    } else if (adjustedPath.length === 1) {
      // For single destinations, center on the location
      mapInstance.current.setCenter(normalizedPoints[0]);
      mapInstance.current.setZoom(10); // Better zoom for city view
    } else if (adjustedPath.length > 1) {
      // For multiple destinations, fit bounds to show all
      mapInstance.current.fitBounds(bounds, { padding: 50 });
    } else if (adjustedPath.length === 0 && itinerary.length === 0) {
      // If no itinerary data, center on full world view
      mapInstance.current.setCenter({ lat: 0, lng: 0 });
      mapInstance.current.setZoom(0);
    }
  }, [itinerary, loaded, generateVoiceResponse, onSelectLocation]);

  // Handle map data updates from chat
  useEffect(() => {
    if (!loaded || !mapInstance.current || !mapData) return;

    // If mapData has destination coordinates, zoom to that location
    if (mapData.destination && mapData.destination.coordinates) {
      const [lng, lat] = mapData.destination.coordinates;
      console.log('Map data received:', mapData.destination);
      console.log('Coordinates:', { lat, lng });
      
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const center = { lat, lng };
        mapInstance.current.setCenter(center);
        
        // Set appropriate zoom level based on location type
        // For states/countries, use a wider zoom level
        let zoomLevel = 6; // Default for states/countries
        
        // Adjust zoom based on location name
        const locationName = (mapData.destination.name || '').toLowerCase();
        console.log('Location name:', locationName);
        
        if (locationName.includes('california') || locationName.includes('texas') || locationName.includes('florida')) {
          zoomLevel = 4; // Large states need much wider view
        } else if (locationName.includes('city') || locationName.includes('town')) {
          zoomLevel = 8; // Cities can be closer
        } else if (locationName.includes('usa') || locationName.includes('united states') || locationName.includes('india') || locationName.includes('china')) {
          zoomLevel = 3; // Countries need very wide view
        }
        
        console.log('Setting zoom level:', zoomLevel);
        mapInstance.current.setZoom(zoomLevel);
        
        // Add a marker for the destination
        if (markersRef.current.length > 0) {
          markersRef.current.forEach(marker => marker.setMap(null));
          markersRef.current = [];
        }
        
        const marker = new google.maps.Marker({
          map: mapInstance.current,
          position: center,
          title: mapData.destination.name || 'Selected Location',
        });
        markersRef.current.push(marker);
      }
    }
  }, [mapData, loaded]);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg h-full flex flex-col">
      <div className="relative flex-1">
        <div ref={mapRef} className="w-full h-full" />
        
        {weather && city && (
          <WeatherDisplay weather={weather} city={city} />
        )}

        {selectedPin && descriptors && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm border border-gray-200 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-gray-900">{selectedPin.activity}</h4>
              <button
                onClick={() => { setSelectedPin(null); setDescriptors(null); setPlaceDetails(null); setStreetView(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{descriptors.address}</p>
            {streetView && (
              <div className="mb-3">
                <img src={streetView.image_url} alt="Street View" className="w-full h-24 object-cover rounded-lg" />
                <p className="text-xs text-gray-500 mt-1">Street View</p>
              </div>
            )}
            {placeDetails && (
              <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{placeDetails.name}</span>
                  {placeDetails.rating && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">⭐ {placeDetails.rating}</span>
                  )}
                </div>
              </div>
            )}
            {descriptors.landmarks && descriptors.landmarks.length > 0 && (
              <div className="mb-3">
                <h5 className="text-xs font-medium text-gray-700 mb-2">Nearby Landmarks:</h5>
                <div className="space-y-1">
                  {descriptors.landmarks.map((l: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{l.spatial_relationship} {l.display_name}</span>
                      <span className="text-blue-600 font-medium">{l.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {placeDetails && placeDetails.photos && placeDetails.photos.length > 0 && (
              <button
                onClick={() => window.open(`/api/places/photo?maxwidth=400&photo_reference=${encodeURIComponent(placeDetails.photos[0].photo_reference)}`, '_blank')}
                className="w-full text-xs text-green-600 hover:text-green-800 font-medium py-1"
              >
                View Photos →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMapCanvas;


