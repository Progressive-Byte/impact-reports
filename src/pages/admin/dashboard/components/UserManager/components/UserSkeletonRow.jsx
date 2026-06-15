import Skeleton from '../../../common/Skeleton';

// cols: checkbox | email/user | region | role | status | last-login | actions
const ROW_GRID = 'grid grid-cols-[20px_1fr_7rem_11rem_7rem_11rem_14rem] items-center gap-4 px-6';

const UserSkeletonRow = () => (
  <div className={`${ROW_GRID} py-4 animate-pulse`}>
    <div><Skeleton className="w-4 h-4" /></div>
    <div className="min-w-0 flex items-center gap-3">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="space-y-1.5 min-w-0 flex-1">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-2.5 w-28" />
      </div>
    </div>
    <div><Skeleton className="h-3 w-16" /></div>
    <div><Skeleton className="h-8 rounded-xl w-32" /></div>
    <div><Skeleton className="h-6 rounded-full w-20" /></div>
    <div><Skeleton className="h-3 w-28" /></div>
    <div className="flex gap-2">
      <Skeleton className="h-7 w-12 rounded-xl" />
      <Skeleton className="h-7 w-16 rounded-xl" />
      <Skeleton className="h-7 w-20 rounded-xl" />
    </div>
  </div>
);

export default UserSkeletonRow;
