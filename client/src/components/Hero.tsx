import React, { useEffect, useState } from 'react';
import { MapPin, Plane, Compass, Sparkles, Globe, Heart, ExternalLink } from 'lucide-react';
import axios from 'axios';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [destinationInfo, setDestinationInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  const navigateToMapLab = () => {
    // Navigate to Map Lab page
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'map-lab' }));
  };

  const handleDestinationClick = async (destination: string) => {
    setSelectedDestination(destination);
    setIsLoading(true);
    
    try {
      // Get destination information using Google Places API
      const response = await axios.post('http://localhost:5001/api/chat-travel-enhanced', {
        message: `Tell me about ${destination} and show me places to visit`,
        userId: 'default',
        currentLocation: null,
        tripPhase: 'planning'
      });

      if (response.data.mapData) {
        setDestinationInfo(response.data.mapData);
        
        // Navigate to travel planner with pre-filled destination
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { 
            section: 'travel-planner', 
            destination: destination,
            data: response.data.mapData
          } 
        }));
      }
    } catch (error) {
      console.error('Error fetching destination info:', error);
      // Fallback: just navigate to travel planner
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { 
          section: 'travel-planner', 
          destination: destination
        } 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureClick = (feature: string) => {
    switch (feature) {
      case 'smart-adventures':
        navigateToMapLab();
        break;
      case 'explore-maps':
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'map-lab' }));
        break;
      case 'memories':
        // Open a modal or navigate to a memories section
        alert('Memories feature coming soon! Share your travel experiences with us.');
        break;
      default:
        navigateToMapLab();
    }
  };

  const handleExploreDestinations = () => {
    // Navigate to destinations page
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'destinations' }));
  };

  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1488646950254-7d23ad7e23ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        ></div>
        
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-blue-50/90"></div>
        
        {/* Floating Travel Icons */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 bg-blue-400/60 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className={`text-6xl md:text-8xl lg:text-9xl font-bold mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="block bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Explore
            </span>
            <span className="block text-4xl md:text-5xl lg:text-6xl mt-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              The World
            </span>
          </h1>

          {/* AI Badge */}
          <div className={`inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100/50 to-indigo-100/50 backdrop-blur-sm border border-blue-200/50 rounded-full px-6 py-3 mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-slate-700 text-sm font-medium">AI-Powered Travel Planning</span>
            <Globe className="w-5 h-5 text-blue-600 animate-pulse" />
          </div>

          {/* Punch Line */}
          <p className={`text-2xl md:text-3xl text-slate-700 mb-8 max-w-5xl mx-auto leading-relaxed font-medium transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            We don't just plan trips, we plan 
            <span className="text-blue-600 font-bold"> your kind of trip</span> — whether you're traveling with 
            <span className="text-indigo-600 font-semibold"> family</span>, 
            <span className="text-purple-600 font-semibold"> friends</span>, 
            <span className="text-pink-600 font-semibold"> solo</span>, or even 
            <span className="text-green-600 font-semibold"> pets</span>.
          </p>

          {/* Video Section */}
          <div className={`mb-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                <video
                  className="w-full h-auto"
                  poster="https://images.unsplash.com/photo-1488646950254-7d23ad7e23ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/demo_video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
          
          {/* Supporting Copy */}
          <p className={`text-lg md:text-xl text-slate-500 mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Personalized AI travel planning that understands your unique style and creates 
            <span className="text-blue-600 font-semibold"> unforgettable experiences</span> tailored just for you.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button
              onClick={navigateToMapLab}
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-10 py-5 rounded-3xl text-xl font-bold hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center space-x-3">
                <Plane className="w-7 h-7" />
                <span>Start Your Journey</span>
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
          </button>

            <button 
              onClick={handleExploreDestinations}
              className="group bg-gradient-to-r from-blue-100/50 to-indigo-100/50 backdrop-blur-sm border border-blue-200/50 text-slate-700 px-10 py-5 rounded-3xl text-xl font-bold hover:from-blue-200/50 hover:to-indigo-200/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                <Compass className="w-7 h-7" />
                <span>Explore Destinations</span>
              </div>
            </button>
          </div>

          {/* Features Grid with Travel Images */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div 
              onClick={() => handleFeatureClick('smart-adventures')}
              className="group relative overflow-hidden rounded-3xl hover:scale-105 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`
                }}
              ></div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-indigo-700/80"></div>
              {/* Content */}
              <div className="relative p-8 h-80 flex flex-col justify-end">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Smart Adventures</h3>
                <p className="text-white/90 leading-relaxed">
                  AI creates personalized day-by-day adventures with local experiences, 
                  hidden gems, and unforgettable moments
                </p>
                <div className="mt-4 flex items-center text-white/80 text-sm group-hover:text-white transition-colors">
                  <span>Click to start planning</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleFeatureClick('explore-maps')}
              className="group relative overflow-hidden rounded-3xl hover:scale-105 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`
                }}
              ></div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 to-purple-700/80"></div>
              {/* Content */}
              <div className="relative p-8 h-80 flex flex-col justify-end">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Compass className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Explore Maps</h3>
                <p className="text-white/90 leading-relaxed">
                  Discover amazing places with interactive maps, local insights, 
                  and immersive destination exploration
                </p>
                <div className="mt-4 flex items-center text-white/80 text-sm group-hover:text-white transition-colors">
                  <span>Click to explore</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleFeatureClick('memories')}
              className="group relative overflow-hidden rounded-3xl hover:scale-105 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`
                }}
              ></div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-pink-700/80"></div>
              {/* Content */}
              <div className="relative p-8 h-80 flex flex-col justify-end">
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Memories</h3>
                <p className="text-white/90 leading-relaxed">
                  Create unforgettable travel memories with personalized recommendations 
                  that match your style and interests
                </p>
                <div className="mt-4 flex items-center text-white/80 text-sm group-hover:text-white transition-colors">
                  <span>Click to share</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Travel Destinations Showcase */}
          <div id="destinations-showcase" className={`mt-20 mb-16 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-12 text-center">
              Explore Amazing Destinations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {/* Destination 1 - Paris */}
              <div 
                onClick={() => handleDestinationClick('Paris')}
                className="group relative overflow-hidden rounded-2xl h-48 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')`
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg">Paris</h3>
                  <p className="text-white/90 text-sm">City of Light</p>
                  {isLoading && selectedDestination === 'Paris' && (
                    <div className="mt-2 flex items-center text-white/80 text-xs">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  )}
                </div>
              </div>

              {/* Destination 2 - Tokyo */}
              <div 
                onClick={() => handleDestinationClick('Tokyo')}
                className="group relative overflow-hidden rounded-2xl h-48 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')`
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg">Tokyo</h3>
                  <p className="text-white/90 text-sm">Modern Metropolis</p>
                  {isLoading && selectedDestination === 'Tokyo' && (
                    <div className="mt-2 flex items-center text-white/80 text-xs">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  )}
                </div>
              </div>

              {/* Destination 3 - Santorini */}
              <div 
                onClick={() => handleDestinationClick('Santorini')}
                className="group relative overflow-hidden rounded-2xl h-48 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')`
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg">Santorini</h3>
                  <p className="text-white/90 text-sm">Greek Paradise</p>
                  {isLoading && selectedDestination === 'Santorini' && (
                    <div className="mt-2 flex items-center text-white/80 text-xs">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  )}
                </div>
              </div>

              {/* Destination 4 - New York */}
              <div 
                onClick={() => handleDestinationClick('New York')}
                className="group relative overflow-hidden rounded-2xl h-48 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')`
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg">New York</h3>
                  <p className="text-white/90 text-sm">The Big Apple</p>
                  {isLoading && selectedDestination === 'New York' && (
                    <div className="mt-2 flex items-center text-white/80 text-xs">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-1200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="group text-center bg-gradient-to-br from-blue-100/50 to-indigo-100/50 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 hover:bg-gradient-to-br hover:from-blue-200/50 hover:to-indigo-200/50 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">195+</div>
              <div className="text-slate-700 font-medium">Destinations</div>
            </div>
            <div className="group text-center bg-gradient-to-br from-indigo-100/50 to-purple-100/50 backdrop-blur-sm border border-indigo-200/50 rounded-2xl p-6 hover:bg-gradient-to-br hover:from-indigo-200/50 hover:to-purple-200/50 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">AI</div>
              <div className="text-slate-700 font-medium">Powered</div>
            </div>
            <div className="group text-center bg-gradient-to-br from-purple-100/50 to-pink-100/50 backdrop-blur-sm border border-purple-200/50 rounded-2xl p-6 hover:bg-gradient-to-br hover:from-purple-200/50 hover:to-pink-200/50 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-slate-700 font-medium">Available</div>
            </div>
            <div className="group text-center bg-gradient-to-br from-pink-100/50 to-blue-100/50 backdrop-blur-sm border border-pink-200/50 rounded-2xl p-6 hover:bg-gradient-to-br hover:from-pink-200/50 hover:to-blue-200/50 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-blue-700 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">Free</div>
              <div className="text-slate-700 font-medium">To Explore</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
