import { useState, useRef, useEffect } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../../../../../common/SafeIcon';

// Derived from the installed react-icons/fi package — no hardcoding needed.
// Automatically includes any new icons when react-icons is updated.
const ICONS = Object.keys(FiIcons).filter(k => k.startsWith('Fi')).sort();

const IconPicker = ({ value, onChange }) => {
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

  const query    = search.trim().toLowerCase();
  const filtered = query
    ? ICONS.filter(ic => ic.toLowerCase().replace('fi', '').includes(query.replace('fi', '')))
    : ICONS;

  const select = (icon) => {
    onChange(icon);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        title="Choose icon"
        className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center transition-colors border ${
          open ? 'border-[#E52321] ring-[3px] ring-[#fdecec]' : 'border-gray-200 hover:border-[#E52321]'
        }`}
      >
        <SafeIcon icon={value || 'FiBox'} className="text-[#E52321] text-lg" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-[17rem] bg-white border border-gray-200 rounded-xl shadow-xl z-50">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder={`Search ${ICONS.length} icons…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E52321] bg-white"
            />
          </div>
          <div className="p-2 grid grid-cols-6 gap-1 max-h-52 overflow-y-auto">
            {filtered.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => select(icon)}
                title={icon.replace('Fi', '')}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  value === icon
                    ? 'bg-red-50 border border-[#E52321] text-[#E52321]'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <SafeIcon icon={icon} className="text-lg" />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-6 py-4 text-center text-sm text-gray-400">No icons found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconPicker;
