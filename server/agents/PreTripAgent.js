const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class PreTripAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Main pre-trip planning function
  async planPreTrip(userId, tripDetails, userProfile) {
    const { destination, origin, departureDate, nationality, groupSize, travelMode } = tripDetails;
    
    try {
      // Get all pre-trip information in parallel
      const [visaInfo, medicalInfo, travelAlerts, weatherInfo, culturalInfo] = await Promise.all([
        this.getVisaRequirements(destination, nationality),
        this.getMedicalAdvisories(destination, userProfile),
        this.getTravelAlerts(destination),
        this.getWeatherForecast(destination, departureDate),
        this.getCulturalInformation(destination, userProfile)
      ]);

      return {
        success: true,
        tripId: this.generateTripId(userId, destination),
        destination,
        origin,
        departureDate,
        preTripInfo: {
          visa: visaInfo,
          medical: medicalInfo,
          alerts: travelAlerts,
          weather: weatherInfo,
          cultural: culturalInfo,
          packingList: this.generatePackingList(destination, departureDate, travelMode),
          documents: this.generateDocumentChecklist(destination, nationality),
          insurance: this.getInsuranceRecommendations(destination, travelMode),
          budget: this.estimatePreTripCosts(visaInfo, medicalInfo, destination)
        },
        recommendations: this.generatePreTripRecommendations(visaInfo, medicalInfo, travelAlerts),
        timeline: this.generatePreTripTimeline(departureDate, visaInfo, medicalInfo)
      };
    } catch (error) {
      console.error('PreTripAgent error:', error);
      return {
        success: false,
        error: 'Failed to gather pre-trip information',
        fallback: this.getFallbackPreTripInfo(destination, nationality)
      };
    }
  }

  // Get visa requirements
  async getVisaRequirements(destination, nationality) {
    try {
      const prompt = `Provide detailed visa requirements for ${nationality} citizens traveling to ${destination}.
      
      Include:
      - Visa type needed (tourist, business, etc.)
      - Processing time
      - Required documents
      - Application process
      - Fees
      - Validity period
      - Any special requirements
      
      Format as JSON with clear sections.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      // Try to parse JSON, fallback to text
      try {
        return JSON.parse(response.text());
      } catch {
        return {
          summary: response.text(),
          visaRequired: true,
          processingTime: '2-4 weeks',
          documents: ['Passport', 'Application form', 'Photos', 'Travel itinerary'],
          fees: 'Check official website',
          validity: '6 months'
        };
      }
    } catch (error) {
      return {
        summary: `Visa requirements for ${nationality} citizens to ${destination}`,
        visaRequired: true,
        processingTime: '2-4 weeks',
        documents: ['Passport', 'Application form', 'Photos', 'Travel itinerary'],
        fees: 'Check official website',
        validity: '6 months',
        note: 'Please verify with official embassy website'
      };
    }
  }

  // Get medical advisories
  async getMedicalAdvisories(destination, userProfile) {
    try {
      const prompt = `Provide medical advisories and health requirements for traveling to ${destination}.
      
      Consider traveler profile:
      - Age: ${userProfile.age || 'Not specified'}
      - Medical conditions: ${userProfile.medicalConditions || 'None'}
      - Allergies: ${userProfile.allergies || 'None'}
      - Dietary restrictions: ${userProfile.dietary || 'None'}
      
      Include:
      - Required vaccinations
      - Recommended vaccinations
      - Health risks and precautions
      - Medication recommendations
      - Travel insurance requirements
      - Emergency medical contacts
      
      Format as JSON.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        return JSON.parse(response.text());
      } catch {
        return {
          vaccinations: {
            required: ['Check destination requirements'],
            recommended: ['Hepatitis A', 'Hepatitis B', 'Typhoid']
          },
          healthRisks: ['Food and water safety', 'Mosquito-borne diseases'],
          precautions: ['Drink bottled water', 'Use insect repellent', 'Eat cooked food'],
          emergencyContacts: ['Local emergency: 911', 'Embassy contact required'],
          insurance: 'Travel health insurance recommended'
        };
      }
    } catch (error) {
      return {
        vaccinations: {
          required: ['Check destination requirements'],
          recommended: ['Hepatitis A', 'Hepatitis B', 'Typhoid']
        },
        healthRisks: ['Food and water safety', 'Mosquito-borne diseases'],
        precautions: ['Drink bottled water', 'Use insect repellent', 'Eat cooked food'],
        emergencyContacts: ['Local emergency: 911', 'Embassy contact required'],
        insurance: 'Travel health insurance recommended'
      };
    }
  }

  // Get travel alerts
  async getTravelAlerts(destination) {
    try {
      // In a real implementation, you'd integrate with government travel alert APIs
      const prompt = `Provide current travel alerts and safety information for ${destination}.
      
      Include:
      - Current safety level
      - Recent alerts or warnings
      - Areas to avoid
      - Security recommendations
      - Emergency procedures
      - Local laws and customs
      
      Format as JSON.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        return JSON.parse(response.text());
      } catch {
        return {
          safetyLevel: 'Exercise normal precautions',
          alerts: ['Check official travel advisories'],
          areasToAvoid: ['Check local authorities'],
          recommendations: ['Stay aware of surroundings', 'Keep documents safe'],
          emergencyNumbers: ['Police: 911', 'Emergency: 911'],
          laws: ['Respect local customs', 'Follow local laws']
        };
      }
    } catch (error) {
      return {
        safetyLevel: 'Exercise normal precautions',
        alerts: ['Check official travel advisories'],
        areasToAvoid: ['Check local authorities'],
        recommendations: ['Stay aware of surroundings', 'Keep documents safe'],
        emergencyNumbers: ['Police: 911', 'Emergency: 911'],
        laws: ['Respect local customs', 'Follow local laws']
      };
    }
  }

  // Get weather forecast
  async getWeatherForecast(destination, departureDate) {
    try {
      const prompt = `Provide weather forecast and seasonal information for ${destination} around ${departureDate}.
      
      Include:
      - Expected temperature range
      - Weather conditions
      - Seasonal considerations
      - Clothing recommendations
      - Best time to visit
      - Weather-related activities
      
      Format as JSON.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        return JSON.parse(response.text());
      } catch {
        return {
          temperature: 'Check weather service',
          conditions: 'Variable',
          season: 'Check local season',
          clothing: ['Layers recommended', 'Check weather before packing'],
          activities: ['Weather-dependent activities available'],
          bestTime: 'Check destination-specific information'
        };
      }
    } catch (error) {
      return {
        temperature: 'Check weather service',
        conditions: 'Variable',
        season: 'Check local season',
        clothing: ['Layers recommended', 'Check weather before packing'],
        activities: ['Weather-dependent activities available'],
        bestTime: 'Check destination-specific information'
      };
    }
  }

  // Get cultural information
  async getCulturalInformation(destination, userProfile) {
    try {
      const prompt = `Provide cultural information and etiquette for ${destination}.
      
      Consider traveler profile:
      - Nationality: ${userProfile.nationality || 'Not specified'}
      - Dietary: ${userProfile.dietary || 'Not specified'}
      - Gender: ${userProfile.gender || 'Not specified'}
      
      Include:
      - Cultural norms and etiquette
      - Dress codes
      - Religious considerations
      - Language tips
      - Social customs
      - Tipping practices
      - Business etiquette (if applicable)
      
      Format as JSON.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        return JSON.parse(response.text());
      } catch {
        return {
          etiquette: ['Respect local customs', 'Learn basic greetings'],
          dressCode: ['Dress modestly', 'Check religious sites requirements'],
          language: ['Learn basic phrases', 'English may be limited'],
          customs: ['Observe local traditions', 'Be respectful'],
          tipping: ['Check local customs', 'Service charges may be included'],
          business: ['Formal attire for business', 'Punctuality important']
        };
      }
    } catch (error) {
      return {
        etiquette: ['Respect local customs', 'Learn basic greetings'],
        dressCode: ['Dress modestly', 'Check religious sites requirements'],
        language: ['Learn basic phrases', 'English may be limited'],
        customs: ['Observe local traditions', 'Be respectful'],
        tipping: ['Check local customs', 'Service charges may be included'],
        business: ['Formal attire for business', 'Punctuality important']
      };
    }
  }

  // Generate packing list
  generatePackingList(destination, departureDate, travelMode) {
    const baseItems = [
      'Passport and copies',
      'Travel insurance documents',
      'Emergency contacts list',
      'Medications and prescriptions',
      'Phone and charger',
      'Universal adapter',
      'Comfortable walking shoes',
      'Weather-appropriate clothing'
    ];

    const modeSpecificItems = {
      'family': ['Kids\' essentials', 'Entertainment for children', 'Snacks', 'First aid kit'],
      'solo_female': ['Safety items', 'Personal alarm', 'Women\'s health products', 'Emergency cash'],
      'pets': ['Pet food', 'Pet carrier', 'Veterinary records', 'Pet medications'],
      'friends': ['Group activities items', 'Camera', 'Party supplies'],
      'solo': ['Solo travel essentials', 'Journal', 'Books', 'Portable charger']
    };

    return {
      essentials: baseItems,
      modeSpecific: modeSpecificItems[travelMode] || [],
      destination: this.getDestinationSpecificItems(destination),
      seasonal: this.getSeasonalItems(departureDate)
    };
  }

  // Generate document checklist
  generateDocumentChecklist(destination, nationality) {
    return {
      required: [
        'Valid passport (6+ months validity)',
        'Visa (if required)',
        'Travel insurance',
        'Flight tickets',
        'Hotel confirmations'
      ],
      recommended: [
        'International driving permit',
        'Health certificates',
        'Emergency contacts',
        'Copies of all documents',
        'Digital backups'
      ],
      destination: this.getDestinationSpecificDocuments(destination)
    };
  }

  // Get insurance recommendations
  getInsuranceRecommendations(destination, travelMode) {
    const baseCoverage = {
      medical: 'Emergency medical coverage',
      tripCancellation: 'Trip cancellation protection',
      baggage: 'Baggage loss coverage',
      emergency: 'Emergency evacuation'
    };

    const modeSpecific = {
      'solo_female': {
        ...baseCoverage,
        safety: 'Women-specific safety coverage',
        emergency: '24/7 emergency assistance'
      },
      'family': {
        ...baseCoverage,
        family: 'Family coverage options',
        children: 'Children-specific coverage'
      },
      'pets': {
        ...baseCoverage,
        pet: 'Pet travel insurance',
        veterinary: 'Emergency veterinary coverage'
      }
    };

    return modeSpecific[travelMode] || baseCoverage;
  }

  // Estimate pre-trip costs
  estimatePreTripCosts(visaInfo, medicalInfo, destination) {
    return {
      visa: visaInfo.fees || 'Check official website',
      vaccinations: 'Varies by location',
      insurance: '$50-200 depending on coverage',
      documents: '$20-100 for processing',
      total: 'Estimate $100-500 depending on requirements'
    };
  }

  // Generate pre-trip recommendations
  generatePreTripRecommendations(visaInfo, medicalInfo, travelAlerts) {
    const recommendations = [];
    
    if (visaInfo.visaRequired) {
      recommendations.push('Apply for visa well in advance');
    }
    
    if (medicalInfo.vaccinations.required.length > 0) {
      recommendations.push('Schedule required vaccinations');
    }
    
    if (travelAlerts.safetyLevel !== 'Exercise normal precautions') {
      recommendations.push('Review travel advisories carefully');
    }
    
    recommendations.push('Purchase comprehensive travel insurance');
    recommendations.push('Register with embassy if required');
    recommendations.push('Download offline maps and translation apps');
    
    return recommendations;
  }

  // Generate pre-trip timeline
  generatePreTripTimeline(departureDate, visaInfo, medicalInfo) {
    const departure = new Date(departureDate);
    const timeline = [];
    
    // 8 weeks before
    timeline.push({
      weeksBefore: 8,
      tasks: ['Research destination', 'Check passport validity', 'Start visa application if needed']
    });
    
    // 6 weeks before
    timeline.push({
      weeksBefore: 6,
      tasks: ['Book flights and accommodation', 'Purchase travel insurance', 'Schedule vaccinations']
    });
    
    // 4 weeks before
    timeline.push({
      weeksBefore: 4,
      tasks: ['Complete visa application', 'Plan itinerary', 'Book activities']
    });
    
    // 2 weeks before
    timeline.push({
      weeksBefore: 2,
      tasks: ['Finalize packing list', 'Check travel alerts', 'Confirm bookings']
    });
    
    // 1 week before
    timeline.push({
      weeksBefore: 1,
      tasks: ['Pack bags', 'Check weather forecast', 'Download apps']
    });
    
    return timeline;
  }

  // Helper methods
  generateTripId(userId, destination) {
    return `${userId}_${destination}_${Date.now()}`;
  }

  getDestinationSpecificItems(destination) {
    const items = {
      'tropical': ['Sunscreen', 'Hat', 'Swimwear', 'Sandals'],
      'cold': ['Warm jacket', 'Gloves', 'Thermal wear', 'Boots'],
      'urban': ['City map', 'Comfortable shoes', 'Small backpack'],
      'adventure': ['Hiking gear', 'First aid kit', 'Water bottle']
    };
    
    // Simple destination categorization
    if (destination.toLowerCase().includes('beach') || destination.toLowerCase().includes('tropical')) {
      return items.tropical;
    } else if (destination.toLowerCase().includes('mountain') || destination.toLowerCase().includes('cold')) {
      return items.cold;
    } else {
      return items.urban;
    }
  }

  getSeasonalItems(departureDate) {
    const month = new Date(departureDate).getMonth();
    const seasons = {
      winter: ['Warm clothing', 'Layers', 'Winter accessories'],
      spring: ['Light jacket', 'Umbrella', 'Layers'],
      summer: ['Light clothing', 'Sunscreen', 'Hat'],
      fall: ['Medium layers', 'Rain gear', 'Comfortable shoes']
    };
    
    if (month >= 11 || month <= 2) return seasons.winter;
    if (month >= 3 && month <= 5) return seasons.spring;
    if (month >= 6 && month <= 8) return seasons.summer;
    return seasons.fall;
  }

  getDestinationSpecificDocuments(destination) {
    // This would be populated based on destination-specific requirements
    return ['Check destination-specific requirements'];
  }

  getFallbackPreTripInfo(destination, nationality) {
    return {
      visa: { summary: 'Check embassy website for requirements' },
      medical: { summary: 'Consult travel health clinic' },
      alerts: { summary: 'Check government travel advisories' },
      weather: { summary: 'Check weather service for forecast' },
      cultural: { summary: 'Research local customs and etiquette' }
    };
  }
}

module.exports = PreTripAgent;
