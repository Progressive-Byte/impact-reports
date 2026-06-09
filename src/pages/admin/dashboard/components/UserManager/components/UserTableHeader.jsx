import Checkbox from '../../../common/Checkbox';

const COLS = [
  { label: 'Email / User', className: 'flex-1' },
  { label: 'Region',       className: 'w-28 flex-shrink-0' },
  { label: 'Role',         className: 'w-44 flex-shrink-0' },
  { label: 'Status',       className: 'w-28 flex-shrink-0' },
  { label: 'Last Login',   className: 'w-44 flex-shrink-0' },
  { label: 'Actions',      className: 'flex-shrink-0' },
];

const UserTableHeader = ({ allSelected, onToggleAll }) => (
  <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100">
    <div className="w-5 flex-shrink-0">
      <Checkbox checked={allSelected} onChange={onToggleAll} />
    </div>
    {COLS.map(({ label, className }) => (
      <span key={label} className={`${className} text-[10px] font-black text-gray-400 uppercase tracking-widest`}>
        {label}
      </span>
    ))}
  </div>
);

export default UserTableHeader;
