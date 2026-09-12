import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SafeIcon from '../../../../common/SafeIcon';
import { getCountryPos } from '../../../../utils/countryCoords';
import '../../../../utils/leafletDefaultIcon';
import { TILE_LAYER_URL, TILE_LAYER_ATTRIBUTION } from '../../../../utils/mapTiles';

// Fits the map viewport to given positions whenever they change
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (!positions.length) return;
    if (positions.length === 1) {
      map.flyTo(positions[0], 5, { duration: 0.8 });
    } else {
      map.flyToBounds(L.latLngBounds(positions), { padding: [40, 40], duration: 0.8 });
    }
  }, [positions, map]);
  return null;
};

const LocationsMapCanvas = ({ locations, selectedCountry, onSelectCountry, minHeight = '500px' }) => {
  const allPositions = locations
    .map(({ country }) => getCountryPos(country))
    .filter(Boolean);

  const visibleLocations = selectedCountry
    ? locations.filter((l) => l.country === selectedCountry)
    : locations;

  const positions = visibleLocations
    .map(({ country }) => getCountryPos(country))
    .filter(Boolean);

  return (
    <div className="relative rounded-[2rem] overflow-hidden shadow-lg border border-gray-100" style={{ minHeight }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%', minHeight, zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          subdomains="abc"
          maxZoom={19}
        />
        <AttributionControl position="bottomright" prefix={false} />
        <FitBounds positions={selectedCountry ? positions : allPositions} />
        {visibleLocations.map(({ country, reportCount }) => {
          const pos = getCountryPos(country);
          if (!pos) return null;
          return (
            <Marker
              key={country}
              position={pos}
              eventHandlers={{ click: () => onSelectCountry(country) }}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={selectedCountry === country}>
                <div className="font-sans px-3 py-1">
                  <p className="font-black text-[9px] uppercase tracking-widest text-[#E52321] mb-0.5">
                    {reportCount} Report{reportCount === 1 ? '' : 's'}
                  </p>
                  <p className="font-bold text-gray-900 text-xs">{country}</p>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
      <div className="absolute bottom-6 left-6 z-[10] flex items-center space-x-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-sm pointer-events-none">
        <SafeIcon icon="FiMap" className="text-[#E52321] text-sm" />
        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
          {selectedCountry ? `Showing: ${selectedCountry}` : 'All Reporting Countries'}
        </span>
      </div>
    </div>
  );
};

export default LocationsMapCanvas;
