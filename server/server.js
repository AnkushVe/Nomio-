const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const EmailService = require('./emailService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Email Service
const emailService = new EmailService();

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

app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { source, destination, duration, interests, budget } = req.body;
    
    if (!source || !destination) {
      return res.status(400).json({ error: 'Source and destination are required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    Create a detailed travel itinerary from ${source.name}, ${source.country} to ${destination.name}, ${destination.country}.
    
    Duration: ${duration || 7} days
    Interests: ${interests || 'General sightseeing'}
    Budget: ${budget || 'Medium'}
    
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
    
    const result = await emailService.sendItineraryEmail(email, itineraryData, userDetails);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
    
  } catch (error) {
    console.error('Error in email endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error while sending email' 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
