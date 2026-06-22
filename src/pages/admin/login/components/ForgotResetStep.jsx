import SafeIcon from '../../../../common/SafeIcon';
import { ErrorBanner, Field, Btn } from './LoginUI';

const ForgotResetStep = ({ flow }) => {
  const { fpEmail, fpPassword, setFpPassword, showNewPw, setShowNewPw, error, loading, handleResetPassword } = flow;

  return (
    <>
      <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">
        Set New Password
      </h2>
      <p className="text-gray-500 text-xs mb-6">
        Choose a new password for <span className="text-gray-300 font-bold">{fpEmail}</span>
      </p>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            New Password
          </label>
          <div className="relative">
            <SafeIcon icon="FiLock" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
            <input
              type={showNewPw ? 'text' : 'password'}
              value={fpPassword.password}
              onChange={e => setFpPassword(p => ({ ...p, password: e.target.value }))}
              placeholder="Min. 6 characters"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-12 py-3.5 text-white text-sm font-medium placeholder-gray-600 focus:outline-none focus:border-[#E52321]/50 focus:ring-1 focus:ring-[#E52321]/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNewPw(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <SafeIcon icon={showNewPw ? 'FiEyeOff' : 'FiEye'} className="text-base" />
            </button>
          </div>
        </div>

        <Field
          label="Confirm Password" icon="FiShield"
          type={showNewPw ? 'text' : 'password'}
          value={fpPassword.confirm}
          onChange={v => setFpPassword(p => ({ ...p, confirm: v }))}
          placeholder="Re-enter password"
        />

        <Btn loading={loading} label="Update Password" icon="FiKey" />
      </form>
    </>
  );
};

export default ForgotResetStep;
