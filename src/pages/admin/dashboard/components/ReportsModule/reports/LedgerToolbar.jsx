import SafeIcon from '../../../../../../common/SafeIcon';
import CustomSelect from './CustomSelect';

const STATUS_FILTERS = ['all', 'published', 'draft', 'pending', 'trash'];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recent'  },
  { value: 'oldest', label: 'Oldest'  },
  { value: 'az',     label: 'A → Z'   },
  { value: 'za',     label: 'Z → A'   },
];

const LedgerToolbar = ({
  inputSearch, setInputSearch, isDebouncing,
  urlSearch, urlStatus, urlSort, meta, loading,
  onStatusChange, onSortChange, onRefresh,
}) => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 gap-3 flex-wrap">

    {/* Left: title + count badge */}
    <div className="flex items-center gap-2.5">
      <SafeIcon icon="FiClipboard" className="text-gray-400 text-base" />
      <h3 className="text-sm font-black text-[#0B0D0F]">
        Ledger
        {!loading && meta && (
          <span className="ml-2 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {meta.total}
          </span>
        )}
      </h3>
    </div>

    {/* Right: status tabs + search + sort + refresh */}
    <div className="flex items-center gap-3 flex-wrap">

      {/* Status segmented tabs */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-1 flex gap-0.5 flex-shrink-0">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => onStatusChange(f)}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all disabled:opacity-60 ${
              f === 'trash'
                ? urlStatus === 'trash'
                  ? 'bg-red-50 text-[#E52321] shadow-sm'
                  : 'text-gray-400 hover:text-[#E52321]'
                : urlStatus === f
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <SafeIcon
          icon={isDebouncing ? 'FiLoader' : 'FiSearch'}
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${
            isDebouncing ? 'text-[#E52321] animate-spin' : 'text-gray-400'
          }`}
        />
        <input
          type="text"
          placeholder="Search reports…"
          value={inputSearch}
          onChange={e => setInputSearch(e.target.value)}
          autoComplete="off"
          className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] bg-white w-52 transition-colors"
        />
        {urlSearch && !isDebouncing && (
          <button
            onClick={() => setInputSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            title="Clear search"
          >
            <SafeIcon icon="FiX" className="text-sm" />
          </button>
        )}
      </div>

      {/* Sort */}
      <CustomSelect
        value={urlSort}
        onChange={onSortChange}
        options={SORT_OPTIONS}
        className="w-32 flex-shrink-0"
      />

      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={loading}
        className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#0B0D0F] hover:bg-gray-50 disabled:opacity-40 transition-colors"
        title="Refresh"
      >
        <SafeIcon icon="FiRefreshCw" className={`text-sm ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  </div>
);

export default LedgerToolbar;
