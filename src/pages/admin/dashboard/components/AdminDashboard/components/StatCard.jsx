import SafeIcon from '../../../../../../common/SafeIcon';
import Skeleton from './Skeleton';

const StatCard = ({ icon, iconBg = 'bg-gray-100', iconColor = 'text-gray-500', title, badge, loading, children, footer }) => (
  <div className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm flex flex-col justify-between min-h-[220px]">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <SafeIcon icon={icon} className={`${iconColor} text-base`} />
        </div>
        <span className="text-sm font-semibold text-gray-500">{title}</span>
      </div>
      {badge}
    </div>

    {loading ? <Skeleton className="h-14 w-32 mt-2" /> : children}

    {footer ? (
      <div>
        <div className="h-px bg-gray-100 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {footer.map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-base font-black text-[#0B0D0F]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="h-px bg-transparent" />
    )}
  </div>
);

export default StatCard;
