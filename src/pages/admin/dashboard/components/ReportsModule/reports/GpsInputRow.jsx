import SafeIcon from '../../../../../../common/SafeIcon';

const GpsInputRow = ({ loc, onLatChange, onLngChange, onPickMap, onClear }) => (
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
        title="Clear GPS"
        className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
      >
        <SafeIcon icon="FiX" className="text-xs" />
      </button>
    )}
  </div>
);

export default GpsInputRow;
