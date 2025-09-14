import React, { useState } from 'react';
import { MapPin, Plane, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToTravelPlanner = () => {
    const element = document.getElementById('travel-planner');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TravelPlanner</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </a>
            <button 
              onClick={scrollToTravelPlanner}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Travel Planner
            </button>
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">
              About
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={scrollToTravelPlanner}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Plan Trip</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <a href="#home" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </a>
              <button 
                onClick={() => {
                  scrollToTravelPlanner();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                Travel Planner
              </button>
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                About
              </a>
              <button 
                onClick={() => {
                  scrollToTravelPlanner();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium mt-4"
              >
                Plan Trip
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
