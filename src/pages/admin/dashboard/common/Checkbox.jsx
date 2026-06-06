import SafeIcon from '../../../../common/SafeIcon';

const Checkbox = ({ checked, onChange, className = '' }) => (
  <label className={`relative flex items-center justify-center w-4 h-4 cursor-pointer flex-shrink-0 ${className}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="peer sr-only"
    />
    <div className="w-4 h-4 rounded border border-gray-300 bg-white peer-checked:bg-[#E52321] peer-checked:border-[#E52321] transition-colors" />
    <SafeIcon
      icon="FiCheck"
      className="absolute text-white text-[9px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
    />
  </label>
);

export default Checkbox;
