import { useState, useCallback } from 'react';
import { publicApiRequest } from '../services/publicApi';

export function usePublicLocationsMap() {
  const [locations, setLocations] = useState([]);
  const [totalCountries, setTotalCountries] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLocationsMap = useCallback(async () => {
    setLoading(true);
    try {
      const data = await publicApiRequest('/api/public/locations-map');
      setLocations(data.locations || []);
      setTotalCountries(data.totalCountries || 0);
    } catch {
      // keep previous state on error
    } finally {
      setLoading(false);
    }
  }, []);

  return { locations, totalCountries, loading, fetchLocationsMap };
}
