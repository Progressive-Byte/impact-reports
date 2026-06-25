import SafeIcon from '../../../../../../common/SafeIcon';
import GpsInputRow from './GpsInputRow';

const GpsStateRow = ({ loc, isOpen, onToggle, onLatChange, onLngChange, onPickMap, onClear }) => {
  const has = loc.lat && loc.lng;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 py-1">
        <SafeIcon icon="FiMapPin" className="text-gray-300 text-[10px] flex-shrink-0" />
        <span className="flex-1 text-xs font-semibold text-gray-600 truncate">{loc.address}</span>
        {has && !isOpen && (
          <span className="text-[9px] text-green-500 font-bold font-mono tabular-nums">
            {Number(loc.lat).toFixed(4)}, {Number(loc.lng).toFixed(4)}
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all ${
            has
              ? isOpen ? 'bg-green-100 border-green-300 text-green-700' : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
              : isOpen ? 'bg-gray-100 border-gray-300 text-gray-600'   : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
          }`}
        >
          <SafeIcon icon={has ? 'FiCheckCircle' : 'FiNavigation'} className="text-[10px]" />
          {isOpen ? 'Hide' : has ? 'Edit GPS' : 'Add GPS'}
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
};

export default GpsStateRow;
