const COLUMNS = ['Project', 'Lives Impacted', 'Status', 'Assignees', 'Date', 'Actions'];
const ROW_GRID = 'grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_auto] gap-4 items-center px-6';
const TableHead = () => (
  <div className={`${ROW_GRID} py-3 border-b border-gray-100 bg-gray-50/70`}>
    {COLUMNS.map(col => (
      <span key={col} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {col}
      </span>
    ))}
  </div>
);

export default TableHead;