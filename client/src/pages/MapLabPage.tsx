import React, { useMemo, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import GoogleMapCanvas from '../components/GoogleMapCanvas';
import VoiceChat from '../components/VoiceChat';
import TripPlanner from '../components/TripPlanner';

interface Activity { time: string; activity: string; location: string; description: string; cost: string; coordinates: [number, number]; }
interface Day { day: number; date: string; title: string; activities: Activity[]; }
interface Itinerary { 
  itinerary: Day[]; 
  summary: { totalCost: string; highlights: string[]; tips: string[]; };
  weather?: any;
  seasonalRecommendations?: any[];
  preferredSeason?: string;
  avoidSeason?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  action?: 'map_update' | 'itinerary_update' | 'places_found';
  quickReplies?: string[];
}

const ExplorePage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "yo! where to? 🌍",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [data, setData] = useState<Itinerary | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [travelMode, setTravelMode] = useState<string>('friends');
  const [userId] = useState<string>('user_' + Date.now());
  const [showTripPlanner, setShowTripPlanner] = useState<boolean>(false);
  const [currentItinerary, setCurrentItinerary] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const travelModes: { [key: string]: { name: string; emoji: string; color: string } } = {
    'family': { name: 'Family Mode', emoji: '👨‍👩‍👧‍👦', color: 'bg-blue-100 text-blue-800' },
    'friends': { name: 'Friends Mode', emoji: '👥', color: 'bg-green-100 text-green-800' },
    'solo': { name: 'Solo Traveler', emoji: '🎒', color: 'bg-purple-100 text-purple-800' },
    'solo_female': { name: 'Solo Female', emoji: '👩‍🦰', color: 'bg-pink-100 text-pink-800' },
    'pets': { name: 'Pet-Friendly', emoji: '🐕', color: 'bg-orange-100 text-orange-800' }
  };

  const fallback: Itinerary = useMemo(() => ({
    itinerary: [],
    summary: { totalCost: '-', highlights: [], tips: [] }
  }), []);

  const current = data ?? fallback;

  // Auto-scroll to bottom of chat (only when new messages are added)
  useEffect(() => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        const isNearBottom = chatContainer.scrollTop + chatContainer.clientHeight >= chatContainer.scrollHeight - 100;
        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages.length]); // Only trigger when message count changes

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send to conversational AI endpoint
      const response = await axios.post('/api/chat-travel', {
        message: inputMessage.trim(),
        conversationHistory: messages,
        currentLocation: currentLocation,
        userId: userId
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.data.message,
        timestamp: new Date(),
        action: response.data.action,
        quickReplies: response.data.quickReplies || []
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle map updates
        if (response.data.mapData) {
          setData(response.data.mapData);
        } else {
          // Fallback: try to parse destination and force a map update
          try {
            const parsed = await axios.post('/api/parse-travel-intent', { prompt: inputMessage.trim() });
            const dest = parsed.data?.destination;
            if (dest) {
              const force = await axios.post('/api/chat-travel', {
                message: `take me to ${dest}`,
                conversationHistory: [...messages, userMessage],
                currentLocation
              });
              if (force.data?.mapData) {
                setData(force.data.mapData);
              }
              if (force.data?.location) setCurrentLocation(force.data.location);
            }
          } catch (error) {
            console.error('Error parsing travel intent:', error);
          }
        }

      // Update current location if mentioned
      if (response.data.location) {
        setCurrentLocation(response.data.location);
      }

      // Handle itinerary responses
      if (response.data.itinerary) {
        setCurrentItinerary(response.data.itinerary);
        setShowTripPlanner(true);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "Sorry, I had trouble understanding that. Can you try again? 😅",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Voice chat handlers
  const handleVoiceMessage = (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const handleVoiceResponse = (response: string) => {
    // This function is called from VoiceChat component
    // The message is already added by the VoiceChat component
    // No need to add duplicate messages here
  };

  const handleLocationUpdate = (location: string) => {
    setCurrentLocation(location);
  };

  const handleMapDataUpdate = (mapData: any) => {
    setData(mapData);
  };

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply);
    handleSendMessage();
  };

  const handleEditItinerary = (itinerary: any) => {
    // For now, just close and let user modify via chat
    setShowTripPlanner(false);
    setInputMessage(`Please modify my trip to ${itinerary.destination}`);
  };

  const handleSaveItinerary = (itinerary: any) => {
    // Save to localStorage for now
    const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
    savedTrips.push({
      ...itinerary,
      id: Date.now(),
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    setShowTripPlanner(false);
    
    // Show success message
    const successMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: `✅ Trip to ${itinerary.destination} saved successfully! You can access it anytime.`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, successMessage]);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header - Consistent with Home Page */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="w-full">
            {/* Travel Mode Selector - Full Width */}
            <div className="flex items-center justify-center space-x-4">
              <span className="text-lg text-slate-700 font-semibold">Choose Your Travel Style:</span>
              <div className="flex bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-2 border border-blue-200/50 flex-1 max-w-4xl shadow-sm">
                {Object.entries(travelModes).map(([mode, config]) => (
                  <button
                    key={mode}
                    onClick={() => setTravelMode(mode)}
                    className={`flex-1 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      travelMode === mode 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105' 
                        : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
                    }`}
                  >
                    <span className="mr-2">{config.emoji}</span>
                    {config.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Consistent with Home Page */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-12 gap-8 h-[calc(100vh-200px)]">
          
          {/* Map Section - Clean Design */}
          <div className="col-span-8">
            <div className="h-full bg-white rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200/50 flex items-center px-8">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-lg font-semibold text-slate-700">Interactive World Map</span>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <span className="text-sm text-slate-500">Click to explore</span>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🗺️</span>
                  </div>
                </div>
              </div>
              <div className="h-[calc(100%-4rem)]">
                <GoogleMapCanvas 
                  itinerary={current.itinerary} 
                  weather={current.weather}
                  city={currentLocation}
                  mapData={data}
                  travelMode={travelMode}
                  onSelectLocation={async (name: string) => {
                    const quick = { id: Date.now().toString(), type: 'user' as const, content: name, timestamp: new Date() };
                    setMessages(prev => [...prev, quick]);
                    try {
                      const response = await axios.post('/api/chat-travel', {
                        message: name,
                        conversationHistory: [...messages, quick],
                        currentLocation,
                        userId: userId
                      });
                      const aiMessage = {
                        id: (Date.now() + 1).toString(),
                        type: 'ai' as const,
                        content: response.data.message,
                        timestamp: new Date(),
                        action: response.data.action,
                        quickReplies: response.data.quickReplies || []
                      };
                      setMessages(prev => [...prev, aiMessage]);
                      if (response.data.mapData) setData(response.data.mapData);
                      if (response.data.location) setCurrentLocation(response.data.location);
                    } catch (error) {
                      console.error('Error handling map click:', error);
                    }
                  }}
                  onVoiceResponse={(response: string) => {
                    // Don't add duplicate messages here - let handleVoiceResponse handle it
                    handleVoiceResponse(response);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Clean Chat with Voice */}
          <div className="col-span-4">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 flex flex-col h-full">
              <div className="h-16 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200/50 flex items-center px-6 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">💬</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-700">Chat & Voice</h3>
                    <p className="text-xs text-purple-600">AI Travel Assistant</p>
                  </div>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0" ref={messagesEndRef}>
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <span className="text-4xl">✈️</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-700 mb-2">Ready to help you plan!</h4>
                    <p className="text-slate-500 mb-6">Type or use voice to ask about destinations</p>
                    <div className="space-y-2">
                      <div className="text-sm text-slate-400">Try saying:</div>
                      <div className="text-sm text-blue-600">"I want to visit Tokyo"</div>
                      <div className="text-sm text-blue-600">"Plan a family trip to Paris"</div>
                      <div className="text-sm text-blue-600">"Solo female travel to Bali"</div>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                            : 'bg-gray-100 text-slate-700 border border-gray-200'
                        }`}
                      >
                        {message.content}
                        {message.quickReplies && message.quickReplies.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.quickReplies.map((reply, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickReply(reply)}
                                className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors border border-white/30"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Integrated Input with Voice */}
              <div className="p-6 border-t border-gray-200/50 bg-gray-50/50 flex-shrink-0">
                {/* Voice Status */}
                <div className="mb-4">
                  <VoiceChat
                    onMessage={handleVoiceMessage}
                    onResponse={handleVoiceResponse}
                    onLocationUpdate={handleLocationUpdate}
                    onMapDataUpdate={handleMapDataUpdate}
                    userId={userId}
                    currentLocation={currentLocation}
                    travelMode={travelMode}
                  />
                </div>
                
                {/* Text Input */}
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type or use voice to ask ab"
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-slate-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm resize-none"
                    style={{ maxHeight: '120px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Trip Planner Modal */}
      {showTripPlanner && currentItinerary && (
        <TripPlanner
          itinerary={currentItinerary}
          onClose={() => setShowTripPlanner(false)}
          onEdit={handleEditItinerary}
          onSave={handleSaveItinerary}
        />
      )}
    </div>
  );
};

export default ExplorePage;




