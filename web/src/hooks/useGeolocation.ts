'use client';

import { useState, useEffect } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  accuracy?: number;
}

interface GeolocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    if (!navigator.geolocation) {
      if (isMounted) {
        setState({
          location: null,
          loading: false,
          error: 'Geolocation is not supported by your browser',
        });
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!isMounted) return;
        
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          // Reverse geocoding to get city/country name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (isMounted) {
            setState({
              location: {
                latitude,
                longitude,
                accuracy,
                city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
                country: data.address?.country || 'Unknown',
              },
              loading: false,
              error: null,
            });
          }
        } catch {
          // If geocoding fails, still show coordinates
          if (isMounted) {
            setState({
              location: {
                latitude,
                longitude,
                accuracy,
              },
              loading: false,
              error: null,
            });
          }
        }
      },
      (error) => {
        if (isMounted) {
          setState({
            location: null,
            loading: false,
            error: error.message,
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
