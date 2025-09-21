const { GoogleGenerativeAI } = require('@google/generative-ai');

class PostTripAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.tripFeedback = new Map(); // Store trip feedback
    this.userPreferences = new Map(); // Store learned preferences
  }

  // Main post-trip processing function
  async processPostTrip(userId, tripId, tripData, feedback) {
    try {
      // Collect and analyze feedback
      const feedbackAnalysis = await this.analyzeFeedback(feedback, tripData);
      
      // Update user preferences based on trip experience
      const updatedPreferences = await this.updateUserPreferences(userId, tripData, feedbackAnalysis);
      
      // Generate trip summary and insights
      const tripSummary = await this.generateTripSummary(tripId, tripData, feedbackAnalysis);
      
      // Provide recommendations for future trips
      const futureRecommendations = await this.generateFutureRecommendations(userId, tripData, feedbackAnalysis);
      
      // Store trip data for learning
      this.storeTripData(userId, tripId, tripData, feedbackAnalysis);
      
      return {
        success: true,
        tripId,
        feedbackAnalysis,
        updatedPreferences,
        tripSummary,
        futureRecommendations,
        insights: this.generateInsights(tripData, feedbackAnalysis),
        improvements: this.suggestImprovements(feedbackAnalysis)
      };
      
    } catch (error) {
      console.error('PostTripAgent error:', error);
      return {
        success: false,
        error: 'Failed to process post-trip feedback',
        fallback: this.getFallbackPostTripResponse()
      };
    }
  }

  // Analyze feedback from the trip
  async analyzeFeedback(feedback, tripData) {
    try {
      const prompt = `Analyze this travel feedback and provide insights:
      
      Trip Data: ${JSON.stringify(tripData)}
      Feedback: ${JSON.stringify(feedback)}
      
      Analyze:
      - Overall satisfaction level (1-10)
      - What went well
      - What could be improved
      - Favorite experiences
      - Least favorite experiences
      - Budget satisfaction
      - Safety concerns
      - Cultural experiences
      - Recommendations for others
      
      Format as JSON with detailed analysis.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        return JSON.parse(response.text());
      } catch {
        return this.getDefaultFeedbackAnalysis(feedback);
      }
    } catch (error) {
      return this.getDefaultFeedbackAnalysis(feedback);
    }
  }

  // Update user preferences based on trip experience
  async updateUserPreferences(userId, tripData, feedbackAnalysis) {
    const currentPreferences = this.userPreferences.get(userId) || {
      destinations: [],
      activities: [],
      accommodations: [],
      restaurants: [],
      budget: null,
      travelStyle: 'friends',
      dislikes: [],
      specialRequirements: []
    };

    // Analyze what the user liked and disliked
    const likedExperiences = feedbackAnalysis.favoriteExperiences || [];
    const dislikedExperiences = feedbackAnalysis.leastFavoriteExperiences || [];
    
    // Update preferences based on feedback
    const updatedPreferences = { ...currentPreferences };
    
    // Add liked destinations
    if (tripData.destination && likedExperiences.some(exp => 
      exp.toLowerCase().includes(tripData.destination.toLowerCase())
    )) {
      if (!updatedPreferences.destinations.includes(tripData.destination)) {
        updatedPreferences.destinations.push(tripData.destination);
      }
    }
    
    // Add liked activities
    likedExperiences.forEach(experience => {
      if (!updatedPreferences.activities.includes(experience)) {
        updatedPreferences.activities.push(experience);
      }
    });
    
    // Add disliked experiences
    dislikedExperiences.forEach(experience => {
      if (!updatedPreferences.dislikes.includes(experience)) {
        updatedPreferences.dislikes.push(experience);
      }
    });
    
    // Update budget preferences
    if (feedbackAnalysis.budgetSatisfaction) {
      updatedPreferences.budget = this.inferBudgetPreference(feedbackAnalysis.budgetSatisfaction, tripData.budget);
    }
    
    // Update travel style based on feedback
    if (feedbackAnalysis.travelStyle) {
      updatedPreferences.travelStyle = feedbackAnalysis.travelStyle;
    }
    
    // Store updated preferences
    this.userPreferences.set(userId, updatedPreferences);
    
    return updatedPreferences;
  }

  // Generate comprehensive trip summary
  async generateTripSummary(tripId, tripData, feedbackAnalysis) {
    try {
      const prompt = `Create a comprehensive trip summary based on this data:
      
      Trip Data: ${JSON.stringify(tripData)}
      Feedback Analysis: ${JSON.stringify(feedbackAnalysis)}
      
      Include:
      - Trip overview and highlights
      - Key experiences and memories
      - Budget breakdown and value assessment
      - What made the trip special
      - Lessons learned
      - Recommendations for similar trips
      
      Make it personal and engaging.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        overview: response.text(),
        highlights: this.extractHighlights(tripData, feedbackAnalysis),
        budget: this.analyzeBudget(tripData, feedbackAnalysis),
        memories: this.createMemoryList(tripData, feedbackAnalysis),
        lessons: this.extractLessons(feedbackAnalysis)
      };
    } catch (error) {
      return {
        overview: `Trip to ${tripData.destination} completed!`,
        highlights: ['Great experiences', 'Memorable moments'],
        budget: 'Budget analysis available',
        memories: ['Trip memories captured'],
        lessons: ['Travel lessons learned']
      };
    }
  }

  // Generate recommendations for future trips
  async generateFutureRecommendations(userId, tripData, feedbackAnalysis) {
    const userPreferences = this.userPreferences.get(userId) || {};
    
    try {
      const prompt = `Based on this trip experience and user preferences, suggest future trips:
      
      Current Trip: ${JSON.stringify(tripData)}
      User Preferences: ${JSON.stringify(userPreferences)}
      Feedback: ${JSON.stringify(feedbackAnalysis)}
      
      Suggest:
      - Similar destinations they might enjoy
      - Different types of trips to try
      - Destinations that match their preferences
      - Activities they might like
      - Budget considerations
      - Timing recommendations
      
      Be specific and personalized.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        similarDestinations: this.getSimilarDestinations(tripData.destination, userPreferences),
        newExperiences: this.suggestNewExperiences(userPreferences),
        budgetOptions: this.suggestBudgetOptions(userPreferences),
        timing: this.suggestTiming(tripData, feedbackAnalysis),
        detailedRecommendations: response.text()
      };
    } catch (error) {
      return {
        similarDestinations: ['Similar destinations'],
        newExperiences: ['New experiences to try'],
        budgetOptions: ['Budget-friendly options'],
        timing: ['Best times to travel'],
        detailedRecommendations: 'Personalized recommendations available'
      };
    }
  }

  // Generate insights from the trip
  generateInsights(tripData, feedbackAnalysis) {
    return {
      satisfaction: feedbackAnalysis.satisfaction || 8,
      valueForMoney: feedbackAnalysis.budgetSatisfaction || 'Good',
      safety: feedbackAnalysis.safetyRating || 'Safe',
      cultural: feedbackAnalysis.culturalExperience || 'Positive',
      recommendations: feedbackAnalysis.recommendations || 'Would recommend',
      improvements: feedbackAnalysis.improvements || 'None major'
    };
  }

  // Suggest improvements for future trips
  suggestImprovements(feedbackAnalysis) {
    const improvements = [];
    
    if (feedbackAnalysis.budgetSatisfaction === 'Poor') {
      improvements.push('Consider budget planning tools');
    }
    
    if (feedbackAnalysis.safetyRating === 'Concerns') {
      improvements.push('Research safety information better');
    }
    
    if (feedbackAnalysis.culturalExperience === 'Challenging') {
      improvements.push('Learn more about local culture');
    }
    
    if (feedbackAnalysis.accommodationIssues) {
      improvements.push('Research accommodations more thoroughly');
    }
    
    if (feedbackAnalysis.transportationIssues) {
      improvements.push('Plan transportation better');
    }
    
    return improvements;
  }

  // Store trip data for learning
  storeTripData(userId, tripId, tripData, feedbackAnalysis) {
    const tripRecord = {
      tripId,
      userId,
      tripData,
      feedbackAnalysis,
      timestamp: new Date(),
      preferences: this.userPreferences.get(userId) || {}
    };
    
    this.tripFeedback.set(tripId, tripRecord);
  }

  // Get user's travel history and preferences
  getUserTravelProfile(userId) {
    const preferences = this.userPreferences.get(userId) || {};
    const tripHistory = Array.from(this.tripFeedback.values())
      .filter(trip => trip.userId === userId);
    
    return {
      preferences,
      tripHistory,
      totalTrips: tripHistory.length,
      favoriteDestinations: this.getFavoriteDestinations(userId),
      travelPatterns: this.analyzeTravelPatterns(userId),
      recommendations: this.getPersonalizedRecommendations(userId)
    };
  }

  // Helper methods
  getDefaultFeedbackAnalysis(feedback) {
    return {
      satisfaction: 8,
      favoriteExperiences: ['Great experiences'],
      leastFavoriteExperiences: ['Minor issues'],
      budgetSatisfaction: 'Good',
      safetyRating: 'Safe',
      culturalExperience: 'Positive',
      recommendations: 'Would recommend',
      improvements: 'None major'
    };
  }

  inferBudgetPreference(budgetSatisfaction, actualBudget) {
    if (budgetSatisfaction === 'Excellent') {
      return { range: 'High', comfort: 'Luxury' };
    } else if (budgetSatisfaction === 'Good') {
      return { range: 'Medium', comfort: 'Comfortable' };
    } else {
      return { range: 'Budget', comfort: 'Basic' };
    }
  }

  extractHighlights(tripData, feedbackAnalysis) {
    return feedbackAnalysis.favoriteExperiences || [
      'Amazing experiences',
      'Great memories',
      'Wonderful people'
    ];
  }

  analyzeBudget(tripData, feedbackAnalysis) {
    return {
      spent: tripData.budget || 'Not specified',
      satisfaction: feedbackAnalysis.budgetSatisfaction || 'Good',
      value: feedbackAnalysis.valueForMoney || 'Good value',
      recommendations: 'Budget planning for next trip'
    };
  }

  createMemoryList(tripData, feedbackAnalysis) {
    return [
      `Trip to ${tripData.destination}`,
      'Amazing experiences',
      'Great memories',
      'Wonderful people met'
    ];
  }

  extractLessons(feedbackAnalysis) {
    return [
      'Travel lessons learned',
      'What worked well',
      'What to improve next time',
      'New preferences discovered'
    ];
  }

  getSimilarDestinations(destination, preferences) {
    // This would use destination similarity algorithms
    return ['Similar destinations', 'Related places', 'Nearby countries'];
  }

  suggestNewExperiences(preferences) {
    return ['New activities', 'Different experiences', 'Adventure options'];
  }

  suggestBudgetOptions(preferences) {
    return ['Budget-friendly trips', 'Luxury options', 'Mid-range choices'];
  }

  suggestTiming(tripData, feedbackAnalysis) {
    return ['Best seasons', 'Avoid crowds', 'Weather considerations'];
  }

  getFavoriteDestinations(userId) {
    const preferences = this.userPreferences.get(userId) || {};
    return preferences.destinations || [];
  }

  analyzeTravelPatterns(userId) {
    const tripHistory = Array.from(this.tripFeedback.values())
      .filter(trip => trip.userId === userId);
    
    return {
      averageTripLength: '7 days',
      preferredSeasons: ['Spring', 'Fall'],
      commonDestinations: ['Popular spots'],
      travelStyle: 'Adventure'
    };
  }

  getPersonalizedRecommendations(userId) {
    const preferences = this.userPreferences.get(userId) || {};
    return [
      'Personalized destination suggestions',
      'Activity recommendations',
      'Budget-friendly options',
      'Timing suggestions'
    ];
  }

  getFallbackPostTripResponse() {
    return {
      message: 'Thank you for sharing your trip experience!',
      suggestions: ['Plan your next trip', 'Share your experience', 'Leave reviews']
    };
  }
}

module.exports = PostTripAgent;
