import SafeIcon from '../../../../../../common/SafeIcon';
import Skeleton from './Skeleton';

const StatCard = ({ icon, iconBg = 'bg-gray-100', iconColor = 'text-gray-500', title, badge, loading, children, footer }) => (
  <div className="bg-white border border-gray-200 rounded-3xl p-5 lg:p-7 shadow-sm flex flex-col justify-between min-h-[200px]">
    <div className="flex items-start justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 lg:w-10 lg:h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <SafeIcon icon={icon} className={`${iconColor} text-base`} />
        </div>
        <span className="text-sm font-semibold text-gray-500 leading-tight">{title}</span>
      </div>
      {badge && <div className="flex-shrink-0">{badge}</div>}
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
