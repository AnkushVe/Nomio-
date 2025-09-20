const { GoogleGenerativeAI } = require('@google/generative-ai');
const PreTripAgent = require('./agents/PreTripAgent');
const InTripAgent = require('./agents/InTripAgent');
const PostTripAgent = require('./agents/PostTripAgent');

class AIAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.userMemories = new Map();
    
    // Initialize specialized agents
    this.preTripAgent = new PreTripAgent();
    this.inTripAgent = new InTripAgent();
    this.postTripAgent = new PostTripAgent();
    this.travelModes = {
      'family': {
        name: 'Family Mode',
        description: 'Kid-friendly activities, family restaurants, safety-first planning',
        emoji: '👨‍👩‍👧‍👦',
        preferences: ['family-friendly', 'safe', 'educational', 'comfortable']
      },
      'friends': {
        name: 'Friends Mode', 
        description: 'Adventure activities, nightlife, budget-friendly options',
        emoji: '👥',
        preferences: ['adventure', 'nightlife', 'budget', 'social']
      },
      'solo': {
        name: 'Solo Traveler',
        description: 'Flexible itineraries, social opportunities, budget-conscious options',
        emoji: '🎒',
        preferences: ['flexible', 'social', 'budget', 'adventure', 'cultural']
      },
      'solo_female': {
        name: 'Solo Female Traveler',
        description: 'Safety-first itineraries, women-friendly places, emergency features',
        emoji: '👩‍🦰',
        preferences: ['safe', 'women-friendly', 'well-lit', 'public-transport'],
        safetyFeatures: {
          daySafety: ['well-lit areas', 'crowded places', 'women-friendly cafes', 'safe neighborhoods'],
          nightSafety: ['avoid dark alleys', 'use trusted transport', 'stay in well-lit areas', 'inform someone'],
          emergency: ['local police numbers', 'embassy contacts', 'women helplines', 'safe accommodation'],
          cultural: ['dress codes', 'local customs', 'women-only spaces', 'respectful behavior']
        }
      },
      'pets': {
        name: 'Pet-Friendly Mode',
        description: 'Pet-friendly hotels, parks, veterinary services',
        emoji: '🐕',
        preferences: ['pet-friendly', 'parks', 'veterinary', 'outdoor']
      }
    };
  }

  // Get or create user memory
  getUserMemory(userId) {
    if (!this.userMemories.has(userId)) {
      this.userMemories.set(userId, {
        preferences: {},
        travelHistory: [],
        currentMode: 'friends',
        budget: null,
        dietary: 'non-veg',
        groupSize: 1
      });
    }
    return this.userMemories.get(userId);
  }

  // Enhanced prompt with memory and context
  buildPrompt(message, memory, location = null) {
    const mode = this.travelModes[memory.currentMode];
    const context = location ? `\nCurrent location context: ${location}` : '';
    
    return `You are Nomio, an expert AI Travel Planner specializing in ${mode.name} ${mode.emoji}.

${mode.description}

User Profile:
- Travel Mode: ${mode.name}
- Budget: ${memory.budget || 'Not specified'}
- Dietary: ${memory.dietary}
- Group Size: ${memory.groupSize}
- Previous preferences: ${JSON.stringify(memory.preferences)}

${context}

User Message: "${message}"

Respond as a knowledgeable, enthusiastic travel expert. Provide specific, actionable advice including:

1. **Destination-specific recommendations** - Be specific about places, activities, and timing
2. **Safety considerations** - Especially important for solo female travelers
3. **Budget-friendly options** - Include cost estimates and money-saving tips
4. **Best times to visit** - Weather, seasons, events, crowds
5. **Local transportation** - How to get around efficiently
6. **Cultural insights** - Local customs, etiquette, must-know tips
7. **Group-appropriate activities** - Tailored to the travel mode

Be conversational, helpful, and include relevant emojis. Ask follow-up questions to better understand their needs.`;
  }

  // Process message with AI - Enhanced with multi-agent coordination
  async processMessage(userId, message, location = null) {
    try {
      const memory = this.getUserMemory(userId);
      this.updateMemoryFromMessage(memory, message);
      
      // Determine trip phase and route to appropriate agent
      const tripPhase = this.determineTripPhase(message, memory);
      
      // Route to appropriate agent based on trip phase
      if (tripPhase === 'pre-trip') {
        return await this.handlePreTripRequest(userId, message, location, memory);
      } else if (tripPhase === 'in-trip') {
        return await this.handleInTripRequest(userId, message, location, memory);
      } else if (tripPhase === 'post-trip') {
        return await this.handlePostTripRequest(userId, message, memory);
      }
      
      // Check for trip planning requests
      const isPlanningRequest = message.match(/(?:plan|itinerary|schedule|trip|create|generate|organize|arrange|book|reserve|detailed|days?|weekend|week|month)/i);
      
      // Always use Gemini AI for intelligent responses
      const mode = this.travelModes[memory.currentMode];
      let response = '';
      let action = 'chat';
      let itinerary = null;
      
      // Check for restaurant requests
      const isRestaurantRequest = message.match(/(?:restaurant|restaurants|food|eat|dining|meal|cuisine|veg|vegetarian|vegan|hungry|lunch|dinner|breakfast|best.*restaurant|show.*restaurant)/i);
      
      // Check for greetings
      const isGreeting = message.match(/(?:hi|hello|hey|yo|what's up|how are you)/i);
      
      if (isPlanningRequest) {
        // Generate comprehensive trip plan
        itinerary = this.generateTripPlan(message, memory.currentMode, location);
        response = `I'll create a detailed ${memory.currentMode} trip plan for you! ${mode.emoji}\n\n${itinerary.summary}\n\nWould you like me to add more details or adjust anything?`;
        action = 'itinerary';
      } else if (isRestaurantRequest) {
        // Handle restaurant requests
        response = `I'll find the best restaurants for you! ${mode.emoji} Let me search for great dining options in your area.`;
        action = 'restaurants';
      } else {
        // Always use Gemini AI for intelligent responses
        try {
          const prompt = this.buildPrompt(message, memory, location);
          const result = await this.model.generateContent(prompt);
          const aiResponse = await result.response;
          response = aiResponse.text();
        } catch (error) {
          console.error('Gemini API error:', error);
          // Fallback to mode-specific response
          response = `I'm here to help you plan the perfect ${mode.name.toLowerCase()} trip! ${mode.emoji} What destination are you considering?`;
        }
      }
      
      // Remove all hardcoded responses - use this as fallback only
      if (false && message.toLowerCase().includes('paris')) {
        if (memory.currentMode === 'solo_female') {
          response = `Paris is perfect for solo female travel! 🗼 

🛡️ SAFETY TIPS FOR PARIS:
• Day: Stay in Marais, Saint-Germain, or Latin Quarter (well-lit, crowded)
• Night: Avoid Châtelet-Les Halles at night, use Uber/taxi after 10pm
• Transport: Metro is safe during day, avoid empty cars at night
• Emergency: Police 17, Women's helpline 3919
• Dress: Smart casual, avoid flashy jewelry

What's your vibe - art museums or charming cafes? 👩‍🦰`;
        } else if (memory.currentMode === 'solo') {
          response = `Paris solo! 🎒 Perfect for exploring at your own pace! I'll find social hostels, meetup spots, and flexible itineraries. What interests you - art, food, or nightlife?`;
        } else if (memory.currentMode === 'family') {
          response = `Paris with family! 👨‍👩‍👧‍👦 Great choice! I'll find kid-friendly spots like Disneyland Paris and safe neighborhoods. What ages are your kids?`;
        } else if (memory.currentMode === 'pets') {
          response = `Pet-friendly Paris! 🐕 I'll find dog parks, pet-friendly hotels, and restaurants that welcome your furry friend!`;
        } else {
          response = `Paris with friends! 👥 Amazing choice! I'll find the best nightlife, budget spots, and group activities. What's your budget range?`;
        }
      } else if (message.toLowerCase().includes('california')) {
        if (memory.currentMode === 'solo_female') {
          response = `California solo! 🌴 Perfect for women travelers!

🛡️ SAFETY TIPS FOR CALIFORNIA:
• Day: SF Union Square, LA Beverly Hills, San Diego Gaslamp (safe, well-lit)
• Night: Avoid downtown LA after dark, SF Tenderloin area
• Transport: Uber/Lyft recommended, avoid walking alone at night
• Emergency: 911, Women's safety apps recommended
• Beach: Santa Monica, Venice Beach (crowded, safe during day)

What interests you - beaches, cities, or nature? 👩‍🦰`;
        } else {
          response = `California! ${mode.emoji} Perfect for ${mode.name}! I'll find ${mode.preferences.join(', ')} spots. Beach or mountains?`;
        }
      } else if (message.toLowerCase().includes('tokyo') || message.toLowerCase().includes('japan')) {
        if (memory.currentMode === 'solo_female') {
          response = `Tokyo solo! 🗼 Amazing choice for women travelers!

🛡️ SAFETY TIPS FOR TOKYO:
• Day: Shibuya, Harajuku, Ginza (very safe, well-lit, crowded)
• Night: Avoid Roppongi after midnight, stick to main areas
• Transport: Trains are extremely safe, even at night
• Emergency: 110 (police), 119 (ambulance)
• Culture: Very respectful, women-only train cars available
• Accommodation: Capsule hotels have women-only floors

What interests you - temples, shopping, or food? 👩‍🦰`;
        } else {
          response = `Tokyo! ${mode.emoji} Perfect for ${mode.name}! I'll find ${mode.preferences.join(', ')} spots. What interests you?`;
        }
      } else if (message.toLowerCase().includes('india') || message.toLowerCase().includes('delhi') || message.toLowerCase().includes('mumbai')) {
        if (memory.currentMode === 'solo_female') {
          response = `India solo! 🕌 Great choice with extra precautions!

🛡️ SAFETY TIPS FOR INDIA:
• Day: Stay in tourist areas, use reputable hotels
• Night: Avoid walking alone, use hotel transport
• Transport: Pre-booked cars, avoid public transport at night
• Emergency: 100 (police), 1091 (women helpline)
• Dress: Cover shoulders/knees, avoid revealing clothes
• Areas: Delhi CP, Mumbai Bandra, Goa beaches (safer)

Which city interests you? 👩‍🦰`;
        } else {
          response = `India! ${mode.emoji} Perfect for ${mode.name}! I'll find ${mode.preferences.join(', ')} spots. Which city?`;
        }
      } else if (message.toLowerCase().includes('solo') || message.toLowerCase().includes('alone')) {
        if (message.toLowerCase().includes('female') || message.toLowerCase().includes('woman')) {
          memory.currentMode = 'solo_female';
          response = `Solo female travel! 👩‍🦰 I'll make sure to find safe, women-friendly places for you. 

🛡️ I'll provide:
• Safe neighborhoods & areas to avoid
• Day vs night safety tips
• Emergency contacts & helplines
• Women-friendly accommodations
• Cultural safety guidelines

Where are you thinking of going?`;
        } else {
          memory.currentMode = 'solo';
          response = `Solo travel! 🎒 I'll find flexible, social opportunities and budget-friendly options for you. Where are you thinking of going?`;
        }
      } else if (message.toLowerCase().includes('family') || message.toLowerCase().includes('kids')) {
        memory.currentMode = 'family';
        response = `Family trip! 👨‍👩‍👧‍👦 I'll find kid-friendly activities and safe places. Where would you like to go?`;
      } else if (isGreeting) {
        // Personalized greeting based on travel mode and memory
        const greetings = {
          'family': `Hey there! 👨‍👩‍👧‍👦 Ready to plan an amazing family adventure? I'll help you find kid-friendly spots and safe activities!`,
          'friends': `What's up! 👥 Let's plan an epic trip with your crew! I'll find the best hangout spots and group activities!`,
          'solo': `Hey traveler! 🎒 Ready for your next solo adventure? I'll help you find social spots and flexible itineraries!`,
          'solo_female': `Hi! 👩‍🦰 I'm here to help you plan a safe and amazing solo trip! I'll focus on women-friendly places and safety tips!`,
          'pets': `Hey! 🐕 Ready to plan a pet-friendly getaway? I'll find places where your furry friend is welcome!`
        };
        response = greetings[memory.currentMode] || `Hey! ${mode.emoji} Ready to plan your next adventure?`;
      } else if (message.length < 10) {
        // Handle short messages
        response = `I see you mentioned "${message}" - tell me more! Are you thinking of a specific place or activity? ${mode.emoji}`;
      } else {
        // Use Gemini AI for more intelligent responses
        try {
          const prompt = this.buildPrompt(message, memory, location);
          const result = await this.model.generateContent(prompt);
          const aiResponse = await result.response;
          response = aiResponse.text();
        } catch (error) {
          console.error('Gemini API error:', error);
          // More varied fallback responses based on message content
          const fallbackResponses = [
            `I'd love to help you plan an amazing ${mode.name.toLowerCase()} adventure! ${mode.emoji} What destination interests you?`,
            `Let's plan something awesome for your ${mode.name.toLowerCase()} trip! ${mode.emoji} Where would you like to explore?`,
            `Ready to discover new places together! ${mode.emoji} Tell me about your dream destination!`,
            `I'm excited to help you plan the perfect getaway! ${mode.emoji} What's on your travel wishlist?`,
            `Let's create an unforgettable ${mode.name.toLowerCase()} experience! ${mode.emoji} Where should we start?`
          ];
          response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }
      }
      
      return {
        message: response,
        mode: memory.currentMode,
        suggestions: this.generateSuggestions(memory),
        action: action,
        itinerary: itinerary
      };
    } catch (error) {
      console.error('AI Agent error:', error);
      const memory = this.getUserMemory(userId);
      this.updateMemoryFromMessage(memory, message);
      
      // More varied fallback responses
      const fallbackResponses = [
        `I'm here to help you plan an amazing trip! ${this.travelModes[memory.currentMode].emoji} What destination interests you?`,
        `Let's plan something awesome! ${this.travelModes[memory.currentMode].emoji} Where would you like to explore?`,
        `Ready to discover new places! ${this.travelModes[memory.currentMode].emoji} Tell me about your dream destination!`,
        `I'd love to help you plan the perfect getaway! ${this.travelModes[memory.currentMode].emoji} What's on your travel wishlist?`
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return {
        message: randomResponse,
        mode: memory.currentMode,
        suggestions: this.generateSuggestions(memory),
        action: 'chat'
      };
    }
  }

  // Generate comprehensive trip plan
  generateTripPlan(message, travelMode, location) {
    const mode = this.travelModes[travelMode];
    const days = this.extractDays(message) || 3;
    const destination = this.extractDestination(message) || location || 'your chosen destination';
    
    const itinerary = {
      destination: destination,
      duration: days,
      travelMode: travelMode,
      totalCost: this.estimateCost(travelMode, days),
      summary: `Perfect ${mode.name} trip to ${destination} for ${days} days! ${mode.emoji}`,
      days: this.generateDailyItinerary(destination, days, travelMode),
      highlights: this.generateHighlights(destination, travelMode),
      tips: this.generateTips(travelMode),
      accommodations: this.generateAccommodations(destination, travelMode),
      transportation: this.generateTransportation(destination, travelMode),
      budget: this.generateBudgetBreakdown(travelMode, days)
    };
    
    return itinerary;
  }

  extractDays(message) {
    const dayMatch = message.match(/(\d+)\s*(?:days?|day)/i);
    if (dayMatch) return parseInt(dayMatch[1]);
    
    if (message.includes('weekend')) return 2;
    if (message.includes('week')) return 7;
    if (message.includes('month')) return 30;
    
    return 3; // default
  }

  extractDestination(message) {
    // Simple destination extraction - could be enhanced with NLP
    const destinations = ['paris', 'tokyo', 'london', 'new york', 'california', 'bali', 'thailand', 'italy', 'spain', 'germany'];
    for (const dest of destinations) {
      if (message.toLowerCase().includes(dest)) {
        return dest.charAt(0).toUpperCase() + dest.slice(1);
      }
    }
    return null;
  }

  estimateCost(travelMode, days) {
    const baseCosts = {
      'family': 200,
      'friends': 150,
      'solo': 100,
      'solo_female': 120,
      'pets': 180
    };
    return `$${baseCosts[travelMode] * days} - $${baseCosts[travelMode] * days * 1.5}`;
  }

  generateDailyItinerary(destination, days, travelMode) {
    const activities = {
      'family': ['Museums', 'Parks', 'Family restaurants', 'Educational sites', 'Zoos', 'Aquariums'],
      'friends': ['Nightlife', 'Adventure activities', 'Group tours', 'Bars', 'Clubs', 'Sports'],
      'solo': ['Walking tours', 'Cafes', 'Museums', 'Local meetups', 'Photography spots', 'Markets'],
      'solo_female': ['Safe neighborhoods', 'Women-friendly cafes', 'Museums', 'Shopping', 'Well-lit areas', 'Group tours'],
      'pets': ['Dog parks', 'Pet-friendly restaurants', 'Outdoor activities', 'Pet stores', 'Veterinary clinics', 'Beaches']
    };
    
    const dailyPlans = [];
    for (let i = 1; i <= days; i++) {
      dailyPlans.push({
        day: i,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        title: `Day ${i} in ${destination}`,
        activities: activities[travelMode].slice(0, 4).map(activity => ({
          time: `${9 + Math.floor(Math.random() * 8)}:00`,
          activity: activity,
          location: `${destination} ${activity.toLowerCase()}`,
          duration: '2-3 hours',
          cost: `$${20 + Math.floor(Math.random() * 50)}`
        }))
      });
    }
    return dailyPlans;
  }

  generateHighlights(destination, travelMode) {
    const highlights = {
      'family': [`Visit ${destination} with kids`, 'Family-friendly attractions', 'Safe neighborhoods', 'Educational experiences'],
      'friends': [`${destination} nightlife`, 'Adventure activities', 'Group experiences', 'Social hotspots'],
      'solo': [`Solo exploration of ${destination}`, 'Local culture immersion', 'Flexible schedule', 'Personal growth'],
      'solo_female': [`Safe solo travel in ${destination}`, 'Women-friendly spots', 'Empowering experiences', 'Cultural immersion'],
      'pets': [`Pet-friendly ${destination}`, 'Outdoor adventures', 'Pet services', 'Family bonding']
    };
    return highlights[travelMode];
  }

  generateTips(travelMode) {
    const tips = {
      'family': ['Book family-friendly hotels', 'Pack snacks for kids', 'Plan rest breaks', 'Check age restrictions'],
      'friends': ['Book group activities', 'Share costs', 'Plan transportation', 'Stay flexible'],
      'solo': ['Stay in hostels for socializing', 'Use public transport', 'Keep emergency contacts', 'Trust your instincts'],
      'solo_female': ['Share location with someone', 'Avoid walking alone at night', 'Use trusted transport', 'Stay in well-lit areas'],
      'pets': ['Check pet policies', 'Pack pet supplies', 'Find pet-friendly hotels', 'Locate nearby vets']
    };
    return tips[travelMode];
  }

  generateAccommodations(destination, travelMode) {
    const accommodations = {
      'family': ['Family suites', 'Apartments with kitchens', 'Hotels with pools', 'Near attractions'],
      'friends': ['Hostels', 'Shared apartments', 'Budget hotels', 'Near nightlife'],
      'solo': ['Hostels', 'Boutique hotels', 'Airbnb', 'Near public transport'],
      'solo_female': ['Women-only hostels', 'Safe neighborhoods', 'Well-lit areas', 'Near public transport'],
      'pets': ['Pet-friendly hotels', 'Apartments with yards', 'Near parks', 'Pet services available']
    };
    return accommodations[travelMode];
  }

  generateTransportation(destination, travelMode) {
    const transport = {
      'family': ['Rental car', 'Family passes', 'Taxis', 'Public transport'],
      'friends': ['Group transport', 'Rideshare', 'Public transport', 'Walking'],
      'solo': ['Public transport', 'Walking', 'Bike rental', 'Rideshare'],
      'solo_female': ['Safe transport options', 'Public transport', 'Trusted taxis', 'Well-lit routes'],
      'pets': ['Pet-friendly transport', 'Car rental', 'Walking routes', 'Pet carriers']
    };
    return transport[travelMode];
  }

  generateBudgetBreakdown(travelMode, days) {
    const baseCost = {
      'family': 200,
      'friends': 150,
      'solo': 100,
      'solo_female': 120,
      'pets': 180
    };
    
    const dailyCost = baseCost[travelMode];
    return {
      accommodation: `$${dailyCost * 0.4 * days}`,
      food: `$${dailyCost * 0.3 * days}`,
      activities: `$${dailyCost * 0.2 * days}`,
      transportation: `$${dailyCost * 0.1 * days}`,
      total: `$${dailyCost * days}`
    };
  }

  // Update memory based on user message
  updateMemoryFromMessage(memory, message) {
    const lowerMessage = message.toLowerCase();
    
    // Detect travel mode changes
    if (lowerMessage.includes('family') || lowerMessage.includes('kids')) {
      memory.currentMode = 'family';
    } else if (lowerMessage.includes('solo') || lowerMessage.includes('alone')) {
      memory.currentMode = 'solo_female';
    } else if (lowerMessage.includes('pet') || lowerMessage.includes('dog')) {
      memory.currentMode = 'pets';
    }
    
    // Detect budget mentions
    if (lowerMessage.includes('budget') || lowerMessage.includes('₹') || lowerMessage.includes('$')) {
      const budgetMatch = message.match(/(₹|\$)?(\d+)/);
      if (budgetMatch) {
        memory.budget = budgetMatch[0];
      }
    }
    
    // Detect dietary preferences
    if (lowerMessage.includes('veg') || lowerMessage.includes('vegetarian')) {
      memory.dietary = 'vegetarian';
    } else if (lowerMessage.includes('jain')) {
      memory.dietary = 'jain';
    } else if (lowerMessage.includes('halal')) {
      memory.dietary = 'halal';
    }
  }

  // Generate contextual suggestions
  generateSuggestions(memory) {
    const mode = this.travelModes[memory.currentMode];
    const suggestions = [];
    
    if (memory.currentMode === 'solo_female') {
      suggestions.push('🛡️ Safety tips', '👩‍🦰 Women-friendly places', '🚨 Emergency contacts', '🌙 Night safety', '🚕 Safe transport', '🏨 Women-only hostels');
    } else if (memory.currentMode === 'solo') {
      suggestions.push('Social hostels', 'Meetup spots', 'Flexible itineraries');
    } else if (memory.currentMode === 'family') {
      suggestions.push('Kid-friendly activities', 'Family restaurants', 'Educational sites');
    } else if (memory.currentMode === 'pets') {
      suggestions.push('Pet-friendly hotels', 'Dog parks', 'Veterinary services');
    }
    
    suggestions.push('Budget options', 'Local transport', 'Best time to visit');
    return suggestions;
  }

  // Determine action based on message
  determineAction(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('flight') || lowerMessage.includes('travel') || lowerMessage.includes('to ')) {
      return 'transport';
    } else if (lowerMessage.includes('eat') || lowerMessage.includes('food') || lowerMessage.includes('restaurant')) {
      return 'food';
    } else if (lowerMessage.includes('place') || lowerMessage.includes('visit') || lowerMessage.includes('see')) {
      return 'places';
    } else if (lowerMessage.includes('hotel') || lowerMessage.includes('stay')) {
      return 'accommodation';
    }
    
    return 'chat';
  }

  // Get transport recommendations
  async getTransportRecommendations(from, to, memory) {
    const mode = this.travelModes[memory.currentMode];
    
    const prompt = `Plan transport from ${from} to ${to} for ${mode.name}.

Consider:
- Safety (especially for solo female travelers)
- Budget: ${memory.budget || 'Not specified'}
- Group size: ${memory.groupSize}
- Preferences: ${mode.preferences.join(', ')}

Provide specific recommendations for:
1. Flights (with airlines, timing, safety)
2. Trains (if applicable)
3. Buses (if applicable)
4. Local transport at destination

Format as JSON with options array.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      return {
        options: [
          {
            type: 'flight',
            airline: 'Multiple options available',
            price: 'Check current rates',
            safety: mode.name === 'Solo Female Traveler' ? 'High' : 'Standard',
            note: 'Book in advance for better rates'
          }
        ]
      };
    }
  }

  // Get food recommendations
  async getFoodRecommendations(location, memory) {
    const mode = this.travelModes[memory.currentMode];
    
    const prompt = `Recommend restaurants in ${location} for ${mode.name}.

Dietary: ${memory.dietary}
Budget: ${memory.budget || 'Not specified'}
Group size: ${memory.groupSize}

Focus on:
- ${mode.preferences.join(', ')}
- ${memory.dietary} options
- Safety considerations
- Local specialties

Provide 5-7 specific restaurant recommendations with:
- Name and cuisine type
- Price range
- Safety rating
- Special features`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      return `Here are some great ${memory.dietary} restaurants in ${location} perfect for ${mode.name}! 🍽️`;
    }
  }

  // NEW MULTI-AGENT METHODS

  // Determine which phase of travel the user is in
  determineTripPhase(message, memory) {
    const lowerMessage = message.toLowerCase();
    
    // Pre-trip indicators
    if (lowerMessage.includes('visa') || lowerMessage.includes('vaccination') || 
        lowerMessage.includes('before') || lowerMessage.includes('prepare') ||
        lowerMessage.includes('document') || lowerMessage.includes('insurance') ||
        lowerMessage.includes('packing') || lowerMessage.includes('planning')) {
      return 'pre-trip';
    }
    
    // In-trip indicators
    if (lowerMessage.includes('here') || lowerMessage.includes('currently') ||
        lowerMessage.includes('now') || lowerMessage.includes('emergency') ||
        lowerMessage.includes('help') || lowerMessage.includes('lost') ||
        lowerMessage.includes('directions') || lowerMessage.includes('nearby') ||
        memory.currentTripId) {
      return 'in-trip';
    }
    
    // Post-trip indicators
    if (lowerMessage.includes('feedback') || lowerMessage.includes('review') ||
        lowerMessage.includes('experience') || lowerMessage.includes('trip was') ||
        lowerMessage.includes('loved') || lowerMessage.includes('hated') ||
        lowerMessage.includes('next time') || lowerMessage.includes('recommend')) {
      return 'post-trip';
    }
    
    // Default to general planning
    return 'planning';
  }

  // Handle pre-trip requests
  async handlePreTripRequest(userId, message, location, memory) {
    try {
      // Extract trip details from message
      const tripDetails = this.extractTripDetails(message, memory);
      
      // Get user profile
      const userProfile = {
        nationality: memory.nationality || 'Not specified',
        age: memory.age || 'Not specified',
        medicalConditions: memory.medicalConditions || 'None',
        allergies: memory.allergies || 'None',
        dietary: memory.dietary || 'Not specified',
        gender: memory.gender || 'Not specified'
      };
      
      // Call PreTripAgent
      const preTripResult = await this.preTripAgent.planPreTrip(userId, tripDetails, userProfile);
      
      return {
        message: `🛫 PRE-TRIP PLANNING ACTIVATED! 🛫\n\nI'm gathering all the essential information you need before your trip to ${tripDetails.destination}!\n\n${preTripResult.preTripInfo ? 'Here\'s what I found:' : 'Let me help you prepare!'}`,
        mode: memory.currentMode,
        suggestions: ['Visa requirements', 'Medical advisories', 'Travel alerts', 'Packing list'],
        action: 'pre-trip',
        preTripData: preTripResult,
        tripId: preTripResult.tripId
      };
    } catch (error) {
      console.error('Pre-trip handling error:', error);
      return {
        message: `I'll help you prepare for your trip! What destination are you planning to visit?`,
        mode: memory.currentMode,
        suggestions: ['Visa requirements', 'Medical info', 'Travel alerts', 'Packing tips'],
        action: 'pre-trip'
      };
    }
  }

  // Handle in-trip requests
  async handleInTripRequest(userId, message, location, memory) {
    try {
      const tripId = memory.currentTripId || this.generateTripId(userId);
      
      // Call InTripAgent
      const inTripResult = await this.inTripAgent.provideInTripAssistance(
        userId, tripId, message, location, memory
      );
      
      return {
        message: inTripResult.response.message || `I'm here to help you during your trip!`,
        mode: memory.currentMode,
        suggestions: inTripResult.suggestions || ['Emergency help', 'Directions', 'Recommendations'],
        action: 'in-trip',
        inTripData: inTripResult,
        tripId: tripId
      };
    } catch (error) {
      console.error('In-trip handling error:', error);
      return {
        message: `I'm here to help you during your trip! What do you need assistance with?`,
        mode: memory.currentMode,
        suggestions: ['Emergency help', 'Directions', 'Recommendations', 'Translation'],
        action: 'in-trip'
      };
    }
  }

  // Handle post-trip requests
  async handlePostTripRequest(userId, message, memory) {
    try {
      const tripId = memory.currentTripId || this.generateTripId(userId);
      
      // Extract feedback from message
      const feedback = this.extractFeedback(message);
      
      // Get trip data from memory
      const tripData = memory.tripData || {
        destination: 'Unknown',
        duration: 'Not specified',
        budget: 'Not specified',
        activities: []
      };
      
      // Call PostTripAgent
      const postTripResult = await this.postTripAgent.processPostTrip(
        userId, tripId, tripData, feedback
      );
      
      return {
        message: `🏠 POST-TRIP FEEDBACK PROCESSED! 🏠\n\nThank you for sharing your experience! I'm learning from your feedback to make future trips even better.\n\n${postTripResult.tripSummary ? 'Here\'s your trip summary:' : 'Your feedback has been recorded!'}`,
        mode: memory.currentMode,
        suggestions: ['Plan next trip', 'Share experience', 'Leave reviews', 'Get recommendations'],
        action: 'post-trip',
        postTripData: postTripResult,
        tripId: tripId
      };
    } catch (error) {
      console.error('Post-trip handling error:', error);
      return {
        message: `Thank you for sharing your trip experience! How was your trip?`,
        mode: memory.currentMode,
        suggestions: ['Share feedback', 'Plan next trip', 'Get recommendations'],
        action: 'post-trip'
      };
    }
  }

  // Extract trip details from message
  extractTripDetails(message, memory) {
    const destination = this.extractDestination(message) || memory.lastDestination || 'Unknown';
    const origin = memory.origin || 'Not specified';
    const departureDate = this.extractDate(message) || 'Not specified';
    const nationality = memory.nationality || 'Not specified';
    const groupSize = memory.groupSize || 1;
    const travelMode = memory.currentMode || 'friends';
    
    return {
      destination,
      origin,
      departureDate,
      nationality,
      groupSize,
      travelMode
    };
  }

  // Extract feedback from message
  extractFeedback(message) {
    return {
      message: message,
      timestamp: new Date(),
      sentiment: this.analyzeSentiment(message),
      rating: this.extractRating(message),
      comments: message
    };
  }

  // Analyze sentiment of feedback
  analyzeSentiment(message) {
    const positiveWords = ['great', 'amazing', 'wonderful', 'excellent', 'loved', 'enjoyed', 'fantastic'];
    const negativeWords = ['terrible', 'awful', 'hated', 'disappointed', 'bad', 'worst', 'horrible'];
    
    const lowerMessage = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Extract rating from message
  extractRating(message) {
    const ratingMatch = message.match(/(\d+)\/10|(\d+)\s*stars?|rating\s*(\d+)/i);
    if (ratingMatch) {
      return parseInt(ratingMatch[1] || ratingMatch[2] || ratingMatch[3]);
    }
    return null;
  }

  // Extract date from message
  extractDate(message) {
    const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|tomorrow|next week|next month)/i);
    if (dateMatch) {
      return dateMatch[1];
    }
    return null;
  }

  // Generate trip ID
  generateTripId(userId) {
    return `${userId}_${Date.now()}`;
  }

  // Get user's travel profile (for post-trip analysis)
  async getUserTravelProfile(userId) {
    try {
      return await this.postTripAgent.getUserTravelProfile(userId);
    } catch (error) {
      console.error('Error getting user travel profile:', error);
      return {
        preferences: {},
        tripHistory: [],
        totalTrips: 0,
        favoriteDestinations: [],
        travelPatterns: {},
        recommendations: []
      };
    }
  }
}

module.exports = AIAgent;
