import React, { useState } from 'react';

interface Activity {
  time: string;
  activity: string;
  location: string;
  duration: string;
  cost: string;
}

interface Day {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
}

interface Itinerary {
  destination: string;
  duration: number;
  travelMode: string;
  totalCost: string;
  summary: string;
  days: Day[];
  highlights: string[];
  tips: string[];
  accommodations: string[];
  transportation: string[];
  budget: {
    accommodation: string;
    food: string;
    activities: string;
    transportation: string;
    total: string;
  };
}

interface TripPlannerProps {
  itinerary: Itinerary | null;
  onClose: () => void;
  onEdit: (itinerary: Itinerary) => void;
  onSave: (itinerary: Itinerary) => void;
}

const TripPlanner: React.FC<TripPlannerProps> = ({ itinerary, onClose, onEdit, onSave }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'budget' | 'tips'>('overview');

  if (!itinerary) return null;

  const travelModeEmojis = {
    'family': '👨‍👩‍👧‍👦',
    'friends': '👥',
    'solo': '🎒',
    'solo_female': '👩‍🦰',
    'pets': '🐕'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center space-x-3">
                <span>{travelModeEmojis[itinerary.travelMode as keyof typeof travelModeEmojis]}</span>
                <span>Trip to {itinerary.destination}</span>
              </h2>
              <p className="text-blue-100 mt-2">{itinerary.duration} days • {itinerary.totalCost}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'itinerary', label: 'Itinerary', icon: '🗓️' },
              { id: 'budget', label: 'Budget', icon: '💰' },
              { id: 'tips', label: 'Tips', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Trip Summary</h3>
                <p className="text-gray-700">{itinerary.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">⭐</span>
                    Highlights
                  </h4>
                  <ul className="space-y-2">
                    {itinerary.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">🏨</span>
                    Accommodations
                  </h4>
                  <ul className="space-y-2">
                    {itinerary.accommodations.map((accommodation, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700">{accommodation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">🚗</span>
                  Transportation
                </h4>
                <div className="flex flex-wrap gap-2">
                  {itinerary.transportation.map((transport, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {transport}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'itinerary' && (
            <div className="space-y-6">
              {itinerary.days.map((day) => (
                <div key={day.day} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{day.title}</h3>
                    <span className="text-sm text-gray-500">{day.date}</span>
                  </div>
                  <div className="space-y-3">
                    {day.activities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-semibold text-blue-600 w-16">
                          {activity.time}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{activity.activity}</div>
                          <div className="text-sm text-gray-600">{activity.location}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.duration}
                        </div>
                        <div className="text-sm font-semibold text-green-600">
                          {activity.cost}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Budget Breakdown</h3>
                <p className="text-gray-600">Total estimated cost: <span className="font-bold text-green-600">{itinerary.budget.total}</span></p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(itinerary.budget).map(([category, amount]) => (
                  <div key={category} className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-800 capitalize">
                        {category}
                      </span>
                      <span className="text-xl font-bold text-blue-600">{amount}</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.random() * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Travel Tips</h3>
                <p className="text-gray-600">Essential tips for your {itinerary.travelMode} trip to {itinerary.destination}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {itinerary.tips.map((tip, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <span className="text-yellow-500 text-xl">💡</span>
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex space-x-4">
            <button
              onClick={() => onEdit(itinerary)}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              ✏️ Edit Plan
            </button>
            <button
              onClick={() => onSave(itinerary)}
              className="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              💾 Save Plan
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;

