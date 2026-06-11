import SafeIcon from '../../../../common/SafeIcon';

const FilterSidebar = ({ children, activeFilterCount, onExpandAll, onCollapseAll, onClearFilters }) => (
  <aside className="hidden lg:block w-64 flex-shrink-0">
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden sticky top-28">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
            <SafeIcon icon="FiSliders" className="text-[#E52321]" />
          </div>
          <h3 className="text-[11px] font-black text-[#0B0D0F] uppercase tracking-widest">Filters</h3>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onExpandAll}   className="text-[9px] font-bold uppercase text-gray-400 hover:text-[#E52321] transition-colors">Expand</button>
          <button onClick={onCollapseAll} className="text-[9px] font-bold uppercase text-gray-400 hover:text-[#E52321] transition-colors">Collapse</button>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
      {activeFilterCount > 0 && (
        <div className="px-6 pb-6">
          <button
            onClick={onClearFilters}
            className="w-full py-3 rounded-2xl bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/15 font-black text-[10px] uppercase tracking-[0.25em] hover:bg-[#E52321]/15 transition-all"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  </aside>
);

export default FilterSidebar;
