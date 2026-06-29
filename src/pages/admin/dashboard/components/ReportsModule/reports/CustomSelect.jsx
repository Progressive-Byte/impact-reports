import { useState, useRef, useEffect } from 'react';
import SafeIcon from '../../../../../../common/SafeIcon';

const CustomSelect = ({
  label,
  required,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  error,
  rightLabel,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);
  const isEmpty = value === '' || value === null || value === undefined;

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-[#E52321]">*</span>}
          </label>
          {rightLabel}
        </div>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between border rounded-xl px-4 py-3 text-sm text-left bg-white transition-colors ${
          open ? 'border-[#E52321]' : error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={isEmpty ? 'text-gray-400' : 'text-gray-700'}>
          {selected?.label ?? placeholder}
        </span>
        <SafeIcon
          icon="FiChevronDown"
          className={`text-gray-400 text-sm flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                  isSelected
                    ? 'bg-red-50 text-[#E52321]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <SafeIcon icon="FiCheck" className="text-[#E52321] text-sm flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
