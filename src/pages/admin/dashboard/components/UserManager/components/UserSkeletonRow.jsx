// cols: checkbox | email/user | region | role | status | last-login | actions
const ROW_GRID = 'grid grid-cols-[20px_1fr_7rem_11rem_7rem_11rem_14rem] items-center gap-4 px-6';

const UserSkeletonRow = () => (
  <div className={`${ROW_GRID} py-4 animate-pulse`}>
    <div><div className="w-4 h-4 bg-gray-100 rounded" /></div>
    <div className="min-w-0 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="h-3 bg-gray-100 rounded w-48" />
        <div className="h-2.5 bg-gray-100 rounded w-28" />
      </div>
    </div>
    <div><div className="h-3 bg-gray-100 rounded w-16" /></div>
    <div><div className="h-8 bg-gray-100 rounded-xl w-32" /></div>
    <div><div className="h-6 bg-gray-100 rounded-full w-20" /></div>
    <div><div className="h-3 bg-gray-100 rounded w-28" /></div>
    <div className="flex gap-2">
      <div className="h-7 w-12 bg-gray-100 rounded-xl" />
      <div className="h-7 w-16 bg-gray-100 rounded-xl" />
      <div className="h-7 w-20 bg-gray-100 rounded-xl" />
    </div>
  </div>
);

export default UserSkeletonRow;
