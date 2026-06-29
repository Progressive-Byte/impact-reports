import { useState, useRef, useEffect } from 'react';
import SafeIcon from '../../../../../../common/SafeIcon';

const MultiSelect = ({
  label,
  required,
  error,
  readOnly,
  value = [],
  onChange,
  options = [],
  placeholder = 'Select...',
  rightLabel,
}) => {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);
  };

  const remove = (e, id) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== id));
  };

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.filter(o => value.includes(o.value));

  // ── Read-only display ──────────────────────────────────────────────
  if (readOnly) {
    return (
      <div>
        {label && (
          <label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium text-gray-700">
            {label}
            <SafeIcon icon="FiLock" className="text-[10px] text-gray-400" />
          </label>
        )}
        <div className="w-full min-h-[46px] flex flex-wrap items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 bg-gray-50">
          {selected.length > 0 ? selected.map(o => (
            <span
              key={o.value}
              className="inline-flex items-center bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold px-2.5 py-1 rounded-lg"
            >
              {o.label}
            </span>
          )) : (
            <span className="text-gray-400 text-sm">—</span>
          )}
        </div>
      </div>
    );
  }

  // ── Editable ───────────────────────────────────────────────────────
  return (
    <div className="relative" ref={ref}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-[#E52321]">*</span>}
          </label>
          {rightLabel}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full min-h-[46px] flex items-center justify-between border rounded-xl px-4 py-2 text-sm text-left bg-white transition-colors ${
          error
            ? 'border-red-400'
            : open
              ? 'border-[#E52321] ring-[3px] ring-[#fdecec]'
              : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex flex-wrap gap-1.5 flex-1 py-0.5">
          {selected.length > 0 ? selected.map(o => (
            <span
              key={o.value}
              className="inline-flex items-center gap-1 bg-red-50 text-[#E52321] border border-red-200 text-xs font-bold px-2.5 py-1 rounded-lg"
            >
              {o.label}
              <span role="button" onClick={(e) => remove(e, o.value)} className="hover:opacity-70 cursor-pointer leading-none">
                <SafeIcon icon="FiX" className="text-[10px]" />
              </span>
            </span>
          )) : (
            <span className="text-gray-400 font-medium">{placeholder}</span>
          )}
        </div>
        <SafeIcon
          icon="FiChevronDown"
          className={`text-gray-400 text-sm flex-shrink-0 ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
              autoComplete="off"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E52321] bg-white"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(opt => {
              const isSelected = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                    isSelected ? 'bg-red-50 text-[#E52321]' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <SafeIcon icon="FiCheck" className="text-[#E52321] text-sm flex-shrink-0" />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400 text-center">No users found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
