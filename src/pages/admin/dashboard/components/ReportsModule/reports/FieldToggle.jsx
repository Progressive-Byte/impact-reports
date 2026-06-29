import SafeIcon from '../../../../../../common/SafeIcon';

const FieldToggle = ({ fieldKey, hiddenFields = [], onToggle }) => {
  const isHidden = (hiddenFields || []).includes(fieldKey);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle?.(fieldKey); }}
      title={isHidden ? 'Click to show on public page' : 'Click to hide on public page'}
      className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md transition-all ${
        isHidden
          ? 'text-gray-400 bg-gray-100 hover:bg-gray-200'
          : 'text-green-600 bg-green-50 hover:bg-green-100'
      }`}
    >
      <SafeIcon icon={isHidden ? 'FiEyeOff' : 'FiEye'} className="text-[10px]" />
      {isHidden ? 'Hidden' : 'Visible'}
    </button>
  );
};

export default FieldToggle;
