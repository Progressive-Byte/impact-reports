import { SkeletonCard } from '../../../common/Skeleton';

const SettingsSkeleton = () => (
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
);

export default SettingsSkeleton;
