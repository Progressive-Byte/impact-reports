const UserSkeletonRow = () => (
  <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
    <div className="w-5 flex-shrink-0"><div className="w-4 h-4 bg-gray-100 rounded" /></div>
    <div className="flex-1 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
      <div className="space-y-1.5 flex-1">
        <div className="h-3 bg-gray-100 rounded w-48" />
        <div className="h-2.5 bg-gray-100 rounded w-28" />
      </div>
    </div>
    <div className="w-28 flex-shrink-0"><div className="h-3 bg-gray-100 rounded w-16" /></div>
    <div className="w-44 flex-shrink-0"><div className="h-8 bg-gray-100 rounded-xl w-32" /></div>
    <div className="w-28 flex-shrink-0"><div className="h-6 bg-gray-100 rounded-full w-20" /></div>
    <div className="w-44 flex-shrink-0"><div className="h-3 bg-gray-100 rounded w-28" /></div>
    <div className="flex-shrink-0 flex gap-2">
      <div className="h-7 w-12 bg-gray-100 rounded-xl" />
      <div className="h-7 w-16 bg-gray-100 rounded-xl" />
      <div className="h-7 w-20 bg-gray-100 rounded-xl" />
    </div>
  </div>
);

export default UserSkeletonRow;