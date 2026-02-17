'use client';

import { useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

// Алдартай хотуудын жагсаалт
const popularCities = [
  { name: 'Ulaanbaatar', country: 'Mongolia', emoji: '🇲🇳' },
  { name: 'Seoul', country: 'South Korea', emoji: '🇰🇷' },
  { name: 'Tokyo', country: 'Japan', emoji: '🇯🇵' },
  { name: 'New York', country: 'USA', emoji: '🇺🇸' },
  { name: 'London', country: 'UK', emoji: '🇬🇧' },
];

export default function LocationDisplay() {
  const { location, loading, error } = useGeolocation();
  const [manualLocation, setManualLocation] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const displayLocation = manualLocation || (location?.city && location?.country
    ? `${location.city}, ${location.country}`
    : null);

  // Ачаалж байна
  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-[#656E7B] text-sm">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Байршил олж байна...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Байршил сонгох товч */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center space-x-2 text-[#656E7B] text-sm hover:text-[#21262E] transition-colors"
      >
        <svg className="h-4 w-4 text-[#FF4458]" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">
          {displayLocation || (error ? 'Хот сонгох' : 'Хот сонгох')}
        </span>
      </button>

      {/* Хот сонгох цонх */}
      {showPicker && (
        <div className="absolute top-full mt-2 left-0 bg-white border border-[#E8E6EA] rounded-xl shadow-md p-2 min-w-50 z-50">
          <div className="text-xs text-[#656E7B] px-2 py-1 mb-1">Хот сонгох</div>
          {popularCities.map((city) => (
            <button
              key={city.name}
              onClick={() => {
                setManualLocation(`${city.name}, ${city.country}`);
                setShowPicker(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F0F2F4] text-sm text-[#656E7B] hover:text-[#21262E] transition-colors flex items-center space-x-2"
            >
              <span>{city.emoji}</span>
              <span>{city.name}, {city.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
