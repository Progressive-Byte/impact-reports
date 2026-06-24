import Checkbox from '../../../common/Checkbox';

// Keep in sync with UserRow and UserSkeletonRow
// cols: checkbox | email/user | region | role | status | last-login | actions
const ROW_GRID = 'grid grid-cols-[20px_minmax(10rem,2fr)_minmax(7rem,1fr)_11rem_7rem_minmax(9rem,1fr)_15rem] items-center gap-4 px-6';

const COLS = [
  'Email / User',
  'Region',
  'Role',
  'Status',
  'Last Login',
  'Actions',
];

const UserTableHeader = ({ allSelected, onToggleAll }) => (
  <div className={`${ROW_GRID} py-3 border-b border-gray-100`}>
    <div>
      <Checkbox checked={allSelected} onChange={onToggleAll} />
    </div>
    {COLS.map(label => (
      <span key={label} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {label}
      </span>
    ))}
  </div>
);

export default UserTableHeader;
