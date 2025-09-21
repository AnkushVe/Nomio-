import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface User {
  id: string;
  phoneNumber: string;
  name: string;
  groupType: string;
  dietary: string;
  safetyLevel: string;
}

interface NavbarProps {
  user?: User | null;
  currentPage?: 'home' | 'explore' | 'destinations';
  onNavigate?: (page: 'home' | 'explore' | 'destinations') => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, currentPage, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (page: 'home' | 'explore' | 'destinations') => {
    if (onNavigate) {
      onNavigate(page);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-lg" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0)', backgroundSize: '20px 20px'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNavigation('home')}
            title="Go to Home"
            className="flex items-center space-x-6 group cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 rounded-full"
          >
            <img 
              src="/Logo.png" 
              alt="Nomio Logo" 
              className="h-20 w-20 rounded-full object-cover drop-shadow-xl transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 hover:animate-spin"
            />
            <div className="flex flex-col text-left select-none">
              <span className="text-4xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent transition-transform duration-300 group-hover:translate-x-0.5">Nomio</span>
              <span className="text-sm font-semibold text-gray-700 tracking-wider">AI Travel Planner</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <button 
              onClick={() => handleNavigation('home')}
              className={`transition-colors font-semibold ${
                currentPage === 'home' 
                  ? 'text-blue-600' 
                  : 'text-gray-800 hover:text-blue-600'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => handleNavigation('explore')}
              className={`transition-colors font-semibold ${
                currentPage === 'explore' 
                  ? 'text-blue-600' 
                  : 'text-gray-800 hover:text-blue-600'
              }`}
            >
              Explore
            </button>
            {/* Travel Planner link removed */}
          </div>

          {/* CTA Button */}
          {/* Plan Trip button removed */}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-lg border-t border-gray-200/50" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)', backgroundSize: '20px 20px'}}>
              <button 
                onClick={() => handleNavigation('home')}
                className={`block w-full text-left px-3 py-2 transition-colors ${
                  currentPage === 'home' 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-800 hover:text-blue-600'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => handleNavigation('explore')}
                className={`block w-full text-left px-3 py-2 transition-colors ${
                  currentPage === 'explore' 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-800 hover:text-blue-600'
                }`}
              >
                Explore
              </button>
              {/* Travel Planner link and CTA removed in mobile */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
