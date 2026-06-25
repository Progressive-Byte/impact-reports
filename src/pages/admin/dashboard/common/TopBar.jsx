import SafeIcon from '../../../../common/SafeIcon';
import NotificationPanel from './NotificationPanel';
import UserMenu from './UserMenu';

const TopBar = ({ currentNav, admin, onMenuOpen, onLogout }) => (
  <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-5 py-3 flex items-center justify-between flex-shrink-0">
    <div className="flex items-center gap-3">
      <button
        onClick={onMenuOpen}
        className="lg:hidden w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <SafeIcon icon="FiMenu" className="text-base" />
      </button>
      <p className="text-sm text-gray-400">
        Platform
        <span className="mx-1.5 text-gray-300">·</span>
        <span className="font-bold text-gray-700">{currentNav?.label}</span>
      </p>
    </div>

    <div className="flex items-center gap-2.5">
      <NotificationPanel />
      <UserMenu admin={admin} onLogout={onLogout} />
    </div>
  </header>
);

export default TopBar;
