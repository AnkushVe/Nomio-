import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TravelPlanner from './components/TravelPlanner';
import ItineraryDisplay from './components/ItineraryDisplay';
import Footer from './components/Footer';
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

function App() {
  const [itineraryData, setItineraryData] = useState<ItineraryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleItineraryGenerated = (data: ItineraryData) => {
    setItineraryData(data);
  };

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <div className="App min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Hero />
        <TravelPlanner 
          onItineraryGenerated={handleItineraryGenerated}
          onLoading={handleLoading}
        />
        {itineraryData && (
          <ItineraryDisplay 
            data={itineraryData} 
            isLoading={isLoading}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
