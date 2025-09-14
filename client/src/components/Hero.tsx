import React from 'react';
import { MapPin, Plane, Compass, Calendar } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollToTravelPlanner = () => {
    const element = document.getElementById('travel-planner');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            <span className="block">Yo, going</span>
            <span className="block gradient-text">somewhere?</span>
            <span className="block text-3xl md:text-4xl lg:text-5xl mt-4">
              Let's plan that trip.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Simple, AI-powered tools to help you create the perfect travel itinerary. 
            From source to destination, we've got you covered.
          </p>

          {/* CTA Button */}
          <button
            onClick={scrollToTravelPlanner}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plane className="inline-block w-6 h-6 mr-2" />
            Start Planning Your Trip
          </button>

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 mx-auto">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Itinerary</h3>
              <p className="text-gray-600">
                AI-powered itinerary generation with detailed day-by-day planning
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4 mx-auto">
                <Compass className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Maps</h3>
              <p className="text-gray-600">
                Visualize your journey with interactive maps and route planning
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4 mx-auto">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Planning</h3>
              <p className="text-gray-600">
                Complete with costs, timings, and personalized recommendations
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">195+</div>
              <div className="text-gray-600">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">AI</div>
              <div className="text-gray-600">Powered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">Free</div>
              <div className="text-gray-600">To Use</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-green-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </div>
    </section>
  );
};

export default Hero;
