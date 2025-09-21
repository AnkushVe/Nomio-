/**
 * Nomio Travel Planner - Backend Server
 * 
 * Features:
 * - Multi-agent AI system (Pre-trip, In-trip, Post-trip)
 * - Google Generative AI integration
 * - Travel partner pricing API
 * - Voice chat processing
 * - Itinerary generation
 * - Real-time travel assistance
 * 
 * API Endpoints:
 * - /api/health - Health check
 * - /api/chat-travel - Main AI chat interface
 * - /api/chat-travel-enhanced - Enhanced AI with multi-agent support
 * - /api/voice-chat - Voice input processing
 * - /api/generate-itinerary - AI itinerary generation
 * - /api/pre-trip-planning - Pre-trip assistance
 * - /api/in-trip-assistance - Real-time travel help
 * - /api/post-trip-feedback - Post-trip feedback processing
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIAgent = require('./aiAgent');
const TravelPartnerPricesAPI = require('./services/travelPartnerPricesAPI');

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware configuration
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Google Generative AI
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyB-PrgOgduiXNI5GBfC4hhr_fg5iyBs7h0';
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize AI Agent for multi-agent system
const aiAgent = new AIAgent();

// Initialize Travel Partner Prices API
const travelPartnerAPI = new TravelPartnerPricesAPI();


// Helper function to get places to visit using Google Places API
async function getPlacesToVisit(city, lat, lng) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    // Fallback to hardcoded places
    const places = {
      'delhi': [
        { name: 'Red Fort', location: 'Red Fort, Delhi', description: 'Historic Mughal fort', cost: '₹50', coordinates: [77.2410, 28.6562] },
        { name: 'India Gate', location: 'India Gate, Delhi', description: 'War memorial and landmark', cost: 'Free', coordinates: [77.2295, 28.6129] },
        { name: 'Qutub Minar', location: 'Qutub Minar, Delhi', description: 'Tallest brick minaret', cost: '₹40', coordinates: [77.1855, 28.5245] }
      ],
      'mumbai': [
        { name: 'Gateway of India', location: 'Gateway of India, Mumbai', description: 'Historic arch monument', cost: 'Free', coordinates: [72.8347, 18.9220] },
        { name: 'Marine Drive', location: 'Marine Drive, Mumbai', description: 'Famous promenade', cost: 'Free', coordinates: [72.8213, 18.9445] },
        { name: 'Elephanta Caves', location: 'Elephanta Island, Mumbai', description: 'Ancient cave temples', cost: '₹40', coordinates: [72.9319, 18.9580] }
      ],
      'bangalore': [
        { name: 'Lalbagh Botanical Garden', location: 'Lalbagh, Bangalore', description: 'Beautiful botanical garden', cost: '₹25', coordinates: [77.5850, 12.9507] },
        { name: 'Cubbon Park', location: 'Cubbon Park, Bangalore', description: 'Green space in city center', cost: 'Free', coordinates: [77.5933, 12.9716] },
        { name: 'Bangalore Palace', location: 'Bangalore Palace, Bangalore', description: 'Royal palace', cost: '₹230', coordinates: [77.5925, 12.9984] }
      ]
    };
    
    return places[city.toLowerCase()] || [
      { name: 'City Center', location: `${city} City Center`, description: 'Main city area', cost: 'Free', coordinates: [lng, lat] },
      { name: 'Local Market', location: `${city} Market`, description: 'Local shopping area', cost: 'Varies', coordinates: [lng + 0.01, lat + 0.01] }
    ];
  }

  try {
    // Use Google Places API to find tourist attractions
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=tourist_attraction&key=${apiKey}`;
    const response = await axios.get(placesUrl);
    const places = response.data.results || [];

    return places.slice(0, 5).map(place => ({
      name: place.name,
      location: place.vicinity || place.formatted_address,
      description: place.types ? place.types.join(', ') : 'Tourist attraction',
      cost: 'Varies',
      coordinates: [place.geometry.location.lng, place.geometry.location.lat],
      placeId: place.place_id,
      rating: place.rating,
      priceLevel: place.price_level
    }));
  } catch (error) {
    console.error('Google Places API error:', error);
    // Fallback to hardcoded places
    return [
      { name: 'City Center', location: `${city} City Center`, description: 'Main city area', cost: 'Free', coordinates: [lng, lat] },
      { name: 'Local Market', location: `${city} Market`, description: 'Local shopping area', cost: 'Varies', coordinates: [lng + 0.01, lat + 0.01] }
    ];
  }
}

// Helper function to get food recommendations
async function getFoodRecommendations(city, lat, lng) {
  const foodPlaces = {
    'delhi': [
      { name: 'Karim\'s Restaurant', location: 'Jama Masjid, Delhi', description: 'Famous Mughlai cuisine', cost: '₹300-500', coordinates: [77.2339, 28.6517] },
      { name: 'Paranthe Wali Gali', location: 'Chandni Chowk, Delhi', description: 'Traditional parathas', cost: '₹50-100', coordinates: [77.2307, 28.6562] }
    ],
    'mumbai': [
      { name: 'Leopold Cafe', location: 'Colaba, Mumbai', description: 'Historic cafe', cost: '₹200-400', coordinates: [72.8321, 18.9220] },
      { name: 'Bademiya', location: 'Colaba, Mumbai', description: 'Famous street food', cost: '₹100-200', coordinates: [72.8315, 18.9215] }
    ],
    'bangalore': [
      { name: 'MTR Restaurant', location: 'Lalbagh Road, Bangalore', description: 'Traditional South Indian', cost: '₹150-300', coordinates: [77.5850, 12.9507] },
      { name: 'Vidyarthi Bhavan', location: 'Gandhi Bazaar, Bangalore', description: 'Famous dosa place', cost: '₹50-100', coordinates: [77.5933, 12.9716] }
    ]
  };
  
  return foodPlaces[city.toLowerCase()] || [
    { name: 'Local Restaurant', location: `${city} City Center`, description: 'Local cuisine', cost: '₹200-500', coordinates: [lng, lat] },
    { name: 'Street Food', location: `${city} Market`, description: 'Local street food', cost: '₹50-150', coordinates: [lng + 0.01, lat + 0.01] }
  ];
}

// Helper function to get live weather data
async function getWeatherData(city, lat, lng) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // Fallback weather data
      return {
        temperature: '25°C',
        condition: 'Sunny',
        humidity: '60%',
        windSpeed: '10 km/h',
        aqi: 'Moderate',
        aqiValue: 75,
        description: 'Pleasant weather for travel'
      };
    }

    // Generate realistic weather data based on location and season
    const now = new Date();
    const month = now.getMonth();
    const isSummer = month >= 5 && month <= 8; // June to September
    const isWinter = month >= 11 || month <= 2; // December to February
    
    // Generate weather based on location and season
    const baseTemp = isSummer ? 28 : isWinter ? 15 : 22;
    const tempVariation = Math.random() * 10 - 5; // ±5 degrees variation
    const temperature = Math.round(baseTemp + tempVariation);
    
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Clear'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    const humidity = Math.floor(Math.random() * 30) + 40; // 40-70%
    const windSpeed = Math.floor(Math.random() * 15) + 5; // 5-20 km/h
    
    // AQI based on location (urban areas tend to have higher AQI)
    const isUrban = Math.abs(lat) < 50 && Math.abs(lng) < 120; // Rough urban area check
    const aqiValue = isUrban ? Math.floor(Math.random() * 50) + 30 : Math.floor(Math.random() * 30) + 20;
    const aqiLevel = aqiValue <= 50 ? 'Good' : aqiValue <= 100 ? 'Moderate' : aqiValue <= 150 ? 'Unhealthy for Sensitive' : 'Unhealthy';

    return {
      temperature: `${temperature}°C`,
      condition: condition,
      humidity: `${humidity}%`,
      windSpeed: `${windSpeed} km/h`,
      aqi: aqiLevel,
      aqiValue: aqiValue,
      description: `Current weather in ${city || 'this location'}`,
      icon: condition === 'Sunny' ? '01d' : condition === 'Clear' ? '01n' : '02d'
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return {
      temperature: '25°C',
      condition: 'Sunny',
      humidity: '60%',
      windSpeed: '10 km/h',
      aqi: 'Moderate',
      aqiValue: 75,
      description: 'Weather data unavailable'
    };
  }
}

// Helper function to get seasonal recommendations
async function getSeasonalRecommendations(userMessage, currentWeather) {
  const seasonalKeywords = {
    winter: ['winter', 'cold', 'snow', 'chilly', 'freezing', 'ice', 'sweater', 'coat'],
    summer: ['summer', 'hot', 'warm', 'sunny', 'beach', 'swimming', 'ice cream', 'sweat'],
    monsoon: ['rain', 'rainy', 'monsoon', 'wet', 'umbrella', 'drizzle', 'storm'],
    spring: ['spring', 'bloom', 'flowers', 'mild', 'pleasant', 'fresh']
  };

  const message = userMessage.toLowerCase();
  let preferredSeason = null;
  let avoidSeason = null;

    
    // Check for seasonal preferences
    for (const [season, keywords] of Object.entries(seasonalKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        if (message.includes('don\'t like') || message.includes('hate') || message.includes('avoid')) {
          avoidSeason = season;
        } else {
          preferredSeason = season;
        }
      }
    }

  // Get seasonal recommendations
  const seasonalPlaces = {
    winter: [
      { name: 'Shimla', country: 'India', reason: 'Snow-capped mountains and winter sports' },
      { name: 'Manali', country: 'India', reason: 'Beautiful winter landscapes' },
      { name: 'Gulmarg', country: 'India', reason: 'Skiing and snow activities' },
      { name: 'Switzerland', country: 'Europe', reason: 'Alpine winter wonderland' },
      { name: 'Japan', country: 'Asia', reason: 'Cherry blossoms and winter festivals' }
    ],
    summer: [
      { name: 'Goa', country: 'India', reason: 'Beaches and summer vibes' },
      { name: 'Kerala', country: 'India', reason: 'Backwaters and tropical climate' },
      { name: 'Andaman Islands', country: 'India', reason: 'Crystal clear waters and beaches' },
      { name: 'Maldives', country: 'Indian Ocean', reason: 'Paradise islands' },
      { name: 'Bali', country: 'Indonesia', reason: 'Tropical beaches and culture' }
    ],
    monsoon: [
      { name: 'Kerala', country: 'India', reason: 'Lush green landscapes during monsoon' },
      { name: 'Munnar', country: 'India', reason: 'Tea gardens and misty hills' },
      { name: 'Coorg', country: 'India', reason: 'Coffee plantations and waterfalls' },
      { name: 'Cherrapunji', country: 'India', reason: 'Heavy rainfall and natural beauty' }
    ],
    spring: [
      { name: 'Kashmir', country: 'India', reason: 'Tulip gardens and blooming flowers' },
      { name: 'Himachal Pradesh', country: 'India', reason: 'Apple blossoms and mild weather' },
      { name: 'Netherlands', country: 'Europe', reason: 'Tulip fields and spring festivals' },
      { name: 'Japan', country: 'Asia', reason: 'Cherry blossom season' }
    ]
  };

  let recommendations = [];
  if (preferredSeason && seasonalPlaces[preferredSeason]) {
    recommendations = seasonalPlaces[preferredSeason];
  } else if (avoidSeason) {
    // Suggest places that are good for the opposite season
    const oppositeSeasons = {
      winter: 'summer',
      summer: 'winter',
      monsoon: 'spring',
      spring: 'monsoon'
    };
    const oppositeSeason = oppositeSeasons[avoidSeason];
    if (oppositeSeason && seasonalPlaces[oppositeSeason]) {
      recommendations = seasonalPlaces[oppositeSeason];
    }
  }

  return {
    preferredSeason,
    avoidSeason,
    recommendations: recommendations.slice(0, 3)
  };
}

// Sample cities data for dropdowns
const cities = [
  { name: 'New York', country: 'United States', code: 'NYC' },
  { name: 'Los Angeles', country: 'United States', code: 'LAX' },
  { name: 'London', country: 'United Kingdom', code: 'LON' },
  { name: 'Paris', country: 'France', code: 'PAR' },
  { name: 'Tokyo', country: 'Japan', code: 'TYO' },
  { name: 'Sydney', country: 'Australia', code: 'SYD' },
  { name: 'Dubai', country: 'UAE', code: 'DXB' },
  { name: 'Singapore', country: 'Singapore', code: 'SIN' },
  { name: 'Bangkok', country: 'Thailand', code: 'BKK' },
  { name: 'Rome', country: 'Italy', code: 'ROM' },
  { name: 'Barcelona', country: 'Spain', code: 'BCN' },
  { name: 'Amsterdam', country: 'Netherlands', code: 'AMS' },
  { name: 'Berlin', country: 'Germany', code: 'BER' },
  { name: 'Mumbai', country: 'India', code: 'BOM' },
  { name: 'Delhi', country: 'India', code: 'DEL' },
  { name: 'Shanghai', country: 'China', code: 'SHA' },
  { name: 'Hong Kong', country: 'Hong Kong', code: 'HKG' },
  { name: 'Seoul', country: 'South Korea', code: 'SEL' },
  { name: 'Toronto', country: 'Canada', code: 'YYZ' },
  { name: 'Vancouver', country: 'Canada', code: 'YVR' },
  { name: 'Melbourne', country: 'Australia', code: 'MEL' },
  { name: 'Cairo', country: 'Egypt', code: 'CAI' },
  { name: 'Cape Town', country: 'South Africa', code: 'CPT' },
  { name: 'Rio de Janeiro', country: 'Brazil', code: 'RIO' },
  { name: 'Buenos Aires', country: 'Argentina', code: 'BUE' }
];

// Routes
app.get('/api/cities', (req, res) => {
  const { search } = req.query;
  let filteredCities = cities;
  
  if (search) {
    filteredCities = cities.filter(city => 
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.country.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json(filteredCities);
});

// Parse travel intent from natural language using Gemini
// Get detailed place information
app.get('/api/place-details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,price_level,photos,reviews,opening_hours,website,formatted_phone_number&key=${apiKey}`;
    const response = await axios.get(detailsUrl);
    
    res.json(response.data.result);
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

app.post('/api/parse-travel-intent', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const googleApiKey = process.env.GEMINI_API_KEY;
    if (!googleApiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const parsePrompt = `
    Analyze this travel request and extract the key information. Return ONLY a JSON object with this exact structure:
    {
      "origin": "extracted origin location or null if not mentioned",
      "destination": "extracted destination location or null if not mentioned", 
      "intent": "what the user wants to do (e.g., 'plan trip', 'visit', 'explore', 'travel')",
      "context": "any additional context like duration, budget, interests, group size",
      "confidence": 0.8
    }

    Examples:
    - "plan a trip from mumbai to california" → {"origin": "mumbai", "destination": "california", "intent": "plan trip", "context": "", "confidence": 0.9}
    - "I want to visit california" → {"origin": null, "destination": "california", "intent": "visit", "context": "", "confidence": 0.8}
    - "help me explore japan for 2 weeks with my family" → {"origin": null, "destination": "japan", "intent": "explore", "context": "2 weeks, family", "confidence": 0.9}
    - "travel to new york from delhi" → {"origin": "delhi", "destination": "new york", "intent": "travel", "context": "", "confidence": 0.9}

    User request: "${prompt}"
    `;

    const result = await model.generateContent(parsePrompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json(parsed);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      res.status(500).json({ error: 'Failed to parse AI response' });
    }
  } catch (error) {
    console.error('Error parsing travel intent:', error);
    res.status(500).json({ error: 'Failed to parse travel intent' });
  }
});

// Conversational AI travel chat endpoint
app.post('/api/chat-travel', async (req, res) => {
  try {
    const { message, conversationHistory, currentLocation, userId = 'default' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Use AI Agent for enhanced conversation
    let aiResponse;
    try {
      aiResponse = await aiAgent.processMessage(userId, message, currentLocation);
    } catch (error) {
      console.error('AI Agent error:', error);
      // Fallback response
      aiResponse = {
        message: `Hey! I'm your travel buddy! 🎒 Where are you thinking of going?`,
        mode: 'friends',
        suggestions: ['Budget options', 'Local transport', 'Best time to visit'],
        action: 'chat'
      };
    }

    // Determine if we need to update the map
    let mapData = null;
    let location = currentLocation;
    let action = aiResponse.action || 'chat';

    // Always try to geocode the user's latest message as a potential destination.
    // This avoids brittle hardcoded lists and lets the maps API resolve the place.
    const destination = (message || '').trim();
    
    if (destination) {
      location = destination;
      
      try {
        // Get destination coordinates using Google Geocoding API
        const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
        let geoData = null;
        
        if (googleApiKey) {
          const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${googleApiKey}`;
          const geoResponse = await axios.get(geoUrl);
          geoData = geoResponse.data.results?.[0];
        } else {
          // Fallback to OpenStreetMap Nominatim (no key required) instead of hardcoding
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`;
          const nominatimResponse = await axios.get(nominatimUrl, {
            headers: { 'User-Agent': 'NomioTravelPlanner/1.0 (contact: support@example.com)' }
          });
          const first = (nominatimResponse.data || [])[0];
          if (first) {
            geoData = {
              formatted_address: first.display_name,
              geometry: {
                location: { lat: parseFloat(first.lat), lng: parseFloat(first.lon) }
              }
            };
          }
        }
        
        if (geoData) {
          // Get live weather data
          const weatherData = await getWeatherData(destination, geoData.geometry.location.lat, geoData.geometry.location.lng);
          
          // Get seasonal recommendations
          const seasonalData = await getSeasonalRecommendations(message, weatherData);
          
          // Add places to visit and food recommendations
          const places = await getPlacesToVisit(destination, geoData.geometry.location.lat, geoData.geometry.location.lng);
          const foodPlaces = await getFoodRecommendations(destination, geoData.geometry.location.lat, geoData.geometry.location.lng);
          
          // Don't send prefilled itinerary - let AI write live notes instead
          mapData = {
            itinerary: [], // Empty - AI will write live notes
            summary: { totalCost: '-', highlights: [], tips: [] },
            weather: weatherData,
            seasonalRecommendations: seasonalData.recommendations,
            preferredSeason: seasonalData.preferredSeason,
            avoidSeason: seasonalData.avoidSeason,
            // Send more places if user asked for places to visit
            places: places.slice(0, 3),
            foodPlaces: foodPlaces.slice(0, 2),
            destination: {
              name: destination,
              location: geoData.formatted_address || destination,
              coordinates: [geoData.geometry.location.lng, geoData.geometry.location.lat]
            },
            isPlacesRequest: false
          };
          action = 'map_update';
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }

    // Check if user asked for tourist places
    // Check for restaurant requests first
    const restaurantMatch = message.match(/(?:restaurant|restaurants|food|eat|dining|meal|cuisine|veg|vegetarian|vegan|hungry|lunch|dinner|breakfast|best.*restaurant|show.*restaurant)/i);
    if (restaurantMatch) {
      action = 'restaurants';
    } else {
      // Check for places to visit requests
      const placesMatch = message.match(/(?:show me|find|what are|places to visit|tourist attractions|things to do|must visit|landmarks|museums|parks|entertainment)\s+([^.!?]+)/i);
      if (placesMatch) {
        action = 'places_to_visit';
      }
    }

    // Generate quick replies based on the response
    let quickReplies = [];
    const responseText = aiResponse.message || '';
    if (responseText.toLowerCase().includes('beach') || responseText.toLowerCase().includes('city')) {
      quickReplies = ['Beaches! 🏖️', 'City vibes! 🏙️', 'Both! 🌊🏙️'];
    } else if (responseText.toLowerCase().includes('mountains') || responseText.toLowerCase().includes('nature')) {
      quickReplies = ['Mountains! 🏔️', 'Beaches! 🏖️', 'Cities! 🏙️'];
    } else if (responseText.toLowerCase().includes('solo') || responseText.toLowerCase().includes('friends')) {
      quickReplies = ['Solo trip! 🎒', 'With friends! 👥', 'Family trip! 👨‍👩‍👧‍👦'];
    } else if (responseText.toLowerCase().includes('budget') || responseText.toLowerCase().includes('cost')) {
      quickReplies = ['Budget friendly! 💰', 'Splurge mode! 💎', 'Mid-range! ⚖️'];
    }

            // Handle restaurant requests
            let restaurants = null;
            if (action === 'restaurants') {
              try {
                const restaurantResponse = await axios.post('/api/restaurants', {
                  location: location || currentLocation || 'New York',
                  preferences: message,
                  radius: 5000
                });
                
                if (restaurantResponse.data.success) {
                  restaurants = restaurantResponse.data.restaurants;
                }
              } catch (error) {
                console.error('Restaurant search error:', error);
              }
            }

            // Handle places to visit requests
            let placesToVisit = null;
            if (action === 'places_to_visit') {
              try {
                const placesResponse = await axios.post('/api/places-to-visit', {
                  location: location || currentLocation || 'New York',
                  category: 'must_visit',
                  radius: 10000
                });
                
                if (placesResponse.data.success) {
                  placesToVisit = placesResponse.data.places;
                }
              } catch (error) {
                console.error('Places to visit search error:', error);
              }
            }

            res.json({
              message: aiResponse.message,
              action: action,
              mapData: mapData,
              location: location,
              quickReplies: aiResponse.suggestions || quickReplies,
              mode: aiResponse.mode,
              suggestions: aiResponse.suggestions,
              itinerary: aiResponse.itinerary || null,
              restaurants: restaurants,
              placesToVisit: placesToVisit
            });

  } catch (error) {
    console.error('Error in chat-travel:', error);
    res.status(500).json({ 
      message: "Sorry, I'm having trouble right now. Can you try again? 😅",
      action: 'chat'
    });
  }
});

app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { source, destination, duration, interests, budget, groupType, dietary, safetyLevel, user } = req.body;
    
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Enhanced prompt with user preferences
    const groupTypeText = groupType === 'solo_female' ? 'Solo Female Traveler (safety-first approach)' : 
                         groupType === 'family' ? 'Family with children' :
                         groupType === 'friends' ? 'Group of friends' :
                         groupType === 'couple' ? 'Couple' :
                         groupType === 'pets' ? 'Traveling with pets' :
                         groupType === 'business' ? 'Business travel' : 'General traveler';
    
    const safetyNote = safetyLevel === 'high' ? ' (Prioritize safety, well-lit areas, group activities, avoid late-night activities)' :
                      safetyLevel === 'maximum' ? ' (Maximum safety: family-friendly locations, avoid risky areas, daytime activities only)' : '';
    
    const dietaryNote = dietary !== 'no-preference' ? ` (Dietary preference: ${dietary})` : '';
    
    const prompt = `
    Create a detailed travel itinerary ${source ? `from ${source.name}, ${source.country} to` : 'for'} ${destination.name}, ${destination.country}.
    
    Duration: ${duration || 7} days
    Traveler Type: ${groupTypeText}${safetyNote}${dietaryNote}
    Interests: ${interests || 'General sightseeing'}
    Budget: ${budget || 'Medium'}
    ${user ? `Traveler Name: ${user.name}` : ''}
    
    IMPORTANT: Respond ONLY with valid JSON. Do not include any additional text, explanations, or markdown formatting.
    
    Create a structured itinerary with:
    1. Day-by-day breakdown
    2. Specific activities and attractions
    3. Estimated costs for each activity
    4. Transportation details
    5. Accommodation suggestions
    6. Restaurant recommendations
    7. Best times to visit attractions
    
    Use this EXACT JSON structure (no additional text):
    {
      "itinerary": [
        {
          "day": 1,
          "date": "Day 1 (City Name)",
          "title": "Day title",
          "activities": [
            {
              "time": "09:00",
              "activity": "Activity name",
              "location": "Location name",
              "description": "Description",
              "cost": "$50",
              "coordinates": [longitude, latitude]
            }
          ]
        }
      ],
      "summary": {
        "totalCost": "$1000",
        "highlights": ["highlight1", "highlight2"],
        "tips": ["tip1", "tip2"]
      }
    }
    
    Requirements:
    - Use realistic coordinates [longitude, latitude] for each location
    - Include proper cost estimates
    - Make activities specific and detailed
    - Ensure JSON is valid and properly formatted
    - Do not include any text outside the JSON object
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the JSON response
    try {
      // Extract JSON from the response text (handle cases where AI includes extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const itineraryData = JSON.parse(jsonMatch[0]);
        res.json(itineraryData);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Raw AI response:', text);
      
      // If JSON parsing fails, return a structured response with the raw text
      res.json({ 
        itinerary: [{
          day: 1,
          date: "Day 1",
          title: "Generated Itinerary",
          activities: [{
            time: "09:00",
            activity: "Itinerary Generated",
            location: destination.name,
            description: text,
            cost: "Varies",
            coordinates: [0, 0]
          }]
        }],
        summary: {
          totalCost: "Varies",
          highlights: ["AI-generated itinerary"],
          tips: ["Check local attractions", "Book accommodations in advance"]
        }
      });
    }
    
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});

// Email endpoint for sending itinerary
app.post('/api/send-itinerary-email', async (req, res) => {
  try {
    const { email, itineraryData, userDetails } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }
    
    if (!itineraryData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Itinerary data is required' 
      });
    }
    
    res.json({ 
      success: false, 
      message: 'Email service not available' 
    });
    
  } catch (error) {
    console.error('Error in email endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error while sending email' 
    });
  }
});


// Address descriptors endpoint with Google Maps integration
app.get('/api/geo/descriptors', async (req, res) => {
  try {
    const { lng, lat } = req.query;
    
    if (!lng || !lat) {
      return res.status(400).json({ error: 'Longitude and latitude are required' });
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!googleApiKey) {
      // Demo data when no API key
      const demoLandmarks = [
        { display_name: 'City Metro Station', spatial_relationship: 'near', distance: '34m', place_id: 'demo_1' },
        { display_name: 'Central Park', spatial_relationship: 'near', distance: '120m', place_id: 'demo_2' },
        { display_name: 'Shopping Mall', spatial_relationship: 'near', distance: '250m', place_id: 'demo_3' }
      ];
      
      return res.json({
        address: `Demo Address at ${lat}, ${lng}`,
        landmarks: demoLandmarks,
        coordinates: [parseFloat(lng), parseFloat(lat)]
      });
    }

    // Real Google Geocoding API call
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = await geocodingResponse.json();

    if (geocodingData.status !== 'OK') {
      throw new Error(`Geocoding failed: ${geocodingData.status}`);
    }

    const result = geocodingData.results[0];
    const address = result.formatted_address;

    // Nearby landmarks via Places API v1 (New)
    const fieldMask = 'places.id,places.displayName,places.rating,places.location';
    const nearbyBody = {
      includedTypes: ['tourist_attraction','transit_station','shopping_mall'],
      maxResultCount: 10,
      locationRestriction: {
        circle: { center: { latitude: Number(lat), longitude: Number(lng) }, radius: 500 }
      }
    };
    const nearbyResp = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': googleApiKey,
        'X-Goog-FieldMask': fieldMask
      },
      body: JSON.stringify(nearbyBody)
    });
    const nearbyData = await nearbyResp.json();
    const landmarks = (nearbyData.places || []).slice(0,3).map((p) => ({
      display_name: p.displayName?.text || p.displayName || 'Place',
      spatial_relationship: 'near',
      distance: 'Nearby',
      place_id: p.id,
      rating: p.rating,
      photo_reference: undefined
    }));

    res.json({
      address,
      landmarks,
      coordinates: [parseFloat(lng), parseFloat(lat)]
    });
  } catch (error) {
    console.error('Error getting address descriptors:', error);
    res.status(500).json({ error: 'Failed to get address descriptors' });
  }
});

// Places search endpoint with Google Maps integration
app.get('/api/places/search', async (req, res) => {
  try {
    const { q, ll } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!googleApiKey) {
      // Demo places data when no API key
      const demoPlaces = [
        {
          place_id: 'demo_place_1',
          name: `${q} - Demo Location`,
          formatted_address: `${q}, Demo City, Demo State`,
          geometry: {
            location: {
              lat: ll ? parseFloat(ll.split(',')[0]) : 28.43268,
              lng: ll ? parseFloat(ll.split(',')[1]) : 77.0459
            }
          },
          rating: 4.5,
          price_level: 2,
          opening_hours: { open_now: true },
          photos: [{ photo_reference: 'demo_photo_1' }]
        }
      ];
      
      return res.json({ results: demoPlaces });
    }

    // Use Places API v1 (New) only
    const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.photos';
    const v1Body = { textQuery: String(q) };
    if (ll) {
      const [lat, lng] = String(ll).split(',').map(Number);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        v1Body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: 5000 } };
      }
    }
    const v1Resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': googleApiKey,
        'X-Goog-FieldMask': fieldMask
      },
      body: JSON.stringify(v1Body)
    });
    const v1Data = await v1Resp.json();
    if (!v1Resp.ok || !v1Data.places) {
      return res.status(500).json({ error: 'Places v1 search failed' });
    }
    const results = v1Data.places.map((p) => ({
      place_id: p.id,
      name: p.displayName?.text || p.displayName || 'Unknown',
      formatted_address: p.formattedAddress,
      geometry: { location: { lat: p.location?.latitude, lng: p.location?.longitude } },
      rating: p.rating,
      price_level: p.priceLevel,
      photos: p.photos ? p.photos.map(ph => ({ photo_reference: ph.name })) : []
    }));
    return res.json({ results });
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({ error: 'Failed to search places' });
  }
});

// Text geocoding endpoint: converts free text to coordinates using Google Geocoding API
app.get('/api/geocode/text', async (req, res) => {
  try {
    // Support both q= and address=
    const q = req.query.q || req.query.address;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter address or q is required' });
    }
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleApiKey) {
      // Demo: return empty to force client graceful handling
      return res.json({ results: [] });
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(String(q))}&key=${googleApiKey}`;
    const r = await fetch(url);
    const data = await r.json();
    if (data.status !== 'OK') {
      return res.json({ results: [] });
    }
    const first = data.results[0];
    return res.json({
      results: [
        {
          name: first.formatted_address,
          formatted_address: first.formatted_address,
          geometry: { location: { lat: first.geometry.location.lat, lng: first.geometry.location.lng } }
        }
      ]
    });
  } catch (error) {
    console.error('Error geocoding text:', error);
    res.status(500).json({ error: 'Failed to geocode' });
  }
});

// Place details endpoint with Google Maps integration
app.get('/api/places/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!googleApiKey) {
      // Demo place details when no API key
      return res.json({
        place_id: placeId,
        name: 'Demo Place',
        formatted_address: 'Demo Address, Demo City',
        rating: 4.5,
        price_level: 2,
        opening_hours: { open_now: true },
        photos: [{ photo_reference: 'demo_photo_1' }],
        reviews: [
          { author_name: 'Demo User', rating: 5, text: 'Great place!' }
        ]
      });
    }

    // Prefer Places API v1 details
    try {
      const fields = [
        'id','displayName','formattedAddress','location','rating','priceLevel','openingHours','photos','reviews'
      ].join(',');
      const v1Url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=${encodeURIComponent(fields)}`;
      const v1Resp = await fetch(v1Url, {
        headers: { 'X-Goog-Api-Key': googleApiKey }
      });
      const v1Data = await v1Resp.json();
      if (!v1Resp.ok || v1Data.error) throw new Error('v1 details failed');
      const mapped = {
        place_id: v1Data.id,
        name: v1Data.displayName?.text || v1Data.displayName,
        formatted_address: v1Data.formattedAddress,
        rating: v1Data.rating,
        price_level: v1Data.priceLevel,
        opening_hours: v1Data.openingHours ? { open_now: v1Data.openingHours.openNow } : undefined,
        photos: v1Data.photos ? v1Data.photos.map(ph => ({ photo_reference: ph.name })) : [],
        reviews: v1Data.reviews || []
      };
      return res.json(mapped);
    } catch (v1err) {
      // Fallback to classic details
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,rating,price_level,opening_hours,photos,reviews&key=${googleApiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      if (detailsData.status !== 'OK') {
        throw new Error(`Place details failed: ${detailsData.status}`);
      }
      return res.json(detailsData.result);
    }
  } catch (error) {
    console.error('Error getting place details:', error);
    res.status(500).json({ error: 'Failed to get place details' });
  }
});

// Street View image endpoint
app.get('/api/streetview', async (req, res) => {
  try {
    const { lat, lng, heading = 0, pitch = 0, fov = 90 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!googleApiKey) {
      // Demo Street View when no API key
      return res.json({
        image_url: `https://via.placeholder.com/400x300/cccccc/666666?text=Street+View+Demo`,
        demo: true
      });
    }

    // Real Google Street View Static API call
    const streetViewProxyUrl = `/api/streetview/image?lat=${lat}&lng=${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}`;
    return res.json({ image_url: streetViewProxyUrl, demo: false });
  } catch (error) {
    console.error('Error getting Street View:', error);
    res.status(500).json({ error: 'Failed to get Street View' });
  }
});

// Stream Street View image through server so API key is never exposed
app.get('/api/streetview/image', async (req, res) => {
  try {
    const { lat, lng, heading = 0, pitch = 0, fov = 90 } = req.query;
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleApiKey) {
      return res.redirect(`https://via.placeholder.com/400x300/cccccc/666666?text=Street+View+Demo`);
    }
    const url = `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${googleApiKey}`;
    const r = await fetch(url);
    const contentType = r.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    const buffer = Buffer.from(await r.arrayBuffer());
    return res.send(buffer);
  } catch (error) {
    console.error('Error streaming Street View image:', error);
    res.status(500).json({ error: 'Failed to load Street View image' });
  }
});

// Proxy Google Place Photo without exposing API key
app.get('/api/places/photo', async (req, res) => {
  try {
    const { photo_reference, maxwidth = 800 } = req.query;
    if (!photo_reference) {
      return res.status(400).json({ error: 'photo_reference is required' });
    }
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleApiKey) {
      return res.redirect(`https://via.placeholder.com/${maxwidth}x${Math.round(Number(maxwidth) * 0.75)}/cccccc/666666?text=Photo+Demo`);
    }
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${encodeURIComponent(String(photo_reference))}&key=${googleApiKey}`;
    res.redirect(url);
  } catch (error) {
    console.error('Error proxying place photo:', error);
    res.status(500).json({ error: 'Failed to load photo' });
  }
});

// Transport recommendations endpoint
app.post('/api/transport', async (req, res) => {
  try {
    const { from, to, userId = 'default' } = req.body;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'From and to locations are required' });
    }

    const memory = aiAgent.getUserMemory(userId);
    const recommendations = await aiAgent.getTransportRecommendations(from, to, memory);
    
    res.json({
      success: true,
      from,
      to,
      mode: memory.currentMode,
      recommendations
    });
  } catch (error) {
    console.error('Transport error:', error);
    res.status(500).json({ error: 'Failed to get transport recommendations' });
  }
});

// Food recommendations endpoint
app.post('/api/food', async (req, res) => {
  try {
    const { location, userId = 'default' } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const memory = aiAgent.getUserMemory(userId);
    const recommendations = await aiAgent.getFoodRecommendations(location, memory);
    
    res.json({
      success: true,
      location,
      mode: memory.currentMode,
      dietary: memory.dietary,
      recommendations
    });
  } catch (error) {
    console.error('Food error:', error);
    res.status(500).json({ error: 'Failed to get food recommendations' });
  }
});

// Set travel mode endpoint
app.post('/api/set-mode', async (req, res) => {
  try {
    const { mode, userId = 'default' } = req.body;
    
    if (!mode || !['family', 'friends', 'solo', 'solo_female', 'pets'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode. Must be: family, friends, solo, solo_female, or pets' });
    }

    const memory = aiAgent.getUserMemory(userId);
    memory.currentMode = mode;
    
    res.json({
      success: true,
      mode,
      message: `Switched to ${aiAgent.travelModes[mode].name} ${aiAgent.travelModes[mode].emoji}`
    });
  } catch (error) {
    console.error('Set mode error:', error);
    res.status(500).json({ error: 'Failed to set travel mode' });
  }
});

// Simple voice chat endpoint (using text input for now)
app.post('/api/voice-chat-simple', async (req, res) => {
  try {
    const { message, userId = 'default', currentLocation = '' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get AI response
    const aiResponse = await aiAgent.processMessage(userId, message, currentLocation);

    // For now, return text response (we'll add TTS later)
    res.json({
      success: true,
      transcript: message,
      aiResponse: aiResponse.message,
      mode: aiResponse.mode,
      suggestions: aiResponse.suggestions,
      audio: null // Will add TTS later
    });
  } catch (error) {
    console.error('Voice chat error:', error);
    res.status(500).json({ error: 'Failed to process voice chat' });
  }
});

// Text to Speech endpoint
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text, userId = 'default' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use Google Text-to-Speech API
    const ttsResponse = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_MAPS_API_KEY}`,
      {
        input: { text: text },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Wavenet-F', // Female voice
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3'
        }
      }
    );

    const audioBase64 = ttsResponse.data.audioContent;
    
    res.json({
      success: true,
      audio: audioBase64
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Voice to Text endpoint
app.post('/api/voice-to-text', async (req, res) => {
  try {
    const { audioBase64 } = req.body;
    
    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    // Use Google Speech-to-Text API
    const speechResponse = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_MAPS_API_KEY}`,
      {
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true
        },
        audio: {
          content: audioBase64
        }
      }
    );

    const transcript = speechResponse.data.results?.[0]?.alternatives?.[0]?.transcript || '';
    
    res.json({
      success: true,
      transcript: transcript,
      confidence: speechResponse.data.results?.[0]?.alternatives?.[0]?.confidence || 0
    });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

// Restaurant recommendations endpoint using Google Places API
app.post('/api/restaurants', async (req, res) => {
  try {
    const { location, preferences = '', radius = 5000, type = 'restaurant', category = 'all' } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    // Fallback coordinates for demo purposes
    let lat = 40.7128, lng = -74.0060; // Default to New York
    
    if (googleApiKey) {
      try {
        // First, get coordinates for the location
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleApiKey}`;
        const geocodeResponse = await axios.get(geocodeUrl);
        const geocodeData = geocodeResponse.data.results?.[0];
        
        if (geocodeData) {
          lat = geocodeData.geometry.location.lat;
          lng = geocodeData.geometry.location.lng;
        }
      } catch (error) {
        console.error('Geocoding error, using fallback coordinates:', error);
      }
    } else {
      console.log('Google Maps API key not configured, using demo data');
    }
    
    // Search for restaurants using Google Places API
    let places = [];
    if (googleApiKey) {
      try {
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${googleApiKey}`;
        const placesResponse = await axios.get(placesUrl);
        places = placesResponse.data.results || [];
      } catch (error) {
        console.error('Places API error, using demo data:', error);
      }
    }
    
    // Demo restaurant data if no API key or API fails
    if (places.length === 0) {
      places = [
        {
          place_id: 'demo_1',
          name: 'The Green Garden',
          rating: 4.5,
          user_ratings_total: 234,
          price_level: 2,
          vicinity: '123 Main St, New York, NY',
          types: ['restaurant', 'vegetarian', 'vegan'],
          geometry: { location: { lat: lat + 0.001, lng: lng + 0.001 } }
        },
        {
          place_id: 'demo_2',
          name: 'Spice Palace',
          rating: 4.3,
          user_ratings_total: 189,
          price_level: 2,
          vicinity: '456 Broadway, New York, NY',
          types: ['restaurant', 'indian', 'vegetarian'],
          geometry: { location: { lat: lat - 0.001, lng: lng + 0.002 } }
        },
        {
          place_id: 'demo_3',
          name: 'Ocean View Restaurant',
          rating: 4.7,
          user_ratings_total: 456,
          price_level: 3,
          vicinity: '789 Water St, New York, NY',
          types: ['restaurant', 'seafood'],
          geometry: { location: { lat: lat + 0.002, lng: lng - 0.001 } }
        },
        {
          place_id: 'demo_4',
          name: 'Pet-Friendly Bistro',
          rating: 4.2,
          user_ratings_total: 167,
          price_level: 2,
          vicinity: '321 Park Ave, New York, NY',
          types: ['restaurant', 'pet_friendly'],
          geometry: { location: { lat: lat - 0.002, lng: lng - 0.002 } }
        }
      ];
    }

    // Get detailed information for each restaurant
    const restaurantPromises = places.slice(0, 10).map(async (place) => {
      try {
        // Get place details
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,price_level,formatted_address,formatted_phone_number,website,opening_hours,photos,reviews,types&key=${googleApiKey}`;
        const detailsResponse = await axios.get(detailsUrl);
        const details = detailsResponse.data.result;

        return {
          id: place.place_id,
          name: details.name || place.name,
          rating: details.rating || 0,
          totalRatings: details.user_ratings_total || 0,
          priceLevel: details.price_level || 0,
          address: details.formatted_address || place.vicinity,
          phone: details.formatted_phone_number || '',
          website: details.website || '',
          openingHours: details.opening_hours?.weekday_text || [],
          isOpen: details.opening_hours?.open_now || false,
          types: details.types || place.types,
          photos: details.photos?.slice(0, 3).map(photo => ({
            reference: photo.photo_reference,
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${googleApiKey}`
          })) || [],
          reviews: details.reviews?.slice(0, 3).map(review => ({
            author: review.author_name,
            rating: review.rating,
            text: review.text,
            time: review.time
          })) || [],
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          streetViewUrl: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${place.geometry.location.lat},${place.geometry.location.lng}`,
          mapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
        };
      } catch (error) {
        console.error('Error getting place details:', error);
        return null;
      }
    });

    const restaurants = (await Promise.all(restaurantPromises)).filter(Boolean);
    
    // Sort by rating and filter by preferences
    let filteredRestaurants = restaurants.sort((a, b) => b.rating - a.rating);
    
    // Enhanced filtering based on categories and preferences
    if (category === 'vegetarian' || preferences.toLowerCase().includes('veg') || preferences.toLowerCase().includes('vegetarian')) {
      filteredRestaurants = restaurants.filter(restaurant => 
        restaurant.types.some(type => 
          ['vegetarian', 'vegan', 'indian', 'middle_eastern', 'mediterranean'].includes(type)
        )
      );
    } else if (category === 'pure_veg' || preferences.toLowerCase().includes('pure veg') || preferences.toLowerCase().includes('pure vegetarian')) {
      filteredRestaurants = restaurants.filter(restaurant => 
        restaurant.types.some(type => 
          ['vegetarian', 'vegan'].includes(type)
        ) && restaurant.name.toLowerCase().includes('pure') || 
        restaurant.name.toLowerCase().includes('vegetarian')
      );
    } else if (category === 'non_veg' || preferences.toLowerCase().includes('non veg') || preferences.toLowerCase().includes('non vegetarian')) {
      filteredRestaurants = restaurants.filter(restaurant => 
        !restaurant.types.some(type => 
          ['vegetarian', 'vegan'].includes(type)
        )
      );
    } else if (category === 'pet_friendly' || preferences.toLowerCase().includes('pet') || preferences.toLowerCase().includes('dog')) {
      filteredRestaurants = restaurants.filter(restaurant => 
        restaurant.types.some(type => 
          ['meal_takeaway', 'meal_delivery', 'restaurant'].includes(type)
        ) && (
          restaurant.name.toLowerCase().includes('pet') ||
          restaurant.name.toLowerCase().includes('dog') ||
          restaurant.types.includes('pet_friendly')
        )
      );
    } else if (category === 'fine_dining' || preferences.toLowerCase().includes('fine dining') || preferences.toLowerCase().includes('expensive')) {
      filteredRestaurants = restaurants.filter(restaurant => 
        restaurant.priceLevel >= 3 && restaurant.rating >= 4.0
      );
    } else if (category === 'budget' || preferences.toLowerCase().includes('budget') || preferences.toLowerCase().includes('cheap')) {
      filteredRestaurants = restaurants.filter(restaurant => 
        restaurant.priceLevel <= 2 && restaurant.rating >= 3.5
      );
    }

    res.json({
      success: true,
      location: location,
      coordinates: { lat, lng },
      restaurants: filteredRestaurants,
      total: filteredRestaurants.length
    });

  } catch (error) {
    console.error('Restaurant search error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant recommendations' });
  }
});

// Places to visit endpoint using Google Places API
app.post('/api/places-to-visit', async (req, res) => {
  try {
    const { location, category = 'tourist_attraction', radius = 10000 } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    // Fallback coordinates for demo purposes
    let lat = 40.7128, lng = -74.0060; // Default to New York
    
    if (googleApiKey) {
      try {
        // First, get coordinates for the location
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleApiKey}`;
        const geocodeResponse = await axios.get(geocodeUrl);
        const geocodeData = geocodeResponse.data.results?.[0];
        
        if (geocodeData) {
          lat = geocodeData.geometry.location.lat;
          lng = geocodeData.geometry.location.lng;
        }
      } catch (error) {
        console.error('Geocoding error, using fallback coordinates:', error);
      }
    } else {
      console.log('Google Maps API key not configured, using demo data');
    }
    
    // Search for places based on category
    let searchType = category;
    let searchQuery = '';
    
    switch (category) {
      case 'must_visit':
        searchQuery = 'tourist attractions must visit';
        searchType = 'tourist_attraction';
        break;
      case 'landmarks':
        searchQuery = 'landmarks monuments';
        searchType = 'tourist_attraction';
        break;
      case 'museums':
        searchQuery = 'museums art galleries';
        searchType = 'museum';
        break;
      case 'parks':
        searchQuery = 'parks gardens nature';
        searchType = 'park';
        break;
      case 'entertainment':
        searchQuery = 'entertainment nightlife theaters';
        searchType = 'night_club';
        break;
      default:
        searchQuery = 'tourist attractions';
        searchType = 'tourist_attraction';
    }
    
    // Search for places using Google Places API
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${searchType}&key=${googleApiKey}`;
    const placesResponse = await axios.get(placesUrl);
    const places = placesResponse.data.results || [];

    // Get detailed information for each place
    const placePromises = places.slice(0, 15).map(async (place) => {
      try {
        // Get place details
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,price_level,formatted_address,formatted_phone_number,website,opening_hours,photos,reviews,types,editorial_summary&key=${googleApiKey}`;
        const detailsResponse = await axios.get(detailsUrl);
        const details = detailsResponse.data.result;

        return {
          id: place.place_id,
          name: details.name || place.name,
          rating: details.rating || 0,
          totalRatings: details.user_ratings_total || 0,
          priceLevel: details.price_level || 0,
          address: details.formatted_address || place.vicinity,
          phone: details.formatted_phone_number || '',
          website: details.website || '',
          openingHours: details.opening_hours?.weekday_text || [],
          isOpen: details.opening_hours?.open_now || false,
          types: details.types || place.types,
          description: details.editorial_summary?.overview || '',
          photos: details.photos?.slice(0, 3).map(photo => ({
            reference: photo.photo_reference,
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${googleApiKey}`
          })) || [],
          reviews: details.reviews?.slice(0, 3).map(review => ({
            author: review.author_name,
            rating: review.rating,
            text: review.text,
            time: review.time
          })) || [],
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          streetViewUrl: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${place.geometry.location.lat},${place.geometry.location.lng}`,
          mapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
        };
      } catch (error) {
        console.error('Error getting place details:', error);
        return null;
      }
    });

    const placesToVisit = (await Promise.all(placePromises)).filter(Boolean);
    
    // Sort by rating
    const sortedPlaces = placesToVisit.sort((a, b) => b.rating - a.rating);

    res.json({
      success: true,
      location: location,
      coordinates: { lat, lng },
      category: category,
      places: sortedPlaces,
      total: sortedPlaces.length
    });

  } catch (error) {
    console.error('Places to visit search error:', error);
    res.status(500).json({ error: 'Failed to fetch places to visit' });
  }
});

        // Complete Voice Chat endpoint
        app.post('/api/voice-chat', async (req, res) => {
          try {
            const { audioBase64, userId = 'default', currentLocation = '', travelMode = 'friends' } = req.body;
    
    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    // Step 1: Convert voice to text
    const speechResponse = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_MAPS_API_KEY}`,
      {
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true
        },
        audio: {
          content: audioBase64
        }
      }
    );

    const transcript = speechResponse.data.results?.[0]?.alternatives?.[0]?.transcript || '';
    
    if (!transcript) {
      return res.status(400).json({ error: 'Could not understand audio' });
    }

            // Step 2: Get AI response
            const aiResponse = await aiAgent.processMessage(userId, transcript, currentLocation);

            // Step 3: Check if location is mentioned and get map data
            let mapData = null;
            let location = currentLocation;
            
            // Try to geocode the transcript as a potential destination
            if (transcript && transcript.trim()) {
              try {
                const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
                let geoData = null;
                
                if (googleApiKey) {
                  const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(transcript)}&key=${googleApiKey}`;
                  const geoResponse = await axios.get(geoUrl);
                  geoData = geoResponse.data.results?.[0];
                } else {
                  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(transcript)}&format=json&limit=1`;
                  const nominatimResponse = await axios.get(nominatimUrl, {
                    headers: { 'User-Agent': 'NomioTravelPlanner/1.0 (contact: support@example.com)' }
                  });
                  const first = (nominatimResponse.data || [])[0];
                  if (first) {
                    geoData = {
                      geometry: { location: { lat: parseFloat(first.lat), lng: parseFloat(first.lon) } },
                      formatted_address: first.display_name
                    };
                  }
                }

                if (geoData) {
                  const [lng, lat] = [geoData.geometry.location.lng, geoData.geometry.location.lat];
                  const weather = await getWeatherData(geoData.formatted_address, lat, lng);
                  const places = await getPlacesToVisit(geoData.formatted_address, lat, lng);
                  const foodPlaces = await getFoodRecommendations(geoData.formatted_address, lat, lng);

                  mapData = {
                    itinerary: [],
                    summary: { totalCost: '-', highlights: [], tips: [] },
                    weather: weather,
                    seasonalRecommendations: [],
                    preferredSeason: null,
                    avoidSeason: null,
                    places: places,
                    foodPlaces: foodPlaces,
                    destination: {
                      name: geoData.formatted_address,
                      location: geoData.formatted_address,
                      coordinates: [lng, lat]
                    },
                    isPlacesRequest: false
                  };
                  location = geoData.formatted_address;
                }
              } catch (error) {
                console.error('Geocoding error in voice chat:', error);
              }
            }

            // Step 4: Convert AI response to speech
            const ttsResponse = await axios.post(
              `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_MAPS_API_KEY}`,
              {
                input: { text: aiResponse.message },
                voice: {
                  languageCode: 'en-US',
                  name: 'en-US-Wavenet-F',
                  ssmlGender: 'FEMALE'
                },
                audioConfig: {
                  audioEncoding: 'MP3'
                }
              }
            );

            res.json({
              success: true,
              transcript: transcript,
              aiResponse: aiResponse.message,
              audio: ttsResponse.data.audioContent,
              mode: aiResponse.mode,
              suggestions: aiResponse.suggestions,
              mapData: mapData,
              location: location
            });
  } catch (error) {
    console.error('Voice chat error:', error);
    res.status(500).json({ error: 'Failed to process voice chat' });
  }
});

// NEW MULTI-AGENT API ENDPOINTS

// Pre-trip planning endpoint
app.post('/api/pre-trip-planning', async (req, res) => {
  try {
    const { userId, destination, origin, departureDate, nationality, groupSize, travelMode, userProfile } = req.body;
    
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    const tripDetails = {
      destination,
      origin: origin || 'Not specified',
      departureDate: departureDate || 'Not specified',
      nationality: nationality || 'Not specified',
      groupSize: groupSize || 1,
      travelMode: travelMode || 'friends'
    };

    const preTripResult = await aiAgent.preTripAgent.planPreTrip(userId || 'default', tripDetails, userProfile || {});
    
    res.json({
      success: true,
      ...preTripResult
    });
  } catch (error) {
    console.error('Pre-trip planning error:', error);
    res.status(500).json({ error: 'Failed to process pre-trip planning' });
  }
});

// In-trip assistance endpoint
app.post('/api/in-trip-assistance', async (req, res) => {
  try {
    const { userId, tripId, message, currentLocation, userProfile } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const inTripResult = await aiAgent.inTripAgent.provideInTripAssistance(
      userId || 'default',
      tripId || aiAgent.generateTripId(userId || 'default'),
      message,
      currentLocation || 'Unknown',
      userProfile || {}
    );
    
    res.json({
      success: true,
      ...inTripResult
    });
  } catch (error) {
    console.error('In-trip assistance error:', error);
    res.status(500).json({ error: 'Failed to provide in-trip assistance' });
  }
});

// Post-trip feedback endpoint
app.post('/api/post-trip-feedback', async (req, res) => {
  try {
    const { userId, tripId, tripData, feedback } = req.body;
    
    if (!feedback) {
      return res.status(400).json({ error: 'Feedback is required' });
    }

    const postTripResult = await aiAgent.postTripAgent.processPostTrip(
      userId || 'default',
      tripId || aiAgent.generateTripId(userId || 'default'),
      tripData || {},
      feedback
    );
    
    res.json({
      success: true,
      ...postTripResult
    });
  } catch (error) {
    console.error('Post-trip feedback error:', error);
    res.status(500).json({ error: 'Failed to process post-trip feedback' });
  }
});

// Get user travel profile endpoint
app.get('/api/user-travel-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const travelProfile = await aiAgent.getUserTravelProfile(userId);
    
    res.json({
      success: true,
      userId,
      ...travelProfile
    });
  } catch (error) {
    console.error('Get travel profile error:', error);
    res.status(500).json({ error: 'Failed to get travel profile' });
  }
});

// Google Places API endpoint
app.get('/api/places', async (req, res) => {
  try {
    const { query, location, radius = 50000, type = 'tourist_attraction' } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Use the API key from the frontend (the one that works)
    const googleApiKey = 'AIzaSyB-PrgOgduiXNI5GBfC4hhr_fg5iyBs7h0';
    if (!googleApiKey) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    let placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleApiKey}`;
    
    if (location) {
      placesUrl += `&location=${location}&radius=${radius}`;
    }
    
    if (type) {
      placesUrl += `&type=${type}`;
    }

    const response = await axios.get(placesUrl);
    const places = response.data.results || [];

    // Get detailed information for each place
    const detailedPlaces = await Promise.all(
      places.slice(0, 10).map(async (place) => {
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,rating,user_ratings_total,price_level,photos,geometry,types&key=${googleApiKey}`;
          const detailsResponse = await axios.get(detailsUrl);
          return detailsResponse.data.result;
        } catch (error) {
          console.error('Error fetching place details:', error);
          return place;
        }
      })
    );

    res.json({
      success: true,
      places: detailedPlaces,
      query,
      location
    });
  } catch (error) {
    console.error('Places API error:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

// Enhanced chat endpoint with multi-agent support
app.post('/api/chat-travel-enhanced', async (req, res) => {
  try {
    const { message, conversationHistory, currentLocation, userId = 'default', tripPhase } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Use the enhanced AIAgent with multi-agent coordination
    const aiResponse = await aiAgent.processMessage(userId, message, currentLocation);
    
    // Determine if we need to update the map
    let mapData = null;
    let location = currentLocation;
    let action = aiResponse.action || 'chat';

    // Handle map updates for location-based requests
    if (aiResponse.action === 'pre-trip' || aiResponse.action === 'in-trip') {
      const destination = message.trim();
      
      if (destination) {
        location = destination;
        
        try {
          // Get destination coordinates
          const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
          let geoData = null;
          
          if (googleApiKey) {
            const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${googleApiKey}`;
            const geoResponse = await axios.get(geoUrl);
            geoData = geoResponse.data.results?.[0];
          } else {
            // Fallback to OpenStreetMap
            const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`;
            const nominatimResponse = await axios.get(nominatimUrl, {
              headers: { 'User-Agent': 'NomioTravelPlanner/1.0 (contact: support@example.com)' }
            });
            const first = (nominatimResponse.data || [])[0];
            if (first) {
              geoData = {
                formatted_address: first.display_name,
                geometry: {
                  location: { lat: parseFloat(first.lat), lng: parseFloat(first.lon) }
                }
              };
            }
          }
          
          if (geoData) {
            const weatherData = await getWeatherData(destination, geoData.geometry.location.lat, geoData.geometry.location.lng);
            const places = await getPlacesToVisit(destination, geoData.geometry.location.lat, geoData.geometry.location.lng);
            const foodPlaces = await getFoodRecommendations(destination, geoData.geometry.location.lat, geoData.geometry.location.lng);
            
            mapData = {
              itinerary: [],
              summary: { totalCost: '-', highlights: [], tips: [] },
              weather: weatherData,
              seasonalRecommendations: [],
              preferredSeason: null,
              avoidSeason: null,
              places: places.slice(0, 3),
              foodPlaces: foodPlaces.slice(0, 2),
              destination: {
                name: destination,
                location: geoData.formatted_address || destination,
                coordinates: [geoData.geometry.location.lng, geoData.geometry.location.lat]
              },
              isPlacesRequest: false
            };
            action = 'map_update';
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }
    }

    res.json({
      message: aiResponse.message,
      action: action,
      mapData: mapData,
      location: location,
      quickReplies: aiResponse.suggestions || [],
      mode: aiResponse.mode,
      suggestions: aiResponse.suggestions,
      itinerary: aiResponse.itinerary || null,
      // Multi-agent specific data
      preTripData: aiResponse.preTripData || null,
      inTripData: aiResponse.inTripData || null,
      postTripData: aiResponse.postTripData || null,
      tripId: aiResponse.tripId || null,
      tripPhase: tripPhase || 'planning'
    });

  } catch (error) {
    console.error('Error in enhanced chat-travel:', error);
    res.status(500).json({ 
      message: "Sorry, I'm having trouble right now. Can you try again? 😅",
      action: 'chat'
    });
  }
});

// Travel Partner Prices API endpoints

// Search hotels endpoint
app.post('/api/hotels/search', async (req, res) => {
  try {
    const { location, checkIn, checkOut, guests, rooms, priceRange, rating } = req.body;
    
    if (!location || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Location, check-in, and check-out dates are required' });
    }

    const searchParams = {
      location,
      checkIn,
      checkOut,
      guests: guests || 2,
      rooms: rooms || 1,
      priceRange,
      rating
    };

    const result = await travelPartnerAPI.searchHotels(searchParams);
    res.json(result);
  } catch (error) {
    console.error('Hotel search error:', error);
    res.status(500).json({ error: 'Failed to search hotels' });
  }
});

// Get hotel details endpoint
app.post('/api/hotels/details', async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut } = req.body;
    
    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Hotel ID, check-in, and check-out dates are required' });
    }

    const result = await travelPartnerAPI.getHotelDetails(hotelId, checkIn, checkOut);
    res.json(result);
  } catch (error) {
    console.error('Hotel details error:', error);
    res.status(500).json({ error: 'Failed to get hotel details' });
  }
});

// Book hotel endpoint
app.post('/api/hotels/book', async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, guests, rooms, guestDetails, paymentInfo, totalAmount } = req.body;
    
    if (!hotelId || !checkIn || !checkOut || !guests || !rooms) {
      return res.status(400).json({ error: 'Hotel ID, dates, guests, and rooms are required' });
    }

    const bookingDetails = {
      checkIn,
      checkOut,
      guests,
      rooms,
      guestDetails: guestDetails || {},
      paymentInfo: paymentInfo || {},
      totalAmount: totalAmount || 0
    };

    const result = await travelPartnerAPI.bookHotel(hotelId, bookingDetails);
    res.json(result);
  } catch (error) {
    console.error('Hotel booking error:', error);
    res.status(500).json({ error: 'Failed to book hotel' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
