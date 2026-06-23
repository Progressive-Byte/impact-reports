import { useMemo, useEffect, useState } from 'react';
import { Country, State } from 'country-state-city';
import SafeIcon from '../../../../../../common/SafeIcon';
import { Input } from './FormField';
import MultiSelect from './MultiSelect';
import GpsPickerModal from './GpsPickerModal';

// Built once at module level
const ALL_COUNTRIES   = Country.getAllCountries();
const COUNTRY_OPTIONS = ALL_COUNTRIES.map(c => ({ value: c.name, label: c.name }));
const ISO_BY_NAME     = Object.fromEntries(ALL_COUNTRIES.map(c => [c.name, c.isoCode]));

function getStateOptions(countryName) {
  const iso = ISO_BY_NAME[countryName];
  if (!iso) return [];
  return State.getStatesOfCountry(iso).map(s => ({ value: s.name, label: s.name }));
}

const CountryLocationTab = ({ form, update, fieldErrors = {} }) => {
  const [gpsOpen,    setGpsOpen]    = useState(new Set()); // Set<loc.id>
  const [pickerLoc,  setPickerLoc]  = useState(null);       // loc object for map picker

  const stateMap = useMemo(() => {
    const map = {};
    form.countries.forEach(c => { map[c] = getStateOptions(c); });
    return map;
  }, [form.countries]);

  // lat/lng lookup: { countryName → { stateName → { lat, lng } } }
  const coordMap = useMemo(() => {
    const map = {};
    form.countries.forEach(c => {
      const iso = ISO_BY_NAME[c];
      if (!iso) return;
      map[c] = Object.fromEntries(
        State.getStatesOfCountry(iso).map(s => [
          s.name,
          { lat: s.latitude || '', lng: s.longitude || '' },
        ])
      );
    });
    return map;
  }, [form.countries]);

  // Auto-fill lat/lng from library for locations that have an address but empty coords
  useEffect(() => {
    const needsFill = form.locations.some(l => l.address && (!l.lat || !l.lng));
    if (!needsFill) return;
    const filled = form.locations.map(l => {
      if (!l.address || (l.lat && l.lng)) return l;
      const coords = coordMap[l.country]?.[l.address];
      if (!coords?.lat) return l;
      return { ...l, lat: coords.lat, lng: coords.lng };
    });
    update('locations', filled);
  }, [coordMap]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GPS helpers ────────────────────────────────────────────────────
  const toggleGps = (id) =>
    setGpsOpen(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const updateLocationField = (id, field, value) =>
    update('locations', form.locations.map(l => l.id === id ? { ...l, [field]: value } : l));

  const updateGps = (id, lat, lng) =>
    update('locations', form.locations.map(l => l.id === id ? { ...l, lat, lng } : l));

  const clearGps = (id) =>
    update('locations', form.locations.map(l => l.id === id ? { ...l, lat: '', lng: '' } : l));

  // ── Country selection ──────────────────────────────────────────────
  const handleCountryChange = (newCountries) => {
    const kept    = form.locations.filter(l => newCountries.includes(l.country));
    const covered = new Set(kept.map(l => l.country));
    // For newly added countries that have NO state data, seed one blank text row
    const seeds   = newCountries
      .filter(c => !covered.has(c) && getStateOptions(c).length === 0)
      .map(c => ({ id: Date.now() + Math.random(), country: c, address: '' }));
    update('countries', newCountries);
    update('locations', [...kept, ...seeds]);
  };

  // ── Location helpers (used by free-text fallback) ──────────────────
  const addTextLocation = (country) =>
    update('locations', [...form.locations, { id: Date.now(), country, address: '' }]);

  const removeTextLocation = (id) =>
    update('locations', form.locations.filter(l => l.id !== id));

  const updateTextLocation = (id, address) =>
    update('locations', form.locations.map(l => l.id === id ? { ...l, address } : l));

  // ── State multi-select helper ──────────────────────────────────────
  const getSelectedStates = (country) =>
    form.locations.filter(l => l.country === country && l.address.trim()).map(l => l.address);

  const handleStateChange = (country, selectedStates) => {
    const coords  = coordMap[country] || {};
    const others  = form.locations.filter(l => l.country !== country);
    const newLocs = selectedStates.map((address, i) => ({
      id:      Date.now() + i + Math.random(),
      country,
      address,
      lat:     coords[address]?.lat || '',
      lng:     coords[address]?.lng || '',
    }));
    update('locations', [...others, ...newLocs]);
  };

  return (
    <div className="space-y-5">
      {/* ── Country multi-selector ──────────────────────────────────── */}
      <MultiSelect
        label="Project Countries"
        required
        value={form.countries}
        onChange={handleCountryChange}
        options={COUNTRY_OPTIONS}
        placeholder="Search and select countries..."
        error={fieldErrors.countries}
      />

      {/* ── Per-country location sections ───────────────────────────── */}
      {form.countries.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Locations Implemented <span className="text-[#E52321]">*</span>
          </p>

          {form.countries.map(country => {
            const stateOptions   = stateMap[country] ?? [];
            const hasStates      = stateOptions.length > 0;
            const selectedStates = getSelectedStates(country);
            const countryLocs    = form.locations.filter(l => l.country === country);
            const locError       = fieldErrors[`loc_${country}`];
            const filledCount    = hasStates
              ? selectedStates.length
              : countryLocs.filter(l => l.address.trim()).length;

            return (
              <div key={country} className="border border-gray-200 rounded-xl">
                {/* Country header bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#E52321]/10 border border-[#E52321]/20 flex items-center justify-center flex-shrink-0">
                      <SafeIcon icon="FiFlag" className="text-[#E52321] text-[10px]" />
                    </div>
                    <span className="text-sm font-black text-[#0B0D0F]">{country}</span>
                    <span className="text-xs text-gray-400 font-medium">
                      {filledCount} location{filledCount !== 1 ? 's' : ''}
                    </span>
                    {hasStates && (
                      <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">
                        · {stateOptions.length} available
                      </span>
                    )}
                  </div>
                  {locError && (
                    <p className="text-xs text-red-500 font-medium">{locError}</p>
                  )}
                </div>

                {/* Location body */}
                <div className="p-4">
                  {hasStates ? (
                    /* ── Multi-select for states/provinces ── */
                    <div className="space-y-3">
                      <MultiSelect
                        value={selectedStates}
                        onChange={val => handleStateChange(country, val)}
                        options={stateOptions}
                        placeholder={`Select states / provinces in ${country}...`}
                      />
                      {/* GPS rows for each selected state */}
                      {countryLocs.filter(l => l.address.trim()).length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            GPS Coordinates <span className="text-gray-300 normal-case font-medium tracking-normal">(optional — overrides library defaults)</span>
                          </p>
                          {countryLocs.filter(l => l.address.trim()).map(loc => (
                            <GpsLocationRow
                              key={loc.id}
                              loc={loc}
                              label={loc.address}
                              isOpen={gpsOpen.has(loc.id)}
                              onToggle={() => toggleGps(loc.id)}
                              onLatChange={v => updateLocationField(loc.id, 'lat', v)}
                              onLngChange={v => updateLocationField(loc.id, 'lng', v)}
                              onPickMap={() => setPickerLoc(loc)}
                              onClear={() => clearGps(loc.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── Free-text rows for countries without state data ── */
                    <div className="space-y-2">
                      {countryLocs.map((loc, idx) => (
                        <div key={loc.id} className="space-y-1.5">
                          {/* Address row */}
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                              <SafeIcon icon="FiMapPin" className="text-[#E52321] text-xs" />
                            </div>
                            <Input
                              placeholder={`Location ${idx + 1} — City, District or Region`}
                              value={loc.address}
                              onChange={e => updateTextLocation(loc.id, e.target.value)}
                              className="flex-1"
                            />
                            {/* GPS toggle */}
                            <GpsBadgeButton
                              loc={loc}
                              isOpen={gpsOpen.has(loc.id)}
                              onClick={() => toggleGps(loc.id)}
                            />
                            <button
                              onClick={() => removeTextLocation(loc.id)}
                              disabled={countryLocs.length === 1}
                              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#E52321] border border-gray-200 rounded-xl bg-white transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <SafeIcon icon="FiTrash2" className="text-xs" />
                            </button>
                          </div>
                          {/* GPS input row — shown when expanded */}
                          {gpsOpen.has(loc.id) && (
                            <GpsInputRow
                              loc={loc}
                              onLatChange={v => updateLocationField(loc.id, 'lat', v)}
                              onLngChange={v => updateLocationField(loc.id, 'lng', v)}
                              onPickMap={() => setPickerLoc(loc)}
                              onClear={() => clearGps(loc.id)}
                            />
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addTextLocation(country)}
                        className="mt-1 w-full border border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-[#76767e] font-semibold hover:bg-red-50 hover:border-[#E52321] hover:text-[#E52321] transition-colors flex items-center justify-center gap-2"
                      >
                        <SafeIcon icon="FiPlus" className="text-xs" />
                        Add location in {country}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GPS map picker modal */}
      {pickerLoc && (
        <GpsPickerModal
          country={pickerLoc.country}
          initialLat={pickerLoc.lat}
          initialLng={pickerLoc.lng}
          onConfirm={(lat, lng) => {
            updateGps(pickerLoc.id, lat, lng);
            setGpsOpen(prev => new Set([...prev, pickerLoc.id]));
            setPickerLoc(null);
          }}
          onClose={() => setPickerLoc(null)}
        />
      )}
    </div>
  );
};

// ── Small helper sub-components ────────────────────────────────────────

function GpsBadgeButton({ loc, isOpen, onClick }) {
  const hasGps = loc.lat && loc.lng;
  return (
    <button
      type="button"
      onClick={onClick}
      title={hasGps ? `GPS: ${Number(loc.lat).toFixed(4)}, ${Number(loc.lng).toFixed(4)}` : 'Add GPS coordinates'}
      className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
        hasGps
          ? isOpen
            ? 'bg-green-100 border-green-300 text-green-700'
            : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
          : isOpen
            ? 'bg-gray-100 border-gray-300 text-gray-600'
            : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
      }`}
    >
      <SafeIcon icon={hasGps ? 'FiCheckCircle' : 'FiNavigation'} className="text-[10px]" />
      {hasGps
        ? `${Number(loc.lat).toFixed(2)}, ${Number(loc.lng).toFixed(2)}`
        : 'GPS'}
    </button>
  );
}

function GpsInputRow({ loc, onLatChange, onLngChange, onPickMap, onClear }) {
  return (
    <div className="ml-10 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
      <SafeIcon icon="FiNavigation" className="text-gray-300 text-xs flex-shrink-0" />
      <input
        type="number"
        step="0.000001"
        placeholder="Latitude"
        value={loc.lat || ''}
        onChange={e => onLatChange(e.target.value)}
        className="w-28 text-xs font-bold text-gray-700 bg-transparent outline-none border-b border-gray-200 focus:border-[#E52321] transition-colors pb-0.5"
      />
      <input
        type="number"
        step="0.000001"
        placeholder="Longitude"
        value={loc.lng || ''}
        onChange={e => onLngChange(e.target.value)}
        className="w-28 text-xs font-bold text-gray-700 bg-transparent outline-none border-b border-gray-200 focus:border-[#E52321] transition-colors pb-0.5"
      />
      <button
        type="button"
        onClick={onPickMap}
        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:border-[#E52321] hover:text-[#E52321] transition-colors ml-auto flex-shrink-0"
      >
        <SafeIcon icon="FiMap" className="text-[10px]" />
        Pick on Map
      </button>
      {(loc.lat || loc.lng) && (
        <button
          type="button"
          onClick={onClear}
          title="Clear GPS coordinates"
          className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <SafeIcon icon="FiX" className="text-xs" />
        </button>
      )}
    </div>
  );
}

function GpsLocationRow({ loc, label, isOpen, onToggle, onLatChange, onLngChange, onPickMap, onClear }) {
  const hasGps = loc.lat && loc.lng;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 py-1">
        <SafeIcon icon="FiMapPin" className="text-gray-300 text-[10px] flex-shrink-0" />
        <span className="flex-1 text-xs font-semibold text-gray-600 truncate">{label}</span>
        {hasGps && !isOpen && (
          <span className="text-[9px] text-green-500 font-bold font-mono tabular-nums">
            {Number(loc.lat).toFixed(4)}, {Number(loc.lng).toFixed(4)}
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all ${
            hasGps
              ? isOpen
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
              : isOpen
                ? 'bg-gray-100 border-gray-300 text-gray-600'
                : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
          }`}
        >
          <SafeIcon icon={hasGps ? 'FiCheckCircle' : 'FiNavigation'} className="text-[10px]" />
          {isOpen ? 'Hide' : (hasGps ? 'Edit' : 'Add GPS')}
        </button>
      </div>
      {isOpen && (
        <GpsInputRow
          loc={loc}
          onLatChange={onLatChange}
          onLngChange={onLngChange}
          onPickMap={onPickMap}
          onClear={onClear}
        />
      )}
    </div>
  );
}

export default CountryLocationTab;
