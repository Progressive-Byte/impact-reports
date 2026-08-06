import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, AttributionControl } from 'react-leaflet';
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

// Reverse geocode a lat/lng using Nominatim → returns a short place name
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return '';
    const data = await res.json();
    const a = data.address || {};
    return (
      a.suburb || a.village || a.hamlet || a.neighbourhood ||
      a.town || a.city || a.county || a.state_district ||
      a.state || data.display_name?.split(',')[0] || ''
    );
  } catch {
    return '';
  }
}

/**
 * Props:
 *   country       — country name (used for centering + context)
 *   initialName   — pre-fill the name field (used when editing GPS on an existing location)
 *   initialLat    — pre-fill lat
 *   initialLng    — pre-fill lng
 *   nameReadOnly  — if true, the name field is read-only (editing mode — only coords matter)
 *   onConfirm(name, lat, lng) — called when user confirms
 *   onClose       — close without saving
 */
const GpsPickerModal = ({
  country,
  initialName = '',
  initialLat,
  initialLng,
  nameReadOnly = false,
  onConfirm,
  onClose,
}) => {
  const countryCenter = COUNTRY_COORDS[country] || [20, 0];

  const initLat = initialLat !== '' && initialLat != null ? Number(initialLat) : null;
  const initLng = initialLng !== '' && initialLng != null ? Number(initialLng) : null;

  const [lat,       setLat]       = useState(initLat !== null ? initLat : countryCenter[0]);
  const [lng,       setLng]       = useState(initLng !== null ? initLng : countryCenter[1]);
  const [name,      setName]      = useState(initialName);
  const [geocoding, setGeocoding] = useState(false);
  const [nameTouched, setNameTouched] = useState(!!initialName);

  const placePin = useCallback(async (clickLat, clickLng) => {
    const newLat = parseFloat(clickLat.toFixed(6));
    const newLng = parseFloat(clickLng.toFixed(6));
    setLat(newLat);
    setLng(newLng);

    // Auto-suggest name from reverse geocoding only if user hasn't typed a custom name
    if (!nameTouched && !nameReadOnly) {
      setGeocoding(true);
      const suggested = await reverseGeocode(newLat, newLng);
      setName(prev => (prev === '' || prev === name) ? suggested : prev);
      setGeocoding(false);
    }
  }, [nameTouched, nameReadOnly, name]);

  const handleDragEnd = useCallback(async (e) => {
    const p = e.target.getLatLng();
    await placePin(p.lat, p.lng);
  }, [placePin]);

  const canConfirm = nameReadOnly ? true : name.trim().length > 0;

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
                <h2 className="text-sm font-black text-[#0B0D0F]">
                  {nameReadOnly ? 'Edit GPS Coordinates' : 'Add Location on Map'}
                </h2>
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
          <div className="h-[340px] relative">
            <MapContainer
              center={countryCenter}
              zoom={initLat !== null ? 8 : 5}
              scrollWheelZoom
              attributionControl={false}
              style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                subdomains="abcd"
                maxZoom={19}
              />
              <AttributionControl position="bottomright" prefix={false} />
              <MapClickHandler onClick={placePin} />
              <Marker
                position={[lat, lng]}
                draggable
                eventHandlers={{ dragend: handleDragEnd }}
              />
            </MapContainer>

            {/* Geocoding indicator */}
            {geocoding && (
              <div className="absolute top-3 right-3 z-[10] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-gray-200 shadow-sm flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-[#E52321] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-gray-500">Looking up location…</span>
              </div>
            )}

            <div className="absolute bottom-3 left-3 z-[10] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-gray-200 shadow-sm">
              <p className="text-[9px] font-bold text-gray-500">Click anywhere · drag pin to reposition</p>
            </div>
          </div>

          {/* Name + coords + footer */}
          <div className="px-6 py-4 border-t border-gray-100 space-y-3">
            {/* Location name field */}
            {!nameReadOnly && (
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                  Location Name <span className="text-[#E52321]">*</span>
                  <span className="ml-2 text-gray-300 normal-case font-medium tracking-normal">
                    auto-filled from map click
                  </span>
                </p>
                <input
                  type="text"
                  placeholder="e.g. Kutupalong Camp, Cox's Bazar District…"
                  value={name}
                  onChange={e => { setName(e.target.value); setNameTouched(true); }}
                  className="w-full text-sm font-bold text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#E52321] transition-colors"
                />
                {!name.trim() && (
                  <p className="text-[10px] text-[#E52321] font-medium mt-1">
                    Click the map to auto-suggest a name, or type one manually.
                  </p>
                )}
              </div>
            )}

            {/* Coordinate row */}
            <div className="flex items-center gap-3">
              <SafeIcon icon="FiNavigation" className="text-gray-400 text-sm flex-shrink-0" />
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Latitude</p>
                  <input
                    type="number"
                    step="0.000001"
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
                    value={lng}
                    onChange={e => setLng(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold text-gray-700 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#E52321] transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-end gap-2 self-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => canConfirm && onConfirm(name, lat, lng)}
                  disabled={!canConfirm}
                  className="px-4 py-2 bg-[#E52321] hover:bg-[#c91d1b] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <SafeIcon icon="FiCheck" className="text-xs" />
                  {nameReadOnly ? 'Save Coordinates' : 'Add Location'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GpsPickerModal;
