import SafeIcon from '../../../../../../common/SafeIcon';

const baseClasses =
  'w-full rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 placeholder:font-medium transition-all';

const editableClasses =
  'border border-gray-200 text-gray-700 bg-white focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] focus:ring-offset-0';

const readOnlyClasses =
  'border border-gray-200 text-gray-600 bg-gray-50 cursor-default outline-none select-text';

const errorBorderClasses =
  'border-red-400 focus:border-red-400 focus:ring-[3px] focus:ring-red-100 focus:ring-offset-0';

export const Input = ({ label, required, error, readOnly, className = '', ...props }) => (
  <div className={className}>
    {label && (
      <label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium text-gray-700">
        {label}
        {required && !readOnly && <span className="text-[#E52321]">*</span>}
        {readOnly && <SafeIcon icon="FiLock" className="text-[10px] text-gray-400" />}
      </label>
    )}
    <input
      {...props}
      readOnly={readOnly}
      className={`${baseClasses} ${
        readOnly
          ? readOnlyClasses
          : `${editableClasses} ${error ? errorBorderClasses : ''}`
      }`}
    />
    {error && !readOnly && (
      <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
    )}
  </div>
);

export const Textarea = ({ label, required, error, readOnly, className = '', rows = 5, ...props }) => (
  <div className={className}>
    {label && (
      <label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium text-gray-700">
        {label}
        {required && !readOnly && <span className="text-[#E52321]">*</span>}
        {readOnly && <SafeIcon icon="FiLock" className="text-[10px] text-gray-400" />}
      </label>
    )}
    <textarea
      rows={rows}
      {...props}
      readOnly={readOnly}
      className={`${baseClasses} resize-none ${
        readOnly
          ? readOnlyClasses
          : `${editableClasses} ${error ? errorBorderClasses : ''}`
      }`}
    />
    {error && !readOnly && (
      <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
    )}
  </div>
);

export const Select = ({ label, required, options = [], className = '', ...props }) => (
  <div className={className}>
    {label && (
      <label className="block mb-1.5 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-[#E52321]">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        {...props}
        className={`${baseClasses} ${editableClasses} appearance-none cursor-pointer pr-11`}
      >
        {options.map(({ value, label: optLabel }) => (
          <option key={value} value={value}>{optLabel}</option>
        ))}
      </select>
      <SafeIcon
        icon="FiChevronDown"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400"
      />
    </div>
  </div>
);
