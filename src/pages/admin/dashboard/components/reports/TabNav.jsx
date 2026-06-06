const TABS = [
  { id: 1, label: 'General' },
  { id: 2, label: 'Narrative' },
  { id: 3, label: 'Metrics' },
  { id: 4, label: 'Media & Timeline' },
];

const TabNav = ({ active, onChange }) => (
  <div className="flex items-center gap-2 flex-wrap">
    {TABS.map(({ id, label }) => (
      <button
        key={id}
        onClick={() => onChange(id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          active === id
            ? 'bg-[#E52321] text-white'
            : 'border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 bg-white'
        }`}
      >
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
          active === id ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
        }`}>{id}</span>
        {label}
      </button>
    ))}
  </div>
);

export default TabNav;
