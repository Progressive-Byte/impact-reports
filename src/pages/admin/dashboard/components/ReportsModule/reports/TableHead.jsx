const TableHead = () => (
  <div className={`${ROW_GRID} py-3 border-b border-gray-100 bg-gray-50/70`}>
    {COLUMNS.map(col => (
      <span key={col} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {col}
      </span>
    ))}
  </div>
);