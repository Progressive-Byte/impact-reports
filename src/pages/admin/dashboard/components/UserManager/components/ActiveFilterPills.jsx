import SafeIcon from '../../../../../../common/SafeIcon';

const ActiveFilterPills = ({
  urlSearch, urlStatus, meta, showSkeleton,
  onClearSearch, onClearStatus,
}) => {
  if ((!urlSearch && urlStatus === 'all') || showSkeleton) return null;

  return (
    <div className="flex items-center gap-2 px-6 py-2.5 border-b border-gray-100 bg-gray-50/60">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filters:</span>

      {urlSearch && (
        <span className="flex items-center gap-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-600 px-3 py-1 rounded-full">
          <SafeIcon icon="FiSearch" className="text-[10px] text-gray-400" />
          &quot;{urlSearch}&quot;
          <button onClick={onClearSearch} className="text-gray-300 hover:text-gray-500 ml-0.5">
            <SafeIcon icon="FiX" className="text-[10px]" />
          </button>
        </span>
      )}

      {urlStatus !== 'all' && (
        <span className="flex items-center gap-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-600 px-3 py-1 rounded-full capitalize">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${urlStatus === 'active' ? 'bg-green-500' : 'bg-red-400'}`} />
          {urlStatus}
          <button onClick={onClearStatus} className="text-gray-300 hover:text-gray-500 ml-0.5">
            <SafeIcon icon="FiX" className="text-[10px]" />
          </button>
        </span>
      )}

      {meta && (
        <span className="text-[11px] text-gray-400 ml-auto">
          {meta.total} result{meta.total !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default ActiveFilterPills;
