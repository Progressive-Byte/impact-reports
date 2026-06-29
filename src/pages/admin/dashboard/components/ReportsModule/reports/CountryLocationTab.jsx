import { useMemo, useEffect, useState } from 'react';
import { Country, State } from 'country-state-city';
import MultiSelect from './MultiSelect';
import GpsPickerModal from './GpsPickerModal';
import CountrySection from './CountrySection';
import FieldToggle from './FieldToggle';

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
  const [gpsOpen,   setGpsOpen]   = useState(new Set());
  const [collapsed, setCollapsed] = useState(new Set());
  const [pickerCfg, setPickerCfg] = useState(null);

  const toggleCollapse = (country) =>
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(country) ? next.delete(country) : next.add(country);
      return next;
    });

  const toggleGps = (id) =>
    setGpsOpen(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Memoised lookups ────────────────────────────────────────────────
  const stateMap = useMemo(() => {
    const map = {};
    form.countries.forEach(c => { map[c] = getStateOptions(c); });
    return map;
  }, [form.countries]);

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

  // Auto-fill library lat/lng for locations missing coords
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

  // ── Location field helpers ──────────────────────────────────────────
  const updateLocationField = (id, field, value) =>
    update('locations', form.locations.map(l => l.id === id ? { ...l, [field]: value } : l));

  const clearGps = (id) =>
    update('locations', form.locations.map(l => l.id === id ? { ...l, lat: '', lng: '' } : l));

  const removeLocation = (id) =>
    update('locations', form.locations.filter(l => l.id !== id));

  const addTextLocation = (country) =>
    update('locations', [...form.locations, { id: Date.now(), country, address: '' }]);

  const updateTextLocation = (id, address) =>
    update('locations', form.locations.map(l => l.id === id ? { ...l, address } : l));

  // ── State multi-select helpers ──────────────────────────────────────
  const getSelectedStates = (country) => {
    const sOpts = stateMap[country] ?? [];
    const sSet  = new Set(sOpts.map(s => s.value));
    return form.locations
      .filter(l => l.country === country && sSet.has(l.address))
      .map(l => l.address);
  };

  const handleStateChange = (country, selectedStates) => {
    const coords   = coordMap[country] || {};
    const stateSet = new Set(getStateOptions(country).map(s => s.value));
    const mapPicked = form.locations.filter(l =>
      l.country === country &&
      !stateSet.has(l.address) &&
      l.lat !== '' && l.lat != null &&
      l.lng !== '' && l.lng != null
    );
    const newStateLocs = selectedStates.map((address, i) => ({
      id:      Date.now() + i + Math.random(),
      country,
      address,
      lat:     coords[address]?.lat || '',
      lng:     coords[address]?.lng || '',
    }));
    const others = form.locations.filter(l => l.country !== country);
    update('locations', [...others, ...newStateLocs, ...mapPicked]);
  };

  // ── Country selection ───────────────────────────────────────────────
  const handleCountryChange = (newCountries) => {
    const kept    = form.locations.filter(l => newCountries.includes(l.country));
    const covered = new Set(kept.map(l => l.country));
    const seeds   = newCountries
      .filter(c => !covered.has(c) && getStateOptions(c).length === 0)
      .map(c => ({ id: Date.now() + Math.random(), country: c, address: '' }));
    update('countries', newCountries);
    update('locations', [...kept, ...seeds]);
  };

  // ── Map picker ──────────────────────────────────────────────────────
  const openMapForNew  = (country) => setPickerCfg({ country, mode: 'new' });
  const openMapForEdit = (loc)     => setPickerCfg({
    country:     loc.country,
    locId:       loc.id,
    mode:        'edit',
    initialName: loc.address,
    initialLat:  loc.lat,
    initialLng:  loc.lng,
  });

  const handlePickerConfirm = (name, lat, lng) => {
    if (pickerCfg.mode === 'new') {
      update('locations', [...form.locations, {
        id:      Date.now() + Math.random(),
        country: pickerCfg.country,
        address: name,
        lat,
        lng,
      }]);
    } else {
      update('locations', form.locations.map(l =>
        l.id === pickerCfg.locId ? { ...l, lat, lng } : l
      ));
    }
    setPickerCfg(null);
  };

  return (
    <div className="space-y-5">
      {/* Country multi-selector */}
      <MultiSelect
        label="Project Countries"
        required
        value={form.countries}
        onChange={handleCountryChange}
        options={COUNTRY_OPTIONS}
        placeholder="Search and select countries..."
        error={fieldErrors.countries}
      />

      {/* Per-country sections */}
      {form.countries.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Locations Implemented <span className="text-[#E52321]">*</span>
          </p>

          {form.countries.map(country => {
            const stateOptions   = stateMap[country] ?? [];
            const hasStates      = stateOptions.length > 0;
            const stateSet       = new Set(stateOptions.map(s => s.value));
            const countryLocs    = form.locations.filter(l => l.country === country);
            const mapPickedLocs  = hasStates
              ? countryLocs.filter(l =>
                  !stateSet.has(l.address) &&
                  l.lat !== '' && l.lat != null &&
                  l.lng !== '' && l.lng != null
                )
              : [];
            const stateLocs   = countryLocs.filter(l => stateSet.has(l.address));
            const filledCount = hasStates
              ? stateLocs.length + mapPickedLocs.length
              : countryLocs.filter(l => l.address.trim()).length;

            return (
              <CountrySection
                key={country}
                country={country}
                stateOptions={stateOptions}
                hasStates={hasStates}
                stateSet={stateSet}
                selectedStates={getSelectedStates(country)}
                countryLocs={countryLocs}
                mapPickedLocs={mapPickedLocs}
                stateLocs={stateLocs}
                locError={fieldErrors[`loc_${country}`]}
                filledCount={filledCount}
                isCollapsed={collapsed.has(country)}
                gpsOpen={gpsOpen}
                onToggleCollapse={() => toggleCollapse(country)}
                onStateChange={states => handleStateChange(country, states)}
                onUpdateTextLocation={updateTextLocation}
                onToggleGps={toggleGps}
                onUpdateLocationField={updateLocationField}
                onOpenMapForEdit={openMapForEdit}
                onClearGps={clearGps}
                onRemoveLocation={removeLocation}
                onAddTextLocation={() => addTextLocation(country)}
                onOpenMapForNew={() => openMapForNew(country)}
              />
            );
          })}
        </div>
      )}

      {/* GPS / Map picker modal */}
      {pickerCfg && (
        <GpsPickerModal
          country={pickerCfg.country}
          initialName={pickerCfg.initialName || ''}
          initialLat={pickerCfg.initialLat}
          initialLng={pickerCfg.initialLng}
          nameReadOnly={pickerCfg.mode === 'edit'}
          onConfirm={handlePickerConfirm}
          onClose={() => setPickerCfg(null)}
        />
      )}
    </div>
  );
};

export default CountryLocationTab;
