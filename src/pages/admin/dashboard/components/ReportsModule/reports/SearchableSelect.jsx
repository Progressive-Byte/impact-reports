import { useState, useRef, useEffect } from 'react';
import SafeIcon from '../../../../../../common/SafeIcon';

const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  disabled = false,
  className = '',
}) => {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered  = search.trim()
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;
  const selected  = options.find(o => o.value === value);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(v => !v)}
        className={`w-full flex items-center justify-between border rounded-xl px-4 py-3 text-sm text-left bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          open
            ? 'border-[#E52321] ring-[3px] ring-[#fdecec]'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className={selected ? 'text-gray-700 font-medium' : 'text-gray-400'}>
          {selected?.label ?? placeholder}
        </span>
        <SafeIcon
          icon="FiChevronDown"
          className={`text-gray-400 text-sm flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              onClick={e => e.stopPropagation()}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E52321] bg-white"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                  value === opt.value
                    ? 'bg-red-50 text-[#E52321]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{opt.label}</span>
                {value === opt.value && (
                  <SafeIcon icon="FiCheck" className="text-[#E52321] text-sm flex-shrink-0" />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-4 text-sm text-gray-400 text-center">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
