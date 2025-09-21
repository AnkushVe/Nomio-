/**
 * Nomio - AI-Powered Travel Planner
 * Main Application Component
 * 
 * Features:
 * - Multi-page navigation (Home, Explore, Destinations)
 * - AI-powered travel planning
 * - Google Maps integration
 * - Voice chat interface
 * - Real-time analytics tracking
 */

import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ItineraryDisplay from './components/ItineraryDisplay';
import ExplorePage from './pages/ExplorePage';
import DestinationsPage from './pages/DestinationsPage';
import './App.css';

// Type definitions for travel planning data
interface ItineraryData {
  itinerary: Array<{
    day: number;
    date: string;
    title: string;
    activities: Array<{
      time: string;
      activity: string;
      location: string;
      description: string;
      cost: string;
      coordinates: [number, number];
    }>;
  }>;
  summary: {
    totalCost: string;
    highlights: string[];
    tips: string[];
  };
}

interface User {
  id: string;
  phoneNumber: string;
  name: string;
  groupType: string;
  dietary: string;
  safetyLevel: string;
}

/**
 * Main App Component
 * Handles routing between different pages and manages global state
 */
function App() {
  // State management for navigation and user data
  const [currentPage, setCurrentPage] = useState<'home' | 'explore' | 'destinations'>('home');
  const [itineraryData] = useState<ItineraryData | null>(null);
  const [isLoading] = useState(false);
  const [user] = useState<User | null>(null);

  /**
   * Navigation event listener
   * Handles custom navigation events from child components
   */
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      if (typeof event.detail === 'string') {
        setCurrentPage(event.detail as 'home' | 'explore' | 'destinations');
      } else if (event.detail && event.detail.section) {
        setCurrentPage(event.detail.section as 'home' | 'explore' | 'destinations');
        // Handle destination pre-filling if needed
        if (event.detail.destination) {
          console.log('Navigating to:', event.detail.section, 'with destination:', event.detail.destination);
        }
      }
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  /**
   * Navigation handler for navbar
   * @param page - Target page to navigate to
   */
  const navigateToPage = (page: 'home' | 'explore' | 'destinations') => {
    setCurrentPage(page);
  };

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation Bar */}
      <Navbar 
        user={user}
        currentPage={currentPage}
        onNavigate={navigateToPage}
      />
      
      {/* Main Content Area */}
      <main>
        {/* Home Page - Hero section and itinerary display */}
        {currentPage === 'home' && (
          <>
            <Hero />
            {itineraryData && (
              <ItineraryDisplay 
                data={itineraryData} 
                isLoading={isLoading}
              />
            )}
          </>
        )}
        
        {/* Explore Page - AI chat and map interface */}
        {currentPage === 'explore' && (
          <ExplorePage />
        )}
        
        {/* Destinations Page - Destination search and exploration */}
        {currentPage === 'destinations' && (
          <DestinationsPage />
        )}
      </main>
      
      {/* Vercel Analytics for tracking */}
      <Analytics />
    </div>
  );
}

export default App;
