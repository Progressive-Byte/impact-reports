import SafeIcon from '../../../../../common/SafeIcon';

const ListCard = ({ icon, title, subtitle, items, loading, onAdd, onUpdate, onRemove, addLabel, placeholder }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
    <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        <SafeIcon icon={icon} className="text-gray-600 text-sm" />
      </div>
      <div>
        <p className="text-sm font-black text-[#0B0D0F]">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>

    <div className="px-4 sm:px-6 py-5 space-y-3 overflow-y-auto max-h-[340px]">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-11 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No {title.toLowerCase()} yet. Add one below.</p>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
              <SafeIcon icon={icon} className="text-gray-400 text-xs" />
            </div>
            <input
              type="text"
              value={item}
              onChange={e => onUpdate(idx, e.target.value)}
              placeholder={placeholder}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#E52321] focus:ring-[3px] focus:ring-[#fdecec] bg-white transition-all"
            />
            <button
              onClick={() => onRemove(idx)}
              className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-[#E52321] hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              title="Remove"
            >
              <SafeIcon icon="FiTrash2" className="text-sm" />
            </button>
          </div>
        ))
      )}
    </div>

    <div className="px-4 sm:px-6 pb-6">
      <button
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#E52321] hover:text-[#E52321] text-gray-400 text-sm font-bold py-3 rounded-xl transition-colors"
      >
        <SafeIcon icon="FiPlus" className="text-base" />
        {addLabel}
      </button>
    </div>
  </div>
);

export default ListCard;
