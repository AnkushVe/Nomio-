# 🌍 Nomio - AI-Powered Travel Planner

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-blue?style=for-the-badge&logo=vercel)](https://nomio-vqoy.vercel.app)
[![GitHub License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Latest-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

> **"We don't just plan trips, we plan your kind of trip"** — Whether you're traveling with family, friends, solo, or even pets, Nomio creates personalized travel experiences powered by cutting-edge AI.

![Nomio Travel Planner](https://img.shields.io/badge/Nomio-AI%20Travel%20Planner-purple?style=for-the-badge)

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

### 🌟 Advanced Features
- **Voice Chat Interface** with wake word detection
- **Live Journal** for real-time trip documentation
- **Memories Modal** for photo and experience sharing
- **Seasonal Recommendations** based on weather patterns
- **Real-time Weather Display** with location-based updates

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for modern styling
- **Google Maps API** for maps and places
- **Axios** for API calls
- **Lucide React** for beautiful icons

### Backend
- **Node.js** with Express
- **Google Generative AI** (Gemini 1.5 Flash)
- **Google Maps API** integration
- **Multi-agent architecture**
- **RESTful API** design

### APIs Used
- **Google Maps API** - Maps, Places, Street View
- **Google Generative AI** - Multi-agent AI system
- **Travel Partner Prices API** - Real-time pricing
- **OpenWeatherMap** - Weather data integration

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
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
   PORT=5002
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5002

## 🌐 Live Demo

Visit the live demo: **[https://nomio-travel-planner.vercel.app](https://nomio-travel-planner.vercel.app)**

## 📱 How to Use

### 1. **Home Page**
- Click **"Start Your Journey"** → Navigate to Travel Planner
- Click **"Explore Destinations"** → Browse world destinations
- Click **"Map Lab"** → Interactive travel planning

### 2. **Destinations Page**
- **Search any city** worldwide with real-time results
- **Click popular destinations** to explore detailed information
- **Interactive map** updates with selected locations
- **Street View** for immersive exploration
- **Real Places data** with photos, ratings, and prices

### 3. **Travel Planner**
- **Select your travel mode** (Family, Solo, Friends, etc.)
- **AI-powered itinerary generation** based on your preferences
- **Real-time weather integration** for planning
- **Budget optimization** with cost estimation

### 4. **Map Lab**
- **Interactive travel planning** with Google Maps
- **Voice chat interface** for hands-free planning
- **Live journal** for documenting your journey
- **Multi-agent assistance** throughout your trip

## 🤖 Multi-Agent System

### Pre-Trip Agent
- ✅ Visa requirements and documentation
- ✅ Medical advisories and vaccinations
- ✅ Travel alerts and safety information
- ✅ Packing lists and preparation timeline
- ✅ Insurance recommendations

### In-Trip Agent
- ✅ Real-time assistance and support
- ✅ Emergency help and contacts
- ✅ Navigation and directions
- ✅ Local recommendations
- ✅ Weather updates and alerts

### Post-Trip Agent
- ✅ Feedback processing and analysis
- ✅ Preference learning and updates
- ✅ Future trip recommendations
- ✅ Experience sharing and reviews
- ✅ Memory creation and storage

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

### Travel APIs
- `GET /api/travel-partner-prices` - Real-time travel pricing
- `GET /api/weather` - Weather information
- `GET /api/seasonal-recommendations` - Seasonal travel suggestions

## 🎨 UI/UX Features

- ✅ **Responsive design** for all devices (mobile, tablet, desktop)
- ✅ **Smooth animations** and transitions
- ✅ **Interactive elements** with hover effects
- ✅ **Loading states** and error handling
- ✅ **Professional color scheme** and typography
- ✅ **Accessibility features** for all users
- ✅ **Dark/Light mode** support
- ✅ **Voice interface** integration

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `GOOGLE_MAPS_API_KEY`
   - `GEMINI_API_KEY`
   - `PORT=5002`
3. **Deploy automatically** on every push to main branch

### Manual Deployment

```bash
# Build the client
cd client && npm run build

# Start the production server
npm start
```

## 📊 Project Structure

```
Nomio/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── TravelPlanner.tsx
│   │   │   ├── GoogleMapCanvas.tsx
│   │   │   ├── VoiceChat.tsx
│   │   │   ├── LiveJournal.tsx
│   │   │   └── ...
│   │   ├── pages/         # Page components
│   │   │   ├── TravelPlannerPage.tsx
│   │   │   ├── DestinationsPage.tsx
│   │   │   └── MapLabPage.tsx
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── agents/            # Multi-agent system
│   │   ├── PreTripAgent.js
│   │   ├── InTripAgent.js
│   │   └── PostTripAgent.js
│   ├── services/          # External services
│   ├── server.js          # Main server file
│   └── aiAgent.js         # AI agent coordinator
├── config/                # Configuration files
├── package.json           # Dependencies
├── vercel.json           # Vercel deployment config
├── start.sh              # Development startup script
└── README.md             # This file
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Google APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=5002
NODE_ENV=development

# Optional: Other APIs
OPENWEATHER_API_KEY=your_openweather_api_key
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation for API changes
- Ensure responsive design for all components

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **AnkushVe** - Lead Developer & AI Architect
- **AI Assistant** - Multi-agent system development

## 🙏 Acknowledgments

- [Google Maps API](https://developers.google.com/maps) for mapping services
- [Google Generative AI](https://ai.google.dev/) for AI capabilities
- [React](https://reactjs.org/) community for excellent documentation
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling
- Open source contributors for inspiration

## 📞 Support

If you have any questions or need help:

- 📧 **Email**: support@nomio-travel.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/AnkushVe/Nomio-/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/AnkushVe/Nomio-/discussions)

## 🎯 Roadmap

### Upcoming Features
- [ ] **AR Travel Guide** - Augmented reality destination exploration
- [ ] **Blockchain Rewards** - Travel token rewards system
- [ ] **AI Photo Analysis** - Smart photo categorization and tagging
- [ ] **Social Travel Network** - Connect with fellow travelers
- [ ] **Offline Mode** - Download itineraries for offline use
- [ ] **Multi-language Support** - Support for 20+ languages
- [ ] **Advanced Analytics** - Travel insights and recommendations
- [ ] **Integration with Airlines** - Direct booking capabilities

### Performance Improvements
- [ ] **PWA Support** - Progressive Web App capabilities
- [ ] **Advanced Caching** - Improved loading times
- [ ] **Real-time Sync** - Cross-device synchronization
- [ ] **Enhanced Security** - Advanced authentication and encryption

---

<div align="center">

**Made with ❤️ for travelers worldwide**

*Nomio - We Plan Your Kind of Trip*

[![Star this repo](https://img.shields.io/github/stars/AnkushVe/Nomio-?style=social)](https://github.com/AnkushVe/Nomio-)
[![Follow on GitHub](https://img.shields.io/github/followers/AnkushVe?style=social)](https://github.com/AnkushVe)

</div>