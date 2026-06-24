import SafeIcon from '../../../../../../common/SafeIcon';

const SettingCard = ({ icon, title, children, danger = false }) => (
  <div className={`bg-white rounded-2xl border shadow-sm p-4 sm:p-6 ${danger ? 'border-red-100' : 'border-gray-100'}`}>
    <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-gray-50">
      <SafeIcon icon={icon} className={`text-lg ${danger ? 'text-[#E52321]' : 'text-gray-500'}`} />
      <h3 className={`font-black text-base tracking-tight ${danger ? 'text-[#E52321]' : 'text-[#0B0D0F]'}`}>
        {title}
      </h3>
    </div>
    <div className="divide-y divide-gray-50">{children}</div>
  </div>
);

export default SettingCard;
