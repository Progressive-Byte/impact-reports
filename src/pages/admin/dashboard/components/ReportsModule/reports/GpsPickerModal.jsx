import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Country } from 'country-state-city';
import SafeIcon from '../../../../../../common/SafeIcon';

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const COUNTRY_COORDS = Object.fromEntries(
  Country.getAllCountries()
    .filter(c => c.latitude && c.longitude)
    .map(c => [c.name, [parseFloat(c.latitude), parseFloat(c.longitude)]])
);

const MapClickHandler = ({ onClick }) => {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
};

const GpsPickerModal = ({ country, initialLat, initialLng, onConfirm, onClose }) => {
  const countryCenter = COUNTRY_COORDS[country] || [20, 0];

  const initLat = initialLat !== '' && initialLat != null ? Number(initialLat) : null;
  const initLng = initialLng !== '' && initialLng != null ? Number(initialLng) : null;

  const [lat, setLat] = useState(initLat !== null ? initLat : countryCenter[0]);
  const [lng, setLng] = useState(initLng !== null ? initLng : countryCenter[1]);

  const handleMapClick = useCallback((clickLat, clickLng) => {
    setLat(parseFloat(clickLat.toFixed(6)));
    setLng(parseFloat(clickLng.toFixed(6)));
  }, []);

  const handleDragEnd = useCallback((e) => {
    const p = e.target.getLatLng();
    setLat(parseFloat(p.lat.toFixed(6)));
    setLng(parseFloat(p.lng.toFixed(6)));
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[400] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E52321]/10 flex items-center justify-center">
                <SafeIcon icon="FiMapPin" className="text-[#E52321] text-base" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#0B0D0F]">Pick GPS Location</h2>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {country} — click map or drag pin to position
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
            >
              <SafeIcon icon="FiX" className="text-sm" />
            </button>
          </div>

          {/* Map */}
          <div className="h-[360px]">
            <MapContainer
              center={countryCenter}
              zoom={5}
              scrollWheelZoom
              style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              <MapClickHandler onClick={handleMapClick} />
              <Marker
                position={[lat, lng]}
                draggable
                eventHandlers={{ dragend: handleDragEnd }}
              />
            </MapContainer>
          </div>

          {/* Coordinate inputs + footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
            <SafeIcon icon="FiNavigation" className="text-gray-400 text-sm flex-shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Latitude</p>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="e.g. 2.5036"
                  value={lat}
                  onChange={e => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold text-gray-700 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#E52321] transition-colors"
                />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Longitude</p>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="e.g. 41.8662"
                  value={lng}
                  onChange={e => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold text-gray-700 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#E52321] transition-colors"
                />
              </div>
            </div>
            <div className="flex items-end gap-2 pb-px">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(lat, lng)}
                className="px-4 py-2 bg-[#E52321] hover:bg-[#c91d1b] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <SafeIcon icon="FiCheck" className="text-xs" />
                Use Location
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GpsPickerModal;
