import React, { useState, useEffect } from 'react';
import TypewriterText from './TypewriterText';
import SeasonalRecommendations from './SeasonalRecommendations';

interface Activity {
  time: string;
  activity: string;
  location: string;
  description: string;
  cost: string;
  coordinates: [number, number];
}

interface Day {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
}

interface LiveJournalProps {
  itinerary: Day[] | any;
  isTyping: boolean;
  seasonalRecommendations?: any[];
  preferredSeason?: string;
  avoidSeason?: string;
  messages?: any[]; // chat messages for lightweight context parsing (people, dates)
}

const LiveJournal: React.FC<LiveJournalProps> = ({ 
  itinerary, 
  isTyping, 
  seasonalRecommendations, 
  preferredSeason, 
  avoidSeason,
  messages
}) => {
  const [writingEntries, setWritingEntries] = useState<Array<{
    id: string;
    type: 'heading' | 'activity' | 'note';
    content: string;
    timestamp: Date;
    isComplete: boolean;
  }>>([]);

  const [currentWriting, setCurrentWriting] = useState<string>('');
  const [contextCaptured, setContextCaptured] = useState<{ people?: string; dates?: string }>({});

  // Simulate AI writing in real-time - start taking notes immediately
  useEffect(() => {
    if (isTyping) {
      // Add a general note when AI starts typing
      const newEntry = {
        id: Date.now().toString(),
        type: 'note' as const,
        content: 'AI is planning your trip...',
        timestamp: new Date(),
        isComplete: false
      };
      
      setWritingEntries(prev => [...prev, newEntry]);
    }
  }, [isTyping]);

  // Add city name when location is mentioned
  useEffect(() => {
    if (itinerary && itinerary.destination) {
      const cityEntry = {
        id: Date.now().toString(),
        type: 'heading' as const,
        content: `📍 ${itinerary.destination.name}`,
        timestamp: new Date(),
        isComplete: false
      };
      
      setWritingEntries(prev => [...prev, cityEntry]);
    }
  }, [itinerary?.destination]);

  // Add itinerary entries as they come in
  useEffect(() => {
    if (Array.isArray(itinerary) && itinerary.length > 0) {
      const latestDay = itinerary[itinerary.length - 1];
      const latestActivity = latestDay.activities[latestDay.activities.length - 1];
      
      if (latestActivity) {
        const newEntry = {
          id: Date.now().toString(),
          type: 'activity' as const,
          content: `${latestActivity.time} - ${latestActivity.activity}`,
          timestamp: new Date(),
          isComplete: false
        };
        
        setWritingEntries(prev => [...prev, newEntry]);
      }
    }
  }, [itinerary]);

  // Parse lightweight context from chat messages (people count, dates)
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find((m: any) => m.type === 'user');
    if (!lastUserMsg) return;
    const text: string = (lastUserMsg.content || '').toString().toLowerCase();

    // People parsing
    if (!contextCaptured.people) {
      let peopleLabel: string | undefined;
      const peopleMatch = text.match(/(\d+)\s*(people|ppl|persons|adults|kids|friends)/i);
      if (peopleMatch) {
        peopleLabel = `${peopleMatch[1]} people`;
      } else if (/\bsolo\b/.test(text)) {
        peopleLabel = 'solo traveler';
      } else if (/\bcouple\b|\bfor two\b|\b2 of us\b/.test(text)) {
        peopleLabel = '2 people (couple)';
      }
      if (peopleLabel) {
        setContextCaptured(prev => ({ ...prev, people: peopleLabel }));
        setWritingEntries(prev => ([...prev, {
          id: `pp-${Date.now()}`,
          type: 'note',
          content: `👥 ${peopleLabel}`,
          timestamp: new Date(),
          isComplete: true
        }]));
      }
    }

    // Dates parsing (very lightweight)
    if (!contextCaptured.dates) {
      const explicitDate = text.match(/(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/);
      const monthDate = text.match(/(\d{1,2}\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*(?:\s*\d{2,4})?)/i);
      const relative = text.match(/(in\s*\d+\s*(days|weeks)|next\s*(week|month))/);
      const range = text.match(/(from\s+[^\s]+\s+to\s+[^\s]+)/);
      let dateNote: string | undefined;
      if (range) dateNote = range[1];
      else if (explicitDate) dateNote = explicitDate[1];
      else if (monthDate) dateNote = monthDate[1];
      else if (relative) dateNote = relative[1];
      if (dateNote) {
        setContextCaptured(prev => ({ ...prev, dates: dateNote }));
        setWritingEntries(prev => ([...prev, {
          id: `dt-${Date.now()}`,
          type: 'note',
          content: `🗓️ Dates: ${dateNote}`,
          timestamp: new Date(),
          isComplete: true
        }]));
      }
    }
  }, [messages]);

  // Create concise notes from mapData-like object (places, foodPlaces, weather)
  useEffect(() => {
    if (!itinerary || Array.isArray(itinerary)) return;

    const notes: Array<{ id: string; content: string }> = [];

    if (itinerary?.weather?.temperature || itinerary?.weather?.condition) {
      notes.push({
        id: `wx-${Date.now()}`,
        content: `🌦️ Weather: ${itinerary.weather.temperature || ''} ${itinerary.weather.condition ? `• ${itinerary.weather.condition}` : ''} ${itinerary.weather.aqi ? `• AQI ${itinerary.weather.aqi}` : ''}`.trim()
      });
    }

    if (Array.isArray(itinerary?.places) && itinerary.places.length > 0) {
      const top = itinerary.places.slice(0, 5).map((p: any) => p.name).filter(Boolean);
      if (top.length > 0) {
        notes.push({ id: `pv-${Date.now() + 1}`, content: `⭐ Must‑visit: ${top.join(', ')}` });
      }
    }

    if (Array.isArray(itinerary?.foodPlaces) && itinerary.foodPlaces.length > 0) {
      const topFood = itinerary.foodPlaces.slice(0, 4).map((p: any) => p.name).filter(Boolean);
      if (topFood.length > 0) {
        notes.push({ id: `fd-${Date.now() + 2}`, content: `🍽️ Food picks: ${topFood.join(', ')}` });
      }
    }

    if (notes.length > 0) {
      setWritingEntries(prev => [
        ...prev,
        ...notes.map(n => ({ id: n.id, type: 'note' as const, content: n.content, timestamp: new Date(), isComplete: false }))
      ]);
    }
  }, [itinerary?.places, itinerary?.foodPlaces, itinerary?.weather]);

  const handleWritingComplete = (entryId: string) => {
    setWritingEntries(prev => 
      prev.map(entry => 
        entry.id === entryId ? { ...entry, isComplete: true } : entry
      )
    );
  };

  const getRandomHandwritingStyle = () => {
    const styles = [
      'font-["Kalam"]',
      'font-["Caveat"]',
      'font-mono'
    ];
    return styles[Math.floor(Math.random() * styles.length)];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-amber-200 relative overflow-hidden flex-1 journal-paper">
      {/* Spiral Binding Effect */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-b from-amber-300 to-amber-400">
        <div className="absolute left-1 top-0 bottom-0 w-1 bg-amber-500 opacity-30"></div>
        <div className="absolute left-3 top-0 bottom-0 w-1 bg-amber-500 opacity-30"></div>
        <div className="absolute left-5 top-0 bottom-0 w-1 bg-amber-500 opacity-30"></div>
      </div>
      
      {/* Lined Paper */}
      <div className="pl-6 pr-3 py-4 relative h-full">
        {/* Lined Paper Background - Real Notebook Style */}
        <div className="absolute inset-0 pl-6 pr-3 py-4">
          {/* Red margin line like a real notebook */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-400 opacity-60"></div>
          
          {/* Horizontal lines */}
          {Array.from({ length: 30 }, (_, i) => (
            <div 
              key={i} 
              className="absolute w-full border-b border-gray-300 opacity-40"
              style={{ top: `${i * 20}px` }}
            />
          ))}
        </div>
        
        {/* Journal Content */}
        <div className="relative z-10 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-100">
          {/* Today's Date Header - Real Journal Style */}
          <div className="mb-4 pb-2 border-b border-gray-300 border-dashed">
            <div className="text-sm font-bold text-gray-800 font-['Kalam']">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            {/* Subtitle removed per request */}
          </div>

          {/* Only show live writing entries, no prefilled data */}
          {writingEntries.length === 0 && !isTyping ? (
            <div className="text-center py-2 pointer-events-none opacity-50">
              <div className="text-base">✈️</div>
            </div>
          ) : (
            <>
              {/* Seasonal Recommendations */}
              {seasonalRecommendations && seasonalRecommendations.length > 0 && (
                <SeasonalRecommendations 
                  recommendations={seasonalRecommendations}
                  preferredSeason={preferredSeason}
                  avoidSeason={avoidSeason}
                />
              )}
              
              {/* Live Writing Entries */}
              {writingEntries.map((entry) => (
                <div key={entry.id} className="flex items-start animate-fadeIn mb-2" style={{ lineHeight: '20px' }}>
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1 mr-2 flex-shrink-0 animate-pulse"></div>
                  <div className="flex-1">
                    <TypewriterText
                      text={entry.content}
                      speed={50}
                      handwriting={true}
                      onComplete={() => handleWritingComplete(entry.id)}
                      className={`text-xs text-gray-700 ${getRandomHandwritingStyle()}`}
                    />
                  </div>
                </div>
              ))}
            </>
          )}
          
          {/* Live Writing Indicator */}
          {isTyping && (
            <div className="flex items-center text-xs text-gray-500 italic animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="flex items-center">
                <TypewriterText
                  text="AI is writing in your journal"
                  speed={100}
                  handwriting={false}
                  className="handwriting-text"
                />
                <span className="ml-1">✍️</span>
                <span className="animate-bounce ml-1">...</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveJournal;
