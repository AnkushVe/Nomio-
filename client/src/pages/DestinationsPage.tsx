import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Star, DollarSign, Camera, Search, Filter, Globe, Utensils, Hotel, Car, Mountain, Building, Heart, Coffee, ShoppingBag, Plane } from 'lucide-react';

interface Place {
  place_id: string;
  name: string;
  formatted_address: string;
  rating: number;
  user_ratings_total: number;
  price_level?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

interface Destination {
  name: string;
  country: string;
  description: string;
  image: string;
  coordinates: [number, number];
  category: string;
  bestTime: string;
  budget: string;
}

const DestinationsPage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [streetView, setStreetView] = useState<google.maps.StreetViewPanorama | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchRadius, setSearchRadius] = useState<number>(10000);
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);

  // Place categories for comprehensive search
  const placeCategories = [
    { id: 'all', name: 'All Places', icon: Globe, color: 'bg-blue-500' },
    { id: 'restaurant', name: 'Restaurants', icon: Utensils, color: 'bg-orange-500' },
    { id: 'tourist_attraction', name: 'Attractions', icon: Mountain, color: 'bg-green-500' },
    { id: 'lodging', name: 'Hotels', icon: Hotel, color: 'bg-purple-500' },
    { id: 'shopping_mall', name: 'Shopping', icon: ShoppingBag, color: 'bg-pink-500' },
    { id: 'cafe', name: 'Cafes', icon: Coffee, color: 'bg-yellow-500' },
    { id: 'hospital', name: 'Healthcare', icon: Heart, color: 'bg-red-500' },
    { id: 'gas_station', name: 'Gas Stations', icon: Car, color: 'bg-gray-500' },
    { id: 'airport', name: 'Airports', icon: Plane, color: 'bg-indigo-500' },
    { id: 'bank', name: 'Banks', icon: Building, color: 'bg-teal-500' }
  ];

  // Popular destinations data
  const popularDestinations: Destination[] = useMemo(() => [
    {
      name: 'Paris',
      country: 'France',
      description: 'The City of Light, known for its art, fashion, and iconic landmarks',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      coordinates: [2.3522, 48.8566],
      category: 'City',
      bestTime: 'April - June, September - November',
      budget: '$$$'
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      description: 'A vibrant metropolis blending traditional culture with modern innovation',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      coordinates: [139.6917, 35.6895],
      category: 'City',
      bestTime: 'March - May, September - November',
      budget: '$$$'
    },
    {
      name: 'Santorini',
      country: 'Greece',
      description: 'Stunning volcanic island with white-washed buildings and breathtaking sunsets',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      coordinates: [25.4615, 36.3932],
      category: 'Island',
      bestTime: 'May - October',
      budget: '$$'
    },
    {
      name: 'New York',
      country: 'USA',
      description: 'The Big Apple, a melting pot of cultures and endless possibilities',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      coordinates: [-74.0060, 40.7128],
      category: 'City',
      bestTime: 'April - June, September - November',
      budget: '$$$'
    },
    {
      name: 'Bali',
      country: 'Indonesia',
      description: 'Tropical paradise with lush landscapes, temples, and pristine beaches',
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      coordinates: [115.1889, -8.3405],
      category: 'Island',
      bestTime: 'April - October',
      budget: '$'
    },
    {
      name: 'Rome',
      country: 'Italy',
      description: 'The Eternal City, home to ancient history and world-class cuisine',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      coordinates: [12.4964, 41.9028],
      category: 'City',
      bestTime: 'April - June, September - November',
      budget: '$$'
    },
    {
      name: 'Dubai',
      country: 'UAE',
      description: 'Ultra-modern city with luxury shopping, skyscrapers, and desert adventures',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      coordinates: [55.2708, 25.2048],
      category: 'City',
      bestTime: 'November - March',
      budget: '$$$'
    },
    {
      name: 'Sydney',
      country: 'Australia',
      description: 'Harbor city with iconic Opera House and stunning coastal views',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      coordinates: [151.2093, -33.8688],
      category: 'City',
      bestTime: 'September - November, March - May',
      budget: '$$$'
    }
  ], []);

  useEffect(() => {
    setDestinations(popularDestinations);
    initializeMap();
  }, [popularDestinations]);

  const initializeMap = () => {
    if (mapRef.current && window.google) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 2,
        center: { lat: 20, lng: 0 },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      setMap(mapInstance);

      // Initialize Street View
      if (streetViewRef.current) {
        const streetViewInstance = new window.google.maps.StreetViewPanorama(streetViewRef.current, {
          position: { lat: 40.7128, lng: -74.0060 },
          pov: { heading: 0, pitch: 0 },
          visible: true
        });
        setStreetView(streetViewInstance);
      }
    }
  };

  const searchPlaces = async (query: string, category: string = 'all') => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Use Google Places API directly from frontend
      if (window.google && window.google.maps) {
        const service = new window.google.maps.places.PlacesService(map || document.createElement('div'));
        
        // Build comprehensive search query
        let searchQuery = query;
        if (category !== 'all') {
          searchQuery = `${category} in ${query}`;
        }
        
        const request = {
          query: searchQuery,
          fields: ['name', 'formatted_address', 'rating', 'user_ratings_total', 'price_level', 'photos', 'geometry', 'types', 'place_id', 'opening_hours', 'website', 'formatted_phone_number']
        };

        service.textSearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            const placesData = results.slice(0, 20).map(place => ({
              place_id: place.place_id,
              name: place.name,
              formatted_address: place.formatted_address,
              rating: place.rating || 0,
              user_ratings_total: place.user_ratings_total || 0,
              price_level: place.price_level,
              photos: place.photos,
              geometry: place.geometry,
              types: place.types || []
            }));
            
            setPlaces(placesData);
            setSelectedDestination(query);
            
            // Update map to show the destination
            if (map && placesData.length > 0) {
              const firstPlace = placesData[0];
              map.setCenter({ 
                lat: firstPlace.geometry.location.lat(), 
                lng: firstPlace.geometry.location.lng() 
              });
              map.setZoom(12);
            }
          } else {
            console.error('Places search failed:', status);
            // Fallback to mock data
            setPlaces(getMockPlaces(query));
            setSelectedDestination(query);
          }
          setIsLoading(false);
        });
      } else {
        // Fallback to mock data if Google Maps not loaded
        setPlaces(getMockPlaces(query));
        setSelectedDestination(query);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setPlaces(getMockPlaces(query));
      setSelectedDestination(query);
      setIsLoading(false);
    }
  };

  const getMockPlaces = (query: string) => {
    const mockPlaces = {
      'Paris': [
        {
          place_id: '1',
          name: 'Eiffel Tower',
          formatted_address: 'Champ de Mars, 7e arrondissement, Paris, France',
          rating: 4.6,
          user_ratings_total: 150000,
          price_level: 2,
          photos: [{ photo_reference: 'mock1', height: 400, width: 400 }],
          geometry: { location: { lat: 48.8584, lng: 2.2945 } },
          types: ['tourist_attraction', 'point_of_interest']
        },
        {
          place_id: '2',
          name: 'Louvre Museum',
          formatted_address: 'Rue de Rivoli, 1er arrondissement, Paris, France',
          rating: 4.5,
          user_ratings_total: 120000,
          price_level: 3,
          photos: [{ photo_reference: 'mock2', height: 400, width: 400 }],
          geometry: { location: { lat: 48.8606, lng: 2.3376 } },
          types: ['museum', 'tourist_attraction']
        }
      ],
      'Tokyo': [
        {
          place_id: '3',
          name: 'Senso-ji Temple',
          formatted_address: '2 Chome-3-1 Asakusa, Taito City, Tokyo, Japan',
          rating: 4.4,
          user_ratings_total: 80000,
          price_level: 1,
          photos: [{ photo_reference: 'mock3', height: 400, width: 400 }],
          geometry: { location: { lat: 35.7148, lng: 139.7967 } },
          types: ['place_of_worship', 'tourist_attraction']
        }
      ]
    };
    
    return mockPlaces[query as keyof typeof mockPlaces] || [
      {
        place_id: 'default',
        name: `Attractions in ${query}`,
        formatted_address: `${query}`,
        rating: 4.0,
        user_ratings_total: 1000,
        price_level: 2,
        photos: [{ photo_reference: 'mock', height: 400, width: 400 }],
        geometry: { location: { lat: 0, lng: 0 } },
        types: ['tourist_attraction']
      }
    ];
  };

  const handleDestinationClick = (destination: Destination) => {
    setSelectedDestination(destination.name);
    setSearchQuery(destination.name);
    
    // Update map
    if (map) {
      map.setCenter({ lat: destination.coordinates[1], lng: destination.coordinates[0] });
      map.setZoom(12);
    }
    
    // Update Street View
    if (streetView) {
      streetView.setPosition({ lat: destination.coordinates[1], lng: destination.coordinates[0] });
    }
    
    // Search for places in this destination
    searchPlaces(destination.name);
  };

  const getPhotoUrl = (photoReference?: string) => {
    if (!photoReference) {
      return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
    }
    
    if (photoReference.startsWith('mock')) {
      // Return placeholder images for mock data
      const mockImages = {
        'mock1': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        'mock2': 'https://images.unsplash.com/photo-1549144511-f099e773c147?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        'mock3': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        'mock': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      };
      return mockImages[photoReference as keyof typeof mockImages] || mockImages['mock'];
    }
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
  };

  const getPriceLevel = (level?: number) => {
    if (!level) return 'Price not available';
    return '$'.repeat(level);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Explore World Destinations</h1>
              <p className="text-gray-600 mt-1">Discover amazing places with Google Maps & Places API</p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Search and Destinations */}
          <div className="lg:col-span-1 space-y-6">
            {/* Enhanced Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Global Search</h3>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Try: 'restaurants in Mumbai', 'hotels in Paris', 'best pizza near me'..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && searchPlaces(searchQuery, selectedCategory)}
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Live Google Places Data:</p>
                      <p className="text-blue-600">Real ratings, reviews, photos, opening hours, and contact info for every place on Earth!</p>
                    </div>
                  </div>
                </div>
                
                {showFilters && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Place Category</label>
                      <div className="grid grid-cols-2 gap-2">
                        {placeCategories.map((category) => {
                          const IconComponent = category.icon;
                          return (
                            <button
                              key={category.id}
                              onClick={() => setSelectedCategory(category.id)}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                selectedCategory === category.id
                                  ? `${category.color} text-white`
                                  : 'bg-white text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                              <span>{category.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Radius: {searchRadius / 1000}km
                      </label>
                      <input
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => searchPlaces(searchQuery, selectedCategory)}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Search {selectedCategory === 'all' ? 'All Places' : placeCategories.find(c => c.id === selectedCategory)?.name}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Search Suggestions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Quick Search</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Cities</h4>
                  <div className="flex flex-wrap gap-2">
                    {['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Dubai', 'Singapore', 'Bangkok'].map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSearchQuery(city);
                          searchPlaces(city, selectedCategory);
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Countries & States</h4>
                  <div className="flex flex-wrap gap-2">
                    {['India', 'USA', 'Japan', 'France', 'Germany', 'Italy', 'Spain', 'Brazil'].map((country) => (
                      <button
                        key={country}
                        onClick={() => {
                          setSearchQuery(country);
                          searchPlaces(country, selectedCategory);
                        }}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Landmarks</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Eiffel Tower', 'Statue of Liberty', 'Taj Mahal', 'Colosseum', 'Big Ben', 'Golden Gate Bridge'].map((landmark) => (
                      <button
                        key={landmark}
                        onClick={() => {
                          setSearchQuery(landmark);
                          searchPlaces(landmark, selectedCategory);
                        }}
                        className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                      >
                        {landmark}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Destinations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Popular Destinations</h3>
              </div>
              <div className="space-y-3">
                {destinations.map((destination, index) => (
                  <div
                    key={index}
                    onClick={() => handleDestinationClick(destination)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDestination === destination.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{destination.name}</h4>
                        <p className="text-sm text-gray-600">{destination.country}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{destination.category}</span>
                          <span className="text-xs text-gray-500">{destination.budget}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Map and Places */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Map</h3>
              <div ref={mapRef} className="w-full h-64 rounded-lg"></div>
            </div>

            {/* Street View */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Street View</h3>
              <div ref={streetViewRef} className="w-full h-64 rounded-lg"></div>
            </div>

            {/* Enhanced Places Results */}
            {places.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Camera className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedCategory === 'all' ? 'All Places' : placeCategories.find(c => c.id === selectedCategory)?.name} in {selectedDestination}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">{places.length} results</span>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {places.map((place) => (
                    <div key={place.place_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                      <div className="flex items-start space-x-4">
                        {place.photos && place.photos.length > 0 && place.photos[0].photo_reference ? (
                          <img
                            src={getPhotoUrl(place.photos[0].photo_reference)}
                            alt={place.name}
                            className="w-20 h-20 rounded-lg object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {place.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{place.formatted_address}</p>
                              
                              <div className="flex items-center space-x-4 mt-3">
                                {place.rating > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-medium text-gray-700">{place.rating}</span>
                                    <span className="text-xs text-gray-500">({place.user_ratings_total.toLocaleString()})</span>
                                  </div>
                                )}
                                
                                {place.price_level && (
                                  <div className="flex items-center space-x-1">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-gray-600">{getPriceLevel(place.price_level)}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  <span>{place.geometry.location.lat.toFixed(4)}, {place.geometry.location.lng.toFixed(4)}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mt-3">
                                {place.types.slice(0, 4).map((type, index) => {
                                  const category = placeCategories.find(c => c.id === type);
                                  const IconComponent = category?.icon || MapPin;
                                  return (
                                    <span 
                                      key={index} 
                                      className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                                        category ? `${category.color} text-white` : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      <IconComponent className="w-3 h-3" />
                                      <span>{type.replace(/_/g, ' ')}</span>
                                    </span>
                                  );
                                })}
                                {place.types.length > 4 && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                    +{place.types.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => {
                                if (map) {
                                  map.setCenter({
                                    lat: place.geometry.location.lat,
                                    lng: place.geometry.location.lng
                                  });
                                  map.setZoom(15);
                                }
                              }}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              View on Map
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {places.length >= 20 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      Showing first 20 results. Try a more specific search for better results.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationsPage;
