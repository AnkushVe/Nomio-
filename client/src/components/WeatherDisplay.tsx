import React from 'react';

interface WeatherData {
  temperature: string;
  condition: string;
  humidity: string;
  windSpeed: string;
  aqi: string;
  aqiValue: number;
  description: string;
  icon?: string;
}

interface WeatherDisplayProps {
  weather: WeatherData;
  city: string;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, city }) => {
  const getAQIColor = (aqiValue: number) => {
    if (aqiValue <= 50) return 'text-green-600 bg-green-100';
    if (aqiValue <= 100) return 'text-yellow-600 bg-yellow-100';
    if (aqiValue <= 150) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) return '☀️';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('storm')) return '⛈️';
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '🌫️';
    return '🌤️';
  };

  return (
    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 z-10 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800 text-sm">Live Weather</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full animate-pulse">LIVE</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl">{getWeatherIcon(weather.condition)}</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{weather.temperature}</div>
            <div className="text-xs text-gray-600 capitalize">{weather.description}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <span>💧</span>
            <span>{weather.humidity}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>💨</span>
            <span>{weather.windSpeed}</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Air Quality</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getAQIColor(weather.aqiValue)}`}>
              {weather.aqi}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;
