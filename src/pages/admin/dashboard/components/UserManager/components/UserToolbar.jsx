import SafeIcon from '../../../../../../common/SafeIcon';
import CustomSelect from '../../ReportsModule/reports/CustomSelect';

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All status' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const UserToolbar = ({
  inputSearch, setInputSearch, isDebouncing,
  urlSearch, urlStatus, meta, loading,
  onStatusChange, onRefresh,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">

    {/* Left: title */}
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <SafeIcon icon="FiUsers" className="text-gray-400 text-base" />
      <h3 className="text-sm font-black text-[#0B0D0F]">
        Directory
        {!loading && meta && (
          <span className="ml-2 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {meta.total}
          </span>
        )}
      </h3>
    </div>

    {/* Right: search + status + refresh */}
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 sm:flex-none">
        <SafeIcon
          icon={isDebouncing ? 'FiLoader' : 'FiSearch'}
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${
            isDebouncing ? 'text-[#E52321] animate-spin' : 'text-gray-400'
          }`}
        />
        <input
          type="text"
          placeholder="Search email or username…"
          value={inputSearch}
          onChange={e => setInputSearch(e.target.value)}
          autoComplete="off"
          className="border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] bg-white w-full sm:w-52 lg:w-64 transition-colors"
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

      {/* Status filter */}
      <CustomSelect
        value={urlStatus}
        onChange={onStatusChange}
        options={STATUS_OPTIONS}
        className="w-32 sm:w-36 flex-shrink-0"
      />

      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={loading}
        className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#0B0D0F] hover:bg-gray-50 disabled:opacity-40 transition-colors flex-shrink-0"
        title="Refresh"
      >
        <SafeIcon icon="FiRefreshCw" className={`text-sm ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  </div>
);

export default UserToolbar;
