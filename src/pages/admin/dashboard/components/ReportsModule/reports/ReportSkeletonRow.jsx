import Skeleton from '../../../common/Skeleton';

const ROW_GRID = 'grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_auto] gap-4 items-center px-6';

const ReportSkeletonRow = () => (
  <div className={`${ROW_GRID} py-4 animate-pulse`}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-10" />
    <Skeleton className="h-6 rounded-full w-20" />
    <Skeleton className="h-4 w-28" />
    <Skeleton className="h-4 w-20" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-8" />
    </div>
  </div>
);

export default ReportSkeletonRow;
