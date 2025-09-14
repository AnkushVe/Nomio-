import React from 'react';
import { MapPin } from 'lucide-react';

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

interface SimpleMapViewProps {
  itinerary: Day[];
}

const SimpleMapView: React.FC<SimpleMapViewProps> = ({ itinerary }) => {
  // Collect all locations
  const locations = itinerary.flatMap(day => 
    day.activities.map(activity => ({
      ...activity,
      day: day.day
    }))
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Trip Overview</h3>
        <p className="text-gray-600">Visual overview of your travel destinations</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{location.day}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">{location.activity}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{location.location}</p>
                  <p className="text-xs text-gray-500">{location.time}</p>
                  <p className="text-xs text-green-600 font-medium">{location.cost}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {locations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No locations to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleMapView;
