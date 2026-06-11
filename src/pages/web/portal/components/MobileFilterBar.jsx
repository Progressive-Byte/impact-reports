import SafeIcon from '../../../../common/SafeIcon';

const MobileFilterBar = ({ activeFilterCount, activeFilterChips, onOpen, onClearFilters }) => (
  <div className="flex lg:hidden items-center gap-3 mb-8 overflow-hidden">
    <button
      onClick={onOpen}
      className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm hover:border-[#E52321]/20 hover:shadow-md transition-all duration-300 flex-shrink-0"
    >
      <div className="w-7 h-7 rounded-xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
        <SafeIcon icon="FiSliders" className="text-[#E52321] text-sm" />
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest text-[#0B0D0F]">Filters</span>
      {activeFilterCount > 0 && (
        <span className="bg-[#E52321] text-white rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-black leading-none">
          {activeFilterCount}
        </span>
      )}
    </button>
    {activeFilterCount > 0 && (
      <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {activeFilterChips.map((f) => (
          <span
            key={f}
            className="inline-flex items-center bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/15 rounded-full px-3 py-1.5 text-[10px] font-black whitespace-nowrap flex-shrink-0"
          >
            {f}
          </span>
        ))}
        <button
          onClick={onClearFilters}
          className="text-[10px] font-black text-gray-400 hover:text-[#E52321] whitespace-nowrap flex-shrink-0 ml-1 transition-colors"
        >
          Clear all
        </button>
      </div>
    )}
  </div>
);

export default MobileFilterBar;
