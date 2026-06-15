import { SkeletonCard } from '../../../common/Skeleton';

const SettingsSkeleton = () => (
  <div className="space-y-5">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="h-7 w-28 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-3.5 w-56 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="h-10 w-36 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    {/* 2-column grid */}
    <div className="grid grid-cols-2 gap-5 items-start">
      <div className="space-y-5">
        {/* Security: 2 toggles + 1 select */}
        <SkeletonCard rows={3} />
        {/* General: 3 selects */}
        <SkeletonCard rows={3} wide />
      </div>
      <div className="space-y-5">
        {/* Notifications: 3 toggles */}
        <SkeletonCard rows={3} />
        {/* Danger Zone: 2 action buttons */}
        <SkeletonCard rows={2} wide />
      </div>
    </div>
  </div>
);

export default SettingsSkeleton;
