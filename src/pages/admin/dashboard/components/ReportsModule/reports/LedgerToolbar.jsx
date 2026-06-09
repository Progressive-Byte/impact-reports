import SafeIcon from '../../../../../../common/SafeIcon';
import CustomSelect from './CustomSelect';

const FILTERS = ['all', 'published', 'pending', 'draft'];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recent' },
  { value: 'oldest', label: 'Oldest' },
];

const LedgerToolbar = ({ activeFilter, onFilterChange, loadingList, search, onSearchChange, sort, onSortChange }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-3 flex-wrap">
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-1 flex gap-0.5 flex-shrink-0">
      {FILTERS.map(f => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          disabled={loadingList}
          className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all disabled:opacity-60 ${
            activeFilter === f
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>

    <div className="flex-1 relative min-w-[180px]">
      <SafeIcon icon="FiSearch" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
      <input
        type="text"
        placeholder="Search reports..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] bg-white"
      />
    </div>

    <CustomSelect
      value={sort}
      onChange={onSortChange}
      options={SORT_OPTIONS}
      className="w-32 flex-shrink-0"
    />
  </div>
);

export default LedgerToolbar;
