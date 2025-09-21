import React, { useEffect, useState } from 'react';
import { MapPin, Plane, Compass, Sparkles, Globe, ExternalLink, CreditCard, Smartphone, Shield, Backpack, Cloud } from 'lucide-react';
import MemoriesModal from './MemoriesModal';
import FeatureModal from './FeatureModal';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  const [showMemoriesModal, setShowMemoriesModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

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
    // Navigate to Explore page
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'explore' }));
  };


  const handleFeatureClick = (feature: string) => {
    switch (feature) {
      case 'smart-adventures':
        navigateToMapLab();
        break;
      case 'explore-maps':
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'explore' }));
        break;
      case 'memories':
        // Open the memories modal
        setShowMemoriesModal(true);
        break;
      default:
        navigateToMapLab();
    }
  };

  const handleUpcomingFeatureClick = (featureId: string) => {
    const feature = upcomingFeatures.find(f => f.id === featureId);
    if (feature) {
      setSelectedFeature(feature);
      setShowFeatureModal(true);
    }
  };

  const upcomingFeatures = [
    {
      id: 'split-payment',
      title: 'Split Payment System',
      icon: '💰',
      description: 'Group UPI split before booking - no more chasing friends for money!',
      problem: 'Planning group trips becomes a nightmare when it comes to splitting costs. One person books everything, then spends weeks chasing friends for money. Some never pay, others pay late, and it creates awkward situations that ruin friendships. WhatsApp groups get flooded with payment reminders and awkward conversations.',
      solution: 'Our AI-powered split payment system integrates directly with your WhatsApp group. It calculates exact costs per person, sends payment links via WhatsApp, and automatically sends smart reminder alerts to those who haven\'t paid. No more awkward conversations or chasing friends!',
      benefits: [
        'WhatsApp group integration for seamless communication',
        'Smart reminder alerts for unpaid members',
        'Transparent cost breakdown sent to group chat',
        'Secure UPI integration with instant payments',
        'Automatic refunds if plans change',
        'Payment status tracking visible to all group members',
        'No more awkward "who hasn\'t paid" conversations'
      ],
      example: '💬 "Hey group! Your Japan trip total is ₹45,000. Here\'s the breakdown: Flights ₹25,000, Hotels ₹15,000, Activities ₹5,000. Your share: ₹11,250. Pay now: [UPI Link] ⏰ Reminder: 3 people haven\'t paid yet!"',
      iconComponent: <CreditCard className="w-8 h-8 text-blue-600" />
    },
    {
      id: 'transport-tracker',
      title: 'Unified Transport Tracker',
      icon: '🚌',
      description: 'Flights, trains, buses in one dashboard with WhatsApp updates',
      problem: 'After booking tickets, travelers are left alone with no personalized support. They struggle to find driver details, bus stop locations, platform numbers, and real-time updates. Customer service is non-existent, and travelers feel lost and unsupported throughout their journey.',
      solution: 'Complete end-to-end travel support with personalized WhatsApp updates. Get driver details, exact pickup locations, platform numbers, real-time delays, and 24/7 customer support. Your personal travel assistant ensures you never feel lost or unsupported.',
      benefits: [
        'Personalized WhatsApp updates for every transport mode',
        'Driver details, contact numbers, and vehicle information',
        'Exact pickup/drop locations with GPS coordinates',
        'Platform numbers, gate changes, and terminal details',
        'Real-time delay notifications and alternative suggestions',
        '24/7 customer support via WhatsApp',
        'Group and individual chat support',
        'Live tracking of all your bookings',
        'Automatic rebooking for cancellations',
        'Cultural tips and local insights for each destination'
      ],
      example: '🚌 "Your bus to Goa: Driver Rajesh (+91-98765-43210), Bus No: MH-12-AB-1234, Pickup: 6:30 AM from Dadar Station, Platform 2. Live tracking: [Link] 🚨 Delay: 15 mins due to traffic. Alternative: Take train from CST at 7:15 AM"',
      iconComponent: <Plane className="w-8 h-8 text-green-600" />
    },
    {
      id: 'smart-sim-comparison',
      title: 'Smart SIM Comparison',
      icon: '📱',
      description: 'Compare local SIM options and get the best deals instantly',
      problem: 'International travelers waste time and money finding the right local SIM cards. They buy expensive airport SIMs or wrong plans, with no way to compare options or get real-time pricing. Most end up paying 3x more than necessary.',
      solution: 'Complete SIM comparison tool that shows all available options in your destination country with real-time pricing, instant eSIM purchase, and WhatsApp updates on best deals. Never overpay for connectivity again.',
      benefits: [
        'Complete SIM card comparison for each country',
        'Real-time pricing and data plan options',
        'Instant eSIM purchase and activation',
        'WhatsApp updates on best SIM deals',
        'Local vs tourist plan recommendations',
        'No physical SIM card required',
        'Automatic activation upon arrival',
        'Price alerts for better deals',
        'Coverage maps and network quality info',
        '24/7 support for SIM issues'
      ],
      example: '📱 "Japan SIM Options: SoftBank 10GB ¥2,500/month (best coverage), Docomo 5GB ¥1,800/month (cheapest), AU 15GB ¥3,200/month (unlimited calls). Recommendation: SoftBank for Tokyo. Buy now: [eSIM Link] ⚡ Activates when you land!"',
      iconComponent: <Smartphone className="w-8 h-8 text-purple-600" />
    },
    {
      id: 'safety-features',
      title: 'Local Safety Guide',
      icon: '🛡️',
      description: 'Country-specific safety zones, emergency numbers, and cultural tips',
      problem: 'Travelers don\'t know which areas are safe to visit, local emergency numbers, or cultural safety norms. They end up in dangerous situations or miss out on experiences due to safety concerns.',
      solution: 'Comprehensive local safety database with safe zones, emergency contacts, cultural safety tips, and real-time safety alerts for each destination. Stay safe while exploring confidently.',
      benefits: [
        'Safe zones and areas to avoid for each country',
        'Local emergency numbers (police, ambulance, fire)',
        'Cultural safety tips and dress codes',
        'Safe transportation recommendations',
        'Real-time safety alerts and warnings',
        '24/7 local emergency contact directory',
        'Women-specific safety recommendations',
        'LGBTQ+ friendly areas and warnings',
        'Nighttime safety guidelines',
        'Emergency phrase translations'
      ],
      example: '🛡️ "Delhi Safety Alert: ✅ Safe zones: Connaught Place, Hauz Khas. ❌ Avoid: Old Delhi after 8 PM. Emergency: Police 100, Ambulance 102. Cultural tip: Cover shoulders in temples. 🚨 Real-time: Avoid Red Fort area today (protests). Use Metro instead of auto-rickshaws."',
      iconComponent: <Shield className="w-8 h-8 text-indigo-600" />
    },
    {
      id: 'packing-assistant',
      title: 'Personalized Packing Assistant',
      icon: '🎒',
      description: 'Custom packing lists based on your group, destination, and specific needs',
      problem: 'Packing becomes a nightmare when traveling with different people - families with kids, elderly parents, or groups with different needs. You don\'t know what to pack for each person, what items are unavailable in your destination, or what cultural requirements to consider. One person forgets medication, another forgets baby food, and you end up overpacking or missing essentials.',
      solution: 'AI-powered personalized packing assistant that asks detailed questions about your group composition, individual needs, and destination requirements. Get customized lists for each person with specific recommendations about what to pack because it\'s unavailable locally.',
      benefits: [
        'Group-specific packing lists (families, couples, solo, groups)',
        'Individual needs assessment (medications, dietary, mobility)',
        'Children-specific items and age-appropriate recommendations',
        'Elderly-friendly packing with comfort items',
        'Destination availability checker - "Pack this, not available there"',
        'Cultural requirement alerts (dress codes, religious items)',
        'Medical and prescription reminders',
        'Weight and luggage optimization per person',
        'Emergency item recommendations by destination',
        'Progress tracking with group coordination'
      ],
      example: '🎒 "Japan Packing List: Mom - Blood pressure meds (not available), Dad - Extra reading glasses (expensive there), Kids - Favorite snacks (different taste), All - Modest clothing for temples. ❌ Don\'t pack: Sunscreen (cheap there), Winter coats (it\'s summer), Large shampoo (available everywhere)."',
      iconComponent: <Backpack className="w-8 h-8 text-teal-600" />
    },
    {
      id: 'adaptive-itinerary',
      title: 'Real-Time Adaptive Itinerary',
      icon: '🌤️',
      description: 'Auto-adjusts for weather, delays, and crowd conditions',
      problem: 'Rigid itineraries fall apart when weather changes, flights get delayed, or attractions are overcrowded. Travelers waste time and miss experiences because their plans can\'t adapt to real-world conditions.',
      solution: 'Dynamic itinerary that automatically adjusts based on real-time conditions like weather, delays, crowd levels, and local events. Your plans evolve with the situation, ensuring optimal experiences.',
      benefits: [
        'Real-time weather-based adjustments',
        'Automatic delay and cancellation handling',
        'Crowd level optimization',
        'Alternative activity suggestions',
        'Dynamic timing and routing updates'
      ],
      example: '🌤️ "Weather Alert: Heavy rain in Tokyo today. Your outdoor temple visit is moved to tomorrow. Instead: Visit Tokyo National Museum (indoor) or teamLab Borderless (covered). Your evening plans remain the same. Alternative route: Take JR Yamanote Line instead of walking."',
      iconComponent: <Cloud className="w-8 h-8 text-yellow-600" />
    },
  ];


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

          {/* CTA Button */}
          <div className={`flex justify-center items-center mb-16 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
          </div>

          {/* Features Grid with Travel Images */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div 
              className="group relative overflow-hidden rounded-3xl transition-all duration-500 transform"
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
                <div className="absolute top-6 left-6 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Smart Adventures</h3>
                <p className="text-white/90 leading-relaxed">
                  AI creates personalized day-by-day adventures with local experiences, 
                  hidden gems, and unforgettable moments
                </p>
              </div>
            </div>

            <div 
              className="group relative overflow-hidden rounded-3xl transition-all duration-500 transform"
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
              <div className="relative p-8 h-80 flex flex-col justify-center">
                <div className="absolute top-6 left-6 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <div className="mt-16">
                <h3 className="text-xl font-bold text-white mb-4">Explore Maps</h3>
                <p className="text-white/90 leading-relaxed">
                  Discover amazing places with interactive maps, local insights, 
                  and immersive destination exploration
                </p>
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
                <div className="absolute top-6 left-6 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
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
                className="group relative overflow-hidden rounded-2xl h-48 transition-all duration-300"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1550340499-a6c60fc8287c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')`
                  }}
                  onError={(e) => {
                    e.currentTarget.style.backgroundImage = `url('https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')`;
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg">Paris</h3>
                  <p className="text-white/90 text-sm">City of Light</p>
                </div>
              </div>

              {/* Destination 2 - Tokyo */}
              <div 
                className="group relative overflow-hidden rounded-2xl h-48 transition-all duration-300"
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
                </div>
              </div>

              {/* Destination 3 - Santorini */}
              <div 
                className="group relative overflow-hidden rounded-2xl h-48 transition-all duration-300"
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
                </div>
              </div>

              {/* Destination 4 - New York */}
              <div 
                className="group relative overflow-hidden rounded-2xl h-48 transition-all duration-300"
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
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Features Section */}
          <div className={`mt-20 mb-16 transition-all duration-1000 delay-1200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 text-center">
              🚀 Upcoming Features
            </h2>
            <p className="text-lg text-slate-600 mb-12 text-center max-w-3xl mx-auto">
              Revolutionary features that will transform how you travel
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {upcomingFeatures.map((feature) => (
                <div 
                  key={feature.id}
                  onClick={() => handleUpcomingFeatureClick(feature.id)}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">{feature.title}</h4>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{feature.description}</p>
                  <div className="text-xs text-blue-600 font-medium group-hover:text-blue-700">
                    Click to learn more →
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-1400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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

      {/* Memories Modal */}
      <MemoriesModal 
        isOpen={showMemoriesModal} 
        onClose={() => setShowMemoriesModal(false)} 
      />

      {/* Feature Modal */}
      <FeatureModal 
        isOpen={showFeatureModal} 
        onClose={() => setShowFeatureModal(false)} 
        feature={selectedFeature}
      />
    </section>
  );
};

export default Hero;
