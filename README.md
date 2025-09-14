# TravelPlanner - AI-Powered Travel Itinerary Generator

A modern, AI-powered travel planner that creates detailed itineraries based on your source, destination, and preferences. Built with React TypeScript, Node.js, and integrated with Gemini AI and Mapbox.

## Features

- 🎯 **Smart Itinerary Generation**: AI-powered itinerary creation using Gemini 2.5 Flash
- 🗺️ **Interactive Maps**: Visualize your journey with Mapbox integration
- 📱 **Responsive Design**: Beautiful, mobile-friendly interface inspired by JarVisa
- 🔍 **Smart Search**: Dropdown-based city selection with keyword filtering
- 💰 **Cost Estimation**: Budget-aware planning with cost breakdowns
- 📊 **Detailed Planning**: Day-by-day activities with timings and descriptions
- 📤 **Export Options**: Download and share your itineraries
- 📧 **Email Integration**: Send detailed itinerary directly to your email

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Mapbox GL JS for maps
- Lucide React for icons
- Axios for API calls

### Backend
- Node.js with Express
- Google Gemini AI for itinerary generation
- Nodemailer for SMTP email functionality
- CORS enabled for cross-origin requests

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key
- Mapbox access token

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd travel-planner
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
PORT=5000

# SMTP Configuration for Email Service
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
```

**Important Notes**:
- The Mapbox token needs to be available to both backend (`MAPBOX_ACCESS_TOKEN`) and frontend (`REACT_APP_MAPBOX_ACCESS_TOKEN`) - you can use the same token for both.
- **Copy the above content into a `.env` file in your project root directory**
- Without SMTP configuration, the email feature will be disabled but the app will still work

4. Start the development servers:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

### Getting API Keys

#### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

#### Mapbox Access Token
1. Sign up at [Mapbox](https://www.mapbox.com/)
2. Go to your account page and create an access token
3. Add it to your `.env` file

#### SMTP Configuration (for Email Feature)
1. Use Gmail SMTP or any other email provider
2. For Gmail:
   - Enable 2-factor authentication on your Google account
   - Generate an app password: [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Use your Gmail address as `SENDER_EMAIL`
   - Use the generated app password as `SENDER_PASSWORD`
3. For other providers, update `SMTP_SERVER` and `SMTP_PORT` accordingly

## Project Structure

```
travel-planner/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── types/         # TypeScript type definitions
│   │   └── ...
│   ├── public/
│   └── package.json
├── server/                # Node.js backend
│   └── server.js
├── package.json           # Root package.json
└── README.md
```

## API Endpoints

### GET /api/cities
Returns a list of available cities with search functionality.

**Query Parameters:**
- `search` (optional): Filter cities by name or country

### POST /api/generate-itinerary
Generates a travel itinerary using AI.

**Request Body:**
```json
{
  "source": {
    "name": "New York",
    "country": "United States",
    "code": "NYC"
  },
  "destination": {
    "name": "Tokyo",
    "country": "Japan", 
    "code": "TYO"
  },
  "duration": 7,
  "interests": "Culture & History",
  "budget": "medium"
}
```

**Response:**
```json
{
  "itinerary": [
    {
      "day": 1,
      "date": "Day 1",
      "title": "Arrival and Exploration",
      "activities": [
        {
          "time": "09:00",
          "activity": "Check-in at hotel",
          "location": "Hotel Name",
          "description": "Check-in and drop off luggage",
          "cost": "$0",
          "coordinates": [139.6917, 35.6895]
        }
      ]
    }
  ],
  "summary": {
    "totalCost": "$1500",
    "highlights": ["Tokyo Tower", "Senso-ji Temple"],
    "tips": ["Book accommodations in advance", "Get a JR Pass"]
  }
}
```

### POST /api/send-itinerary-email
Sends the generated itinerary to the specified email address.

**Request Body:**
```json
{
  "email": "user@example.com",
  "itineraryData": {
    "itinerary": [...],
    "summary": {...}
  },
  "userDetails": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Perfect! I've sent your detailed personalized travel itinerary to user@example.com. Please check your inbox.",
  "messageId": "email-message-id"
}
```

## Usage

1. **Select Cities**: Use the dropdown search to select your source and destination cities
2. **Set Preferences**: Choose duration, budget, and interests
3. **Generate**: Click "Generate My Itinerary" to create your personalized travel plan
4. **Explore**: View your itinerary with interactive maps and detailed activities
5. **Email**: Click "Email Itinerary" to send a detailed copy to your email address
6. **Export**: Download or share your itinerary

## Customization

### Adding New Cities
Edit the `cities` array in `server/server.js` to add more destinations.

### Styling
The app uses Tailwind CSS. Modify `client/tailwind.config.js` for custom styling.

### AI Prompts
Customize the itinerary generation prompts in the `/api/generate-itinerary` endpoint.

## Deployment

### Frontend (Vercel/Netlify)
1. Build the client:
```bash
cd client
npm run build
```

2. Deploy the `build` folder to your hosting platform.

### Backend (Railway/Heroku)
1. Set environment variables in your hosting platform
2. Deploy the server folder

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Inspired by [JarVisa](https://www.jarvisa.com/) design
- Powered by Google Gemini AI
- Maps by Mapbox
- Icons by Lucide React
