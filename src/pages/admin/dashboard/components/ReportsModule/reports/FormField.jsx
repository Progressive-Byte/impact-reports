import SafeIcon from '../../../../../../common/SafeIcon';

const inputClasses =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white placeholder:text-gray-400 placeholder:font-medium transition-all focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] focus:ring-offset-0";

export const Input = ({ label, required, className = '', ...props }) => (
  <div className={className}>
    {label && (
      <label className="block mb-1.5 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-[#E52321]">*</span>}
      </label>
    )}

    <input
      {...props}
      className={inputClasses}
    />
  </div>
);

export const Textarea = ({
  label,
  required,
  className = '',
  rows = 5,
  ...props
}) => (
  <div className={className}>
    {label && (
      <label className="block mb-1.5 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-[#E52321]">*</span>}
      </label>
    )}

    <textarea
      rows={rows}
      {...props}
      className={`${inputClasses} resize-none`}
    />
  </div>
);

export const Select = ({
  label,
  required,
  options = [],
  className = '',
  ...props
}) => (
  <div className={className}>
    {label && (
      <label className="block mb-1.5 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-[#E52321]">*</span>}
      </label>
    )}

    <div className="relative">
      <select
        {...props}
        className={`${inputClasses} appearance-none cursor-pointer pr-11`}
      >
        {options.map(({ value, label: optLabel }) => (
          <option key={value} value={value}>
            {optLabel}
          </option>
        ))}
      </select>

      <SafeIcon
        icon="FiChevronDown"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400"
      />
    </div>
  </div>
);