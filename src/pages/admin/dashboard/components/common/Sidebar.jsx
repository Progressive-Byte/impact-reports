import SafeIcon from "../../../../../common/SafeIcon";
import { reports } from "../../../../../data/mockData";

const NAV = [
  { id: 'overview', label: 'Admin Dashboard', icon: 'FiGrid',     badge: null },
  { id: 'reports',  label: 'Reports Module',  icon: 'FiFileText', badge: reports.length },
  { id: 'admins',   label: 'User Management', icon: 'FiUsers',    badge: null },
  { id: 'settings', label: 'Settings',        icon: 'FiSettings', badge: null },
];

const STATUS_ITEMS = [
  { dot: true,         label: 'Database',   value: 'Online',  valueClass: 'text-white' },
  { icon: 'FiLock',    label: 'Connection', value: 'TLS 1.3', valueClass: 'text-blue-400' },
  { icon: 'FiShield',  label: 'Encryption', value: 'AES-256', valueClass: 'text-white' },
];

export { NAV };

const Sidebar = ({ section, setSection, setSidebarOpen, mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64'}`}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E52321] flex items-center justify-center flex-shrink-0">
            <SafeIcon icon="FiZap" className="text-white text-base" />
          </div>
          <div>
            <p className="text-white font-black text-base tracking-tight uppercase leading-none">Impact Report</p>
            <p className="text-[#909098] text-[10px] uppercase tracking-widest mt-0.5">SYS.VER 1.0.4</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[11px] font-black text-[#909098] uppercase tracking-widest px-3 mb-2">Platform</p>
        <div className="space-y-0.5">
          {NAV.map(({ id, label, icon, badge }) => (
            <button
              key={id}
              onClick={() => { setSection(id); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-150 ${
                section === id
                  ? 'bg-[#E52321] text-white'
                  : 'text-[#909098] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <SafeIcon icon={icon} className="text-base flex-shrink-0" />
                {label}
              </div>
              {badge !== null && (
                <span className={`text-[10px] font-black rounded-full px-2.5 py-0.5 min-w-[20px] text-center ${
                  section === id ? 'bg-white/25 text-white' : 'bg-[#E52321] text-white'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom status */}
      <div className="px-4 pb-5 pt-3 border-t border-white/5">
        <div className="space-y-2">
          {STATUS_ITEMS.map(({ dot, icon, label, value, valueClass }) => (
            <div key={label} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2 text-[#909098] text-[11px]">
                {dot
                  ? <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  : <SafeIcon icon={icon} className="text-[11px] flex-shrink-0" />
                }
                {label}
              </div>
              <span className={`text-[11px] font-bold ${valueClass}`}>{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-0.5 border-t border-white/5 pt-2">
            <span className="text-[#909098] text-[11px]">Active sessions</span>
            <span className="text-white text-[11px] font-bold">156</span>
          </div>
        </div>
      </div>
    </div>
  );

  export default Sidebar;