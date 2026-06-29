import SafeIcon from '../../../../../../common/SafeIcon';

const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
    isActive
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-[#E52321] border-red-200'
  }`}>
    {isActive
      ? <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
      : <SafeIcon icon="FiX" className="text-[10px] flex-shrink-0" />}
    {isActive ? 'Active' : 'Suspended'}
  </span>
);

export default StatusBadge;
