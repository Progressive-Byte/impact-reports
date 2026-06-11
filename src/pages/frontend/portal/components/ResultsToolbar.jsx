import SafeIcon from '../../../../common/SafeIcon';

const ResultsToolbar = ({ loading, totalResults, viewMode, onViewModeChange }) => (
  <div className="flex items-center justify-between gap-4 mb-6">
    <div className="text-left">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Results</p>
      <p className="text-sm font-black text-[#0B0D0F] tabular-nums">
        {loading ? '…' : `${totalResults.toLocaleString()} report${totalResults === 1 ? '' : 's'}`}
      </p>
    </div>
    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
      {['grid', 'list'].map((mode) => (
        <button
          key={mode}
          onClick={() => onViewModeChange(mode)}
          className={`flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
            viewMode === mode ? 'bg-[#0B0D0F] text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          <SafeIcon icon={mode === 'grid' ? 'FiGrid' : 'FiList'} className="text-base" />
          <span className="hidden sm:inline capitalize">{mode}</span>
        </button>
      ))}
    </div>
  </div>
);

export default ResultsToolbar;
