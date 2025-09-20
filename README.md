# 🌍 Nomio - AI-Powered Travel Planner

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-blue?style=for-the-badge)](https://nomio-travel-planner.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/AnkushVe/Nomio-)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **We don't just plan trips, we plan your kind of trip** — whether you're traveling with family, friends, solo, or even pets.

## ✨ Features

### 🤖 Multi-Agent AI System
- **Pre-Trip Agent**: Visa requirements, medical advisories, travel alerts, packing lists
- **In-Trip Agent**: Real-time assistance, emergency help, navigation, recommendations
- **Post-Trip Agent**: Feedback processing, preference learning, future recommendations

### 🗺️ Google Maps Integration
- **Interactive Maps** with real-time location updates
- **Google Places API** for tourist attractions and reviews
- **Street View** for immersive destination exploration
- **Real-time search** for any destination worldwide

### 🎯 Personalized Planning
- **AI-powered itinerary generation** tailored to your preferences
- **Multiple travel modes**: Family, Friends, Solo, Business, Pet-friendly
- **Budget optimization** with cost estimation
- **Weather integration** and seasonal recommendations

### 🌟 World Destinations
- **8 Popular destinations** with detailed information
- **Real-time place search** with photos and ratings
- **Interactive destination cards** with one-click exploration
- **Professional UI** with smooth animations

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Google Maps API** for maps and places
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Google Generative AI** (Gemini 1.5 Flash)
- **Google Maps API** integration
- **Multi-agent architecture**
- **RESTful API** design

### APIs Used
- **Google Maps API** - Maps, Places, Street View
- **Google Generative AI** - Multi-agent AI system
- **OpenWeatherMap** - Weather data
- **OpenStreetMap Nominatim** - Geocoding fallback

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 20.10.0 or higher
- Google Maps API key
- Google Generative AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnkushVe/Nomio-.git
   cd Nomio-
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your API keys to `.env`:
   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development servers**
   ```bash
   ./start.sh
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5001

## 🌐 Live Demo

Visit the live demo: **[https://nomio-travel-planner.vercel.app](https://nomio-travel-planner.vercel.app)**

## 📱 How to Use

### 1. **Home Page**
- Click **"Start Your Journey"** → Navigate to Map Lab
- Click **"Explore Destinations"** → Browse world destinations
- Click any destination card → Get detailed information

### 2. **Destinations Page**
- **Search any city** worldwide
- **Click popular destinations** to explore
- **Interactive map** updates with selected locations
- **Street View** for immersive exploration
- **Real Places data** with photos, ratings, prices

### 3. **Map Lab**
- **Interactive travel planning**
- **AI-powered recommendations**
- **Multi-agent assistance**

## 🤖 Multi-Agent System

### Pre-Trip Agent
- Visa requirements and documentation
- Medical advisories and vaccinations
- Travel alerts and safety information
- Packing lists and preparation timeline
- Insurance recommendations

### In-Trip Agent
- Real-time assistance and support
- Emergency help and contacts
- Navigation and directions
- Local recommendations
- Weather updates

### Post-Trip Agent
- Feedback processing and analysis
- Preference learning and updates
- Future trip recommendations
- Experience sharing and reviews

## 🛠️ API Endpoints

### Core APIs
- `GET /api/health` - Server health check
- `POST /api/chat-travel-enhanced` - Enhanced AI chat with multi-agent support
- `GET /api/places` - Google Places search
- `POST /api/generate-itinerary` - Generate personalized itineraries

### Multi-Agent APIs
- `POST /api/pre-trip-planning` - Pre-trip planning assistance
- `POST /api/in-trip-assistance` - In-trip real-time help
- `POST /api/post-trip-feedback` - Post-trip feedback processing
- `GET /api/user-travel-profile/:userId` - Get user travel profile

## 🎨 UI/UX Features

- **Responsive design** for all devices
- **Smooth animations** and transitions
- **Interactive elements** with hover effects
- **Loading states** and error handling
- **Professional color scheme** and typography
- **Accessibility features** for all users

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push

### Other Platforms
- **Netlify** for frontend
- **Heroku** for full-stack
- **Railway** for easy deployment

## 📊 Project Structure

```
Nomio/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── agents/            # Multi-agent system
│   ├── server.js          # Main server file
│   └── aiAgent.js         # AI agent coordinator
├── package.json           # Dependencies
├── start.sh              # Development startup script
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **AnkushVe** - Lead Developer
- **AI Assistant** - Multi-agent system development

## 🙏 Acknowledgments

- Google Maps API for mapping services
- Google Generative AI for AI capabilities
- React community for excellent documentation
- Open source contributors for inspiration

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact us at support@nomio-travel.com

---

**Made with ❤️ for travelers worldwide**

*Nomio - We Plan Your Kind of Trip*
