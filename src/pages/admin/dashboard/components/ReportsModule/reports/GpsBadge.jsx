import SafeIcon from '../../../../../../common/SafeIcon';

const GpsBadge = ({ loc, isOpen, onClick }) => {
  const has = loc.lat && loc.lng;
  return (
    <button
      type="button"
      onClick={onClick}
      title={has ? `GPS: ${Number(loc.lat).toFixed(4)}, ${Number(loc.lng).toFixed(4)}` : 'Add GPS coordinates'}
      className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${
        has
          ? isOpen
            ? 'bg-green-100 border-green-300 text-green-700'
            : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
          : isOpen
            ? 'bg-gray-100 border-gray-300 text-gray-600'
            : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
      }`}
    >
      <SafeIcon icon={has ? 'FiCheckCircle' : 'FiNavigation'} className="text-[10px]" />
      {has ? `${Number(loc.lat).toFixed(2)}, ${Number(loc.lng).toFixed(2)}` : 'GPS'}
    </button>
  );
};

export default GpsBadge;
