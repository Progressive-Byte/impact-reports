import SafeIcon from '../../../../../../common/SafeIcon';

export const Input = ({ label, required, className = '', ...props }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-[#E52321]">*</span>}
      </label>
    )}
    <input
      {...props}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-gray-300 bg-white transition-colors"
    />
  </div>
);

export const Textarea = ({ label, required, className = '', rows = 5, ...props }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-[#E52321]">*</span>}
      </label>
    )}
    <textarea
      rows={rows}
      {...props}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-gray-300 bg-white transition-colors resize-none"
    />
  </div>
);

export const Select = ({ label, required, options = [], className = '', ...props }) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-[#E52321]">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        {...props}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-gray-300 bg-white appearance-none transition-colors cursor-pointer"
      >
        {options.map(({ value, label: optLabel }) => (
          <option key={value} value={value}>{optLabel}</option>
        ))}
      </select>
      <SafeIcon icon="FiChevronDown" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
    </div>
  </div>
);
