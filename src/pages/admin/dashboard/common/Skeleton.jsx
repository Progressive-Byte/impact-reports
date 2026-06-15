// Base animated rectangle — use as a building block for all skeletons
const Skeleton = ({ className = '' }) => (
  <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`} />
);

// Settings-style row: label + description on the left, control placeholder on the right
export const SkeletonRow = ({ wide = false }) => (
  <div className="flex items-center justify-between py-4">
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-2.5 w-48" />
    </div>
    <Skeleton className={`h-9 ${wide ? 'w-44' : 'w-11'} rounded-xl flex-shrink-0`} />
  </div>
);

// Card shell: icon + title header + n SkeletonRows
export const SkeletonCard = ({ rows = 3, wide = false }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-gray-50">
      <Skeleton className="w-5 h-5" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="divide-y divide-gray-50">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} wide={wide || i === rows - 1} />
      ))}
    </div>
  </div>
);

export default Skeleton;
