const INDIAN_STATES = [
  'Uttar Pradesh', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'West Bengal',
  'Jharkhand', 'Odisha', 'Chhattisgarh', 'Punjab', 'Haryana', 'Maharashtra',
  'Gujarat', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana',
  'Kerala', 'Assam', 'Manipur', 'Meghalaya', 'Tripura', 'Nagaland',
  'Sikkim', 'Arunachal Pradesh',
];

export const cleanCountryName = (loc) => {
  if (loc.includes('(')) return loc.split('(')[0].trim();
  if (INDIAN_STATES.includes(loc)) return 'India';
  if (loc === 'West Bank' || loc.includes('Gaza')) return 'Palestine';
  return loc;
};

export const REGION_CENTERS = {
  Africa:       { lat: 0.0236,   lng: 37.9062  },
  'Middle East':{ lat: 31.9522,  lng: 35.2332  },
  'South Asia': { lat: 20.5937,  lng: 78.9629  },
  'Southeast Asia': { lat: 0.7893, lng: 113.9213 },
  Global:       { lat: 38.9072,  lng: -77.0369 },
};

export const getGpsData = (location, region) => {
  let hash = 0;
  for (let i = 0; i < location.length; i++) {
    hash = location.charCodeAt(i) + ((hash << 5) - hash);
  }
  const base = REGION_CENTERS[region] || REGION_CENTERS.Global;
  const offsetLat = (hash % 100) / 25;
  const offsetLng = ((hash >> 8) % 100) / 25;
  return `${(base.lat + offsetLat).toFixed(4)}, ${(base.lng + offsetLng).toFixed(4)}`;
};
