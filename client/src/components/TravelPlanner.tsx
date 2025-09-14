import React, { useState, useEffect } from 'react';
import { Search, Plane, Calendar, DollarSign, Heart, ChevronDown } from 'lucide-react';
import axios from 'axios';

interface City {
  name: string;
  country: string;
  code: string;
}

interface ItineraryData {
  itinerary: Array<{
    day: number;
    date: string;
    title: string;
    activities: Array<{
      time: string;
      activity: string;
      location: string;
      description: string;
      cost: string;
      coordinates: [number, number];
    }>;
  }>;
  summary: {
    totalCost: string;
    highlights: string[];
    tips: string[];
  };
}

interface TravelPlannerProps {
  onItineraryGenerated: (data: ItineraryData) => void;
  onLoading: (loading: boolean) => void;
}

const TravelPlanner: React.FC<TravelPlannerProps> = ({ onItineraryGenerated, onLoading }) => {
  const [source, setSource] = useState<City | null>(null);
  const [destination, setDestination] = useState<City | null>(null);
  const [duration, setDuration] = useState<number>(7);
  const [interests, setInterests] = useState<string>('');
  const [budget, setBudget] = useState<string>('medium');
  
  const [sourceSearch, setSourceSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [destinationDropdownOpen, setDestinationDropdownOpen] = useState(false);
  
  const [cities, setCities] = useState<City[]>([]);
  const [filteredSourceCities, setFilteredSourceCities] = useState<City[]>([]);
  const [filteredDestinationCities, setFilteredDestinationCities] = useState<City[]>([]);

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await axios.get('/api/cities');
        setCities(response.data);
        setFilteredSourceCities(response.data);
        setFilteredDestinationCities(response.data);
      } catch (error) {
        console.error('Error loading cities:', error);
      }
    };
    loadCities();
  }, []);

  // Filter cities based on search
  useEffect(() => {
    if (sourceSearch) {
      const filtered = cities.filter(city =>
        city.name.toLowerCase().includes(sourceSearch.toLowerCase()) ||
        city.country.toLowerCase().includes(sourceSearch.toLowerCase())
      );
      setFilteredSourceCities(filtered);
    } else {
      setFilteredSourceCities(cities);
    }
  }, [sourceSearch, cities]);

  useEffect(() => {
    if (destinationSearch) {
      const filtered = cities.filter(city =>
        city.name.toLowerCase().includes(destinationSearch.toLowerCase()) ||
        city.country.toLowerCase().includes(destinationSearch.toLowerCase())
      );
      setFilteredDestinationCities(filtered);
    } else {
      setFilteredDestinationCities(cities);
    }
  }, [destinationSearch, cities]);

  const handleGenerateItinerary = async () => {
    if (!source || !destination) {
      alert('Please select both source and destination cities');
      return;
    }

    onLoading(true);
    try {
      const response = await axios.post('/api/generate-itinerary', {
        source,
        destination,
        duration,
        interests,
        budget
      });
      
      onItineraryGenerated(response.data);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('Failed to generate itinerary. Please try again.');
    } finally {
      onLoading(false);
    }
  };

  const interestOptions = [
    'Culture & History',
    'Adventure & Outdoor',
    'Food & Cuisine',
    'Beaches & Relaxation',
    'Nightlife & Entertainment',
    'Shopping',
    'Nature & Wildlife',
    'Art & Museums'
  ];

  const budgetOptions = [
    { value: 'budget', label: 'Budget ($500-1000)' },
    { value: 'medium', label: 'Medium ($1000-3000)' },
    { value: 'luxury', label: 'Luxury ($3000+)' }
  ];

  return (
    <section id="travel-planner" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Trip
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us where you're going and we'll create a detailed itinerary just for you
          </p>
        </div>

        <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Source City */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Plane className="inline-block w-4 h-4 mr-2" />
                From (Source)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                  onFocus={() => setSourceDropdownOpen(true)}
                  placeholder="Search for departure city..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                {sourceDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredSourceCities.map((city) => (
                      <button
                        key={`${city.name}-${city.country}`}
                        onClick={() => {
                          setSource(city);
                          setSourceSearch(`${city.name}, ${city.country}`);
                          setSourceDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{city.name}</div>
                        <div className="text-sm text-gray-600">{city.country}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Destination City */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Plane className="inline-block w-4 h-4 mr-2" />
                To (Destination)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destinationSearch}
                  onChange={(e) => setDestinationSearch(e.target.value)}
                  onFocus={() => setDestinationDropdownOpen(true)}
                  placeholder="Search for destination city..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                {destinationDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredDestinationCities.map((city) => (
                      <button
                        key={`${city.name}-${city.country}`}
                        onClick={() => {
                          setDestination(city);
                          setDestinationSearch(`${city.name}, ${city.country}`);
                          setDestinationDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{city.name}</div>
                        <div className="text-sm text-gray-600">{city.country}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Duration */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="inline-block w-4 h-4 mr-2" />
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 7)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="inline-block w-4 h-4 mr-2" />
                Budget
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {budgetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Heart className="inline-block w-4 h-4 mr-2" />
                Interests
              </label>
              <select
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select interests...</option>
                {interestOptions.map((interest) => (
                  <option key={interest} value={interest}>
                    {interest}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={handleGenerateItinerary}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plane className="inline-block w-5 h-5 mr-2" />
              Generate My Itinerary
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelPlanner;
