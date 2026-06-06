import Toggle from '../Toggle';

const ToggleRow = ({ title, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-4">
    <div className="pr-6">
      <p className="text-sm font-bold text-[#0B0D0F]">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export default ToggleRow;
