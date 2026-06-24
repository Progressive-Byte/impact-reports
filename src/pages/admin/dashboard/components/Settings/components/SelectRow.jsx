import CustomSelect from '../../ReportsModule/reports/CustomSelect';

const SelectRow = ({ title, description, value, onChange, options }) => (
  <div className="flex items-center justify-between gap-3 py-4">
    <div className="min-w-0">
      <p className="text-sm font-bold text-[#0B0D0F]">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
    <CustomSelect
      value={value}
      onChange={onChange}
      options={options}
      className="w-32 sm:w-44 shrink-0"
    />
  </div>
);

export default SelectRow;
