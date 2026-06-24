import Checkbox from '../../../common/Checkbox';

const COLUMNS = ['Project', 'Project ID', 'Lives Impacted', 'Status', 'Assignees', 'Approval Reviewer', 'Created', 'Last Edit', 'Actions'];

// Keep in sync with ROW_GRID in RecordLedger and ReportSkeletonRow
export const ROW_GRID = 'grid grid-cols-[20px_1.5fr_1fr_1fr_1fr_1.2fr_1fr_1fr_1fr_auto] gap-4 items-center px-6';

const TableHead = ({ allSelected, onToggleAll }) => (
  <div className={`${ROW_GRID} py-3 border-b border-gray-100 bg-gray-50/70`}>
    <Checkbox checked={allSelected} onChange={onToggleAll} />
    {COLUMNS.map(col => (
      <span key={col} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {col}
      </span>
    ))}
  </div>
);

export default TableHead;
