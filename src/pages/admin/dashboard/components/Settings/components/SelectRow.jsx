import CustomSelect from '../../ReportsModule/reports/CustomSelect';

const SelectRow = ({ title, description, value, onChange, options }) => (
  <div className="flex items-center justify-between py-4">
    <div className="pr-6">
      <p className="text-sm font-bold text-[#0B0D0F]">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
    <CustomSelect
      value={value}
      onChange={onChange}
      options={options}
      className="w-44"
    />
  </div>
);

export default SelectRow;
