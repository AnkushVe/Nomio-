const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class InTripAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.activeTrips = new Map(); // Track active trips
  }

  // Main in-trip assistance function
  async provideInTripAssistance(userId, tripId, message, currentLocation, userProfile) {
    try {
      const trip = this.activeTrips.get(tripId) || await this.initializeTrip(tripId, userProfile);
      
      // Analyze the user's message for intent
      const intent = await this.analyzeIntent(message, currentLocation);
      
      let response = {};
      
      switch (intent.type) {
        case 'emergency':
          response = await this.handleEmergency(trip, currentLocation, intent);
          break;
        case 'navigation':
          response = await this.handleNavigation(trip, currentLocation, intent);
          break;
        case 'booking_change':
          response = await this.handleBookingChange(trip, intent);
          break;
        case 'recommendation':
          response = await this.handleRecommendation(trip, currentLocation, intent);
          break;
        case 'translation':
          response = await this.handleTranslation(trip, message, intent);
          break;
        case 'weather':
          response = await this.handleWeather(trip, currentLocation);
          break;
        case 'safety':
          response = await this.handleSafety(trip, currentLocation, userProfile);
          break;
        default:
          response = await this.handleGeneralAssistance(trip, message, currentLocation);
      }
      
      // Update trip status
      this.updateTripStatus(tripId, {
        lastActivity: new Date(),
        currentLocation,
        messageCount: (trip.messageCount || 0) + 1
      });
      
      return {
        success: true,
        tripId,
        response,
        suggestions: this.generateContextualSuggestions(trip, currentLocation, intent),
        emergencyContacts: this.getEmergencyContacts(currentLocation),
        nearbyServices: await this.getNearbyServices(currentLocation, intent)
      };
      
    } catch (error) {
      console.error('InTripAgent error:', error);
      return {
        success: false,
        error: 'Failed to provide in-trip assistance',
        fallback: this.getFallbackResponse(message, currentLocation)
      };
    }
  }

  // Initialize trip tracking
  async initializeTrip(tripId, userProfile) {
    const trip = {
      tripId,
      userProfile,
      startTime: new Date(),
      messageCount: 0,
      locations: [],
      activities: [],
      emergencies: [],
      status: 'active'
    };
    
    this.activeTrips.set(tripId, trip);
    return trip;
  }

  // Analyze user intent
  async analyzeIntent(message, currentLocation) {
    try {
      const prompt = `Analyze this in-trip message and determine the user's intent:
      
      Message: "${message}"
      Current Location: ${currentLocation || 'Unknown'}
      
      Classify as one of these types:
      - emergency: Safety concerns, medical issues, lost, danger
      - navigation: Directions, how to get somewhere, transport
      - booking_change: Flight changes, hotel issues, reservation problems
      - recommendation: Where to eat, what to do, places to visit
      - translation: Language help, communication issues
      - weather: Weather questions, conditions
      - safety: Safety concerns, areas to avoid
      - general: General questions, help needed
      
      Also extract:
      - urgency: high, medium, low
      - location_mentioned: any location mentioned in the message
      - action_needed: what action the user needs
      
      Respond with JSON format.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        return JSON.parse(response.text());
      } catch {
        return {
          type: 'general',
          urgency: 'medium',
          location_mentioned: null,
          action_needed: 'general assistance'
        };
      }
    } catch (error) {
      return {
        type: 'general',
        urgency: 'medium',
        location_mentioned: null,
        action_needed: 'general assistance'
      };
    }
  }

  // Handle emergency situations
  async handleEmergency(trip, currentLocation, intent) {
    const emergencyContacts = this.getEmergencyContacts(currentLocation);
    
    return {
      type: 'emergency',
      message: `🚨 EMERGENCY ASSISTANCE ACTIVATED 🚨
      
      I'm here to help! Here are immediate steps:
      
      📞 Emergency Contacts:
      ${emergencyContacts.map(contact => `• ${contact.name}: ${contact.number}`).join('\n')}
      
      📍 Your Location: ${currentLocation}
      
      🆘 Immediate Actions:
      • Stay calm and safe
      • Call local emergency services
      • Contact your embassy
      • Share your location with trusted contacts
      
      I'm monitoring your situation and can provide specific guidance.`,
      priority: 'high',
      contacts: emergencyContacts,
      actions: [
        'Call local emergency services',
        'Contact embassy',
        'Share location with trusted contacts',
        'Follow safety protocols'
      ]
    };
  }

  // Handle navigation requests
  async handleNavigation(trip, currentLocation, intent) {
    try {
      const prompt = `Provide navigation assistance for someone in ${currentLocation}.
      
      User needs: ${intent.action_needed}
      Destination: ${intent.location_mentioned || 'Not specified'}
      
      Provide:
      - Step-by-step directions
      - Transportation options
      - Estimated time and cost
      - Safety considerations
      - Alternative routes
      
      Be specific and practical.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        type: 'navigation',
        message: response.text(),
        directions: await this.getDetailedDirections(currentLocation, intent.location_mentioned),
        transportOptions: await this.getTransportOptions(currentLocation, intent.location_mentioned),
        safetyTips: this.getNavigationSafetyTips(currentLocation)
      };
    } catch (error) {
      return {
        type: 'navigation',
        message: `I'll help you navigate from ${currentLocation}. Let me get the best route for you.`,
        directions: 'Getting directions...',
        transportOptions: ['Walking', 'Public transport', 'Taxi/Uber'],
        safetyTips: ['Stay aware of surroundings', 'Use well-lit routes', 'Keep phone charged']
      };
    }
  }

  // Handle booking changes
  async handleBookingChange(trip, intent) {
    return {
      type: 'booking_change',
      message: `I'll help you with your booking changes. Let me connect you with the right services:
      
      🏨 Hotel Issues:
      • Contact hotel directly
      • Check booking confirmation
      • Request room changes if needed
      
      ✈️ Flight Changes:
      • Contact airline immediately
      • Check flight status
      • Look for alternative flights
      
      🎫 Activity Bookings:
      • Contact booking provider
      • Check cancellation policies
      • Look for alternatives
      
      I can help you find contact information and alternative options.`,
      actions: [
        'Contact service provider directly',
        'Check booking policies',
        'Look for alternatives',
        'Document all communications'
      ]
    };
  }

  // Handle recommendations
  async handleRecommendation(trip, currentLocation, intent) {
    try {
      const prompt = `Provide personalized recommendations for someone currently in ${currentLocation}.
      
      User profile: ${JSON.stringify(trip.userProfile)}
      Request: ${intent.action_needed}
      
      Suggest:
      - Nearby attractions
      - Restaurants and cafes
      - Activities based on time of day
      - Local experiences
      - Safety considerations
      
      Be specific and practical.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        type: 'recommendation',
        message: response.text(),
        nearbyAttractions: await this.getNearbyAttractions(currentLocation),
        restaurants: await this.getNearbyRestaurants(currentLocation, trip.userProfile),
        activities: await this.getCurrentActivities(currentLocation)
      };
    } catch (error) {
      return {
        type: 'recommendation',
        message: `Here are some great recommendations for ${currentLocation}!`,
        nearbyAttractions: ['Check local tourism office'],
        restaurants: ['Ask locals for recommendations'],
        activities: ['Explore local areas', 'Visit popular spots']
      };
    }
  }

  // Handle translation requests
  async handleTranslation(trip, message, intent) {
    try {
      const prompt = `Help with translation and communication:
      
      Original message: "${message}"
      Context: ${intent.action_needed}
      
      Provide:
      - Translation if needed
      - Common phrases for the situation
      - Cultural communication tips
      - How to ask for help
      - Emergency phrases in local language`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        type: 'translation',
        message: response.text(),
        commonPhrases: this.getCommonPhrases(),
        emergencyPhrases: this.getEmergencyPhrases(),
        culturalTips: this.getCulturalCommunicationTips()
      };
    } catch (error) {
      return {
        type: 'translation',
        message: `I'll help you communicate effectively!`,
        commonPhrases: ['Hello', 'Thank you', 'Excuse me', 'Help'],
        emergencyPhrases: ['Help', 'Emergency', 'Police', 'Hospital'],
        culturalTips: ['Be respectful', 'Use gestures', 'Speak slowly']
      };
    }
  }

  // Handle weather requests
  async handleWeather(trip, currentLocation) {
    try {
      const prompt = `Provide current weather information and recommendations for ${currentLocation}.
      
      Include:
      - Current conditions
      - Temperature and forecast
      - Clothing recommendations
      - Activity suggestions based on weather
      - Safety considerations`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        type: 'weather',
        message: response.text(),
        currentConditions: 'Check weather service',
        recommendations: ['Dress appropriately', 'Stay hydrated', 'Check weather updates']
      };
    } catch (error) {
      return {
        type: 'weather',
        message: `Here's the weather information for ${currentLocation}`,
        currentConditions: 'Check local weather service',
        recommendations: ['Dress for the weather', 'Stay comfortable']
      };
    }
  }

  // Handle safety concerns
  async handleSafety(trip, currentLocation, userProfile) {
    const safetyTips = this.getLocationSpecificSafetyTips(currentLocation, userProfile);
    
    return {
      type: 'safety',
      message: `🛡️ SAFETY ASSISTANCE 🛡️
      
      I'm here to help keep you safe in ${currentLocation}.
      
      ${safetyTips.message}
      
      Emergency Contacts:
      ${this.getEmergencyContacts(currentLocation).map(contact => 
        `• ${contact.name}: ${contact.number}`
      ).join('\n')}
      
      Stay safe and let me know if you need anything!`,
      tips: safetyTips.tips,
      emergencyContacts: this.getEmergencyContacts(currentLocation),
      safeAreas: safetyTips.safeAreas,
      areasToAvoid: safetyTips.areasToAvoid
    };
  }

  // Handle general assistance
  async handleGeneralAssistance(trip, message, currentLocation) {
    try {
      const prompt = `Provide helpful assistance for a traveler in ${currentLocation}.
      
      Message: "${message}"
      User profile: ${JSON.stringify(trip.userProfile)}
      
      Provide practical, helpful advice and suggestions.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        type: 'general',
        message: response.text(),
        suggestions: this.generateGeneralSuggestions(currentLocation),
        resources: this.getLocalResources(currentLocation)
      };
    } catch (error) {
      return {
        type: 'general',
        message: `I'm here to help you in ${currentLocation}! How can I assist you today?`,
        suggestions: ['Ask for directions', 'Find restaurants', 'Get recommendations'],
        resources: ['Local tourism office', 'Hotel concierge', 'Local apps']
      };
    }
  }

  // Helper methods
  getEmergencyContacts(currentLocation) {
    return [
      { name: 'Local Emergency', number: '911' },
      { name: 'Police', number: '911' },
      { name: 'Medical Emergency', number: '911' },
      { name: 'Tourist Helpline', number: 'Check local number' },
      { name: 'Embassy', number: 'Check embassy contact' }
    ];
  }

  async getNearbyServices(currentLocation, intent) {
    // This would integrate with Google Places API or similar
    return {
      hospitals: ['Nearest hospital', 'Emergency clinic'],
      police: ['Police station', 'Tourist police'],
      restaurants: ['Nearby restaurants', 'Emergency food'],
      transport: ['Taxi stand', 'Public transport', 'Rental car']
    };
  }

  generateContextualSuggestions(trip, currentLocation, intent) {
    const suggestions = [];
    
    if (intent.type === 'emergency') {
      suggestions.push('Call emergency services', 'Contact embassy', 'Share location');
    } else if (intent.type === 'navigation') {
      suggestions.push('Get directions', 'Find transport', 'Check traffic');
    } else if (intent.type === 'recommendation') {
      suggestions.push('Find restaurants', 'Discover attractions', 'Check events');
    } else {
      suggestions.push('Ask for help', 'Find services', 'Get recommendations');
    }
    
    return suggestions;
  }

  getFallbackResponse(message, currentLocation) {
    return {
      type: 'general',
      message: `I'm here to help you in ${currentLocation}! Let me know what you need assistance with.`,
      suggestions: ['Emergency help', 'Directions', 'Recommendations', 'Translation']
    };
  }

  updateTripStatus(tripId, updates) {
    const trip = this.activeTrips.get(tripId);
    if (trip) {
      Object.assign(trip, updates);
      this.activeTrips.set(tripId, trip);
    }
  }

  // Additional helper methods would be implemented here
  async getDetailedDirections(from, to) {
    // Integration with Google Maps API
    return 'Getting detailed directions...';
  }

  async getTransportOptions(from, to) {
    return ['Walking', 'Public transport', 'Taxi/Uber', 'Rental car'];
  }

  getNavigationSafetyTips(location) {
    return ['Stay aware of surroundings', 'Use well-lit routes', 'Keep phone charged'];
  }

  async getNearbyAttractions(location) {
    return ['Local attractions', 'Popular spots', 'Hidden gems'];
  }

  async getNearbyRestaurants(location, userProfile) {
    return ['Local restaurants', 'Popular cafes', 'Budget options'];
  }

  async getCurrentActivities(location) {
    return ['Current events', 'Popular activities', 'Local experiences'];
  }

  getCommonPhrases() {
    return ['Hello', 'Thank you', 'Excuse me', 'Help', 'Where is...?'];
  }

  getEmergencyPhrases() {
    return ['Help', 'Emergency', 'Police', 'Hospital', 'I need help'];
  }

  getCulturalCommunicationTips() {
    return ['Be respectful', 'Use gestures', 'Speak slowly', 'Learn basic greetings'];
  }

  getLocationSpecificSafetyTips(location, userProfile) {
    return {
      message: `Safety tips for ${location}`,
      tips: ['Stay aware', 'Avoid dark areas', 'Keep valuables safe'],
      safeAreas: ['Tourist areas', 'Well-lit places'],
      areasToAvoid: ['Check local advisories']
    };
  }

  generateGeneralSuggestions(location) {
    return ['Ask locals', 'Use apps', 'Check tourism office', 'Explore safely'];
  }

  getLocalResources(location) {
    return ['Tourism office', 'Hotel concierge', 'Local apps', 'Emergency services'];
  }
}

module.exports = InTripAgent;
