'use client';

import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export default function ProfileGeolocation() {
  const [location, setLocation] = useState<{
    city: string;
    country: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);

  const getGeolocation = async () => {
    setLoading(true);
    try {
      // Get user's coordinates
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      const { latitude, longitude } = position.coords;

      // Use reverse geocoding API
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      const data = await response.json();

      setLocation({
        city: data.city || data.locality || 'Unknown',
        country: data.countryName || 'Unknown',
      });
    } catch (error) {
      console.error('Geolocation error:', error);
      setManualEntry(true);
      alert(
        'Could not detect location automatically. Please enter manually.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Profile Location</h2>

      {!location && !manualEntry ? (
        <button
          onClick={getGeolocation}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Detecting Location...
            </>
          ) : (
            <>
              <MapPin className="w-5 h-5" />
              Auto-Detect My Location
            </>
          )}
        </button>
      ) : null}

      {(location || manualEntry) && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <input
              type="text"
              value={location?.city || ''}
              onChange={(e) =>
                setLocation((prev) => ({
                  ...prev!,
                  city: e.target.value,
                }))
              }
              className="w-full p-3 border rounded-lg"
              placeholder="Los Angeles"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <input
              type="text"
              value={location?.country || ''}
              onChange={(e) =>
                setLocation((prev) => ({
                  ...prev!,
                  country: e.target.value,
                }))
              }
              className="w-full p-3 border rounded-lg"
              placeholder="United States"
            />
          </div>

          <button
            onClick={() => {
              setLocation(null);
              setManualEntry(false);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Re-detect location
          </button>
        </div>
      )}

      <button
        onClick={() => setManualEntry(true)}
        className="text-sm text-gray-600 hover:underline"
      >
        Enter location manually
      </button>
    </div>
  );
}
