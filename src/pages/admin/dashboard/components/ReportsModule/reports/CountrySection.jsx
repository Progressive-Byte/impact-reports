import { AnimatePresence, motion } from 'framer-motion';
import SafeIcon from '../../../../../../common/SafeIcon';
import { Input } from './FormField';
import MultiSelect from './MultiSelect';
import GpsBadge from './GpsBadge';
import GpsInputRow from './GpsInputRow';
import GpsStateRow from './GpsStateRow';

const CountrySection = ({
  country,
  stateOptions,
  hasStates,
  stateSet,
  selectedStates,
  countryLocs,
  mapPickedLocs,
  stateLocs,
  locError,
  filledCount,
  isCollapsed,
  gpsOpen,
  onToggleCollapse,
  onStateChange,
  onUpdateTextLocation,
  onToggleGps,
  onUpdateLocationField,
  onOpenMapForEdit,
  onClearGps,
  onRemoveLocation,
  onAddTextLocation,
  onOpenMapForNew,
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">

    {/* Header — click to collapse/expand */}
    <button
      type="button"
      onClick={onToggleCollapse}
      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-md bg-[#E52321]/10 border border-[#E52321]/20 flex items-center justify-center flex-shrink-0">
          <SafeIcon icon="FiFlag" className="text-[#E52321] text-[10px]" />
        </div>
        <span className="text-sm font-black text-[#0B0D0F] truncate">{country}</span>
        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
          {filledCount} location{filledCount !== 1 ? 's' : ''}
        </span>
        {hasStates && (
          <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest whitespace-nowrap hidden sm:inline">
            · {stateOptions.length} regions available
          </span>
        )}
        {locError && (
          <p className="text-xs text-red-500 font-medium ml-2 shrink-0">{locError}</p>
        )}
      </div>
      <SafeIcon
        icon="FiChevronDown"
        className={`text-gray-400 text-base flex-shrink-0 ml-3 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
      />
    </button>

    {/* Body — animated */}
    <AnimatePresence initial={false}>
      {!isCollapsed && (
        <motion.div
          key="body"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <div className="p-4 space-y-4 border-t border-gray-100">

            {/* Section A: Select / Type locations */}
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <SafeIcon icon="FiList" className="text-[10px]" />
                {hasStates ? 'Select from regions / districts' : 'Type location name'}
              </p>

              {hasStates ? (
                <MultiSelect
                  value={selectedStates}
                  onChange={onStateChange}
                  options={stateOptions}
                  placeholder={`Select regions / districts in ${country}...`}
                />
              ) : (
                <div className="space-y-2">
                  {countryLocs.map((loc, idx) => (
                    <div key={loc.id} className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <SafeIcon
                            icon={loc.lat && loc.lng ? 'FiNavigation' : 'FiMapPin'}
                            className={`text-xs ${loc.lat && loc.lng ? 'text-green-500' : 'text-[#E52321]'}`}
                          />
                        </div>
                        <Input
                          placeholder={`Location ${idx + 1} — City, District or Region`}
                          value={loc.address}
                          onChange={e => onUpdateTextLocation(loc.id, e.target.value)}
                          className="flex-1"
                        />
                        <GpsBadge
                          loc={loc}
                          isOpen={gpsOpen.has(loc.id)}
                          onClick={() => onToggleGps(loc.id)}
                        />
                        <button
                          onClick={() => onRemoveLocation(loc.id)}
                          disabled={countryLocs.length === 1}
                          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#E52321] border border-gray-200 rounded-xl bg-white transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <SafeIcon icon="FiTrash2" className="text-xs" />
                        </button>
                      </div>
                      {gpsOpen.has(loc.id) && (
                        <GpsInputRow
                          loc={loc}
                          onLatChange={v => onUpdateLocationField(loc.id, 'lat', v)}
                          onLngChange={v => onUpdateLocationField(loc.id, 'lng', v)}
                          onPickMap={() => onOpenMapForEdit(loc)}
                          onClear={() => onClearGps(loc.id)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* GPS rows for state-based selections */}
              {hasStates && stateLocs.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    GPS Coordinates
                    <span className="ml-1.5 text-gray-300 normal-case font-medium tracking-normal">(optional override)</span>
                  </p>
                  {stateLocs.map(loc => (
                    <GpsStateRow
                      key={loc.id}
                      loc={loc}
                      isOpen={gpsOpen.has(loc.id)}
                      onToggle={() => onToggleGps(loc.id)}
                      onLatChange={v => onUpdateLocationField(loc.id, 'lat', v)}
                      onLngChange={v => onUpdateLocationField(loc.id, 'lng', v)}
                      onPickMap={() => onOpenMapForEdit(loc)}
                      onClear={() => onClearGps(loc.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section B: Pin on map */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <SafeIcon icon="FiMap" className="text-[10px]" />
                  Pin a specific location on the map
                </p>
                <span className="text-[9px] text-gray-300 font-medium">
                  for camps, villages, or rural areas
                </span>
              </div>

              {mapPickedLocs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {mapPickedLocs.map(loc => (
                    <div
                      key={loc.id}
                      className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full pl-2.5 pr-1.5 py-1 group"
                    >
                      <SafeIcon icon="FiNavigation" className="text-green-500 text-[10px] flex-shrink-0" />
                      <span className="text-[11px] font-bold text-[#0B0D0F] max-w-[140px] truncate">{loc.address}</span>
                      <span className="text-[9px] text-green-600 font-mono tabular-nums whitespace-nowrap">
                        {Number(loc.lat).toFixed(3)}, {Number(loc.lng).toFixed(3)}
                      </span>
                      <button
                        onClick={() => onOpenMapForEdit(loc)}
                        title="Edit coordinates"
                        className="w-4 h-4 flex items-center justify-center text-gray-300 hover:text-[#E52321] transition-colors"
                      >
                        <SafeIcon icon="FiEdit2" className="text-[9px]" />
                      </button>
                      <button
                        onClick={() => onRemoveLocation(loc.id)}
                        title="Remove"
                        className="w-4 h-4 flex items-center justify-center text-gray-300 hover:text-[#E52321] transition-colors"
                      >
                        <SafeIcon icon="FiX" className="text-[9px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                {!hasStates && (
                  <button
                    onClick={onAddTextLocation}
                    className="flex-1 border border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-[#76767e] font-semibold hover:bg-red-50 hover:border-[#E52321] hover:text-[#E52321] transition-colors flex items-center justify-center gap-2"
                  >
                    <SafeIcon icon="FiPlus" className="text-xs" />
                    Add location
                  </button>
                )}
                <button
                  onClick={onOpenMapForNew}
                  className={`${hasStates ? 'w-full' : 'flex-1'} border border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-gray-500 font-semibold hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2`}
                >
                  <SafeIcon icon="FiMap" className="text-xs" />
                  Add on Map
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default CountrySection;
