import React from 'react';

interface SeasonalRecommendation {
  name: string;
  country: string;
  reason: string;
}

interface SeasonalRecommendationsProps {
  recommendations: SeasonalRecommendation[];
  preferredSeason?: string;
  avoidSeason?: string;
}

const SeasonalRecommendations: React.FC<SeasonalRecommendationsProps> = ({ 
  recommendations, 
  preferredSeason, 
  avoidSeason 
}) => {
  if (!recommendations || recommendations.length === 0) return null;

  const getSeasonEmoji = (season: string) => {
    switch (season) {
      case 'winter': return '❄️';
      case 'summer': return '☀️';
      case 'monsoon': return '🌧️';
      case 'spring': return '🌸';
      default: return '🌍';
    }
  };

  return (
    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <div className="flex items-center mb-2">
        <span className="text-sm font-semibold text-gray-800">
          {preferredSeason ? `${getSeasonEmoji(preferredSeason)} Perfect for ${preferredSeason} vibes!` : 
           avoidSeason ? `🚫 Avoiding ${avoidSeason}? Try these instead!` : 
           '🌍 Seasonal Recommendations'}
        </span>
      </div>
      
      <div className="space-y-2">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start space-x-2 text-xs">
            <span className="text-blue-500 mt-0.5">📍</span>
            <div>
              <span className="font-medium text-gray-800">{rec.name}</span>
              <span className="text-gray-600 ml-1">({rec.country})</span>
              <div className="text-gray-600 mt-0.5">{rec.reason}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeasonalRecommendations;
