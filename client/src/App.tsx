import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ItineraryDisplay from './components/ItineraryDisplay';
import ExplorePage from './pages/ExplorePage';
import DestinationsPage from './pages/DestinationsPage';
import './App.css';

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

function App() {
  const [itineraryData] = useState<ItineraryData | null>(null);
  const [isLoading] = useState(false);
  const [user] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'explore' | 'destinations'>('home');

  // Listen for navigation events from Hero component
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


  const navigateToPage = (page: 'home' | 'explore' | 'destinations') => {
    setCurrentPage(page);
  };

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar 
        user={user}
        currentPage={currentPage}
        onNavigate={navigateToPage}
      />
      <main>
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
        {currentPage === 'explore' && (
          <ExplorePage />
        )}
        {currentPage === 'destinations' && (
          <DestinationsPage />
        )}
      </main>
    </div>
  );
}

export default App;
