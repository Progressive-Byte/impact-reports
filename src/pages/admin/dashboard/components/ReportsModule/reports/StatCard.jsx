import SafeIcon from "../../../../../../common/SafeIcon";

const StatCard = ({ icon, label, value, iconBg = 'bg-gray-100' }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <SafeIcon icon={icon} className="text-gray-500 text-sm" />
      </div>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
    </div>
    <p className="text-4xl font-black text-[#0B0D0F] tracking-tighter leading-none">{value}</p>
  </div>
);

export default StatCard;