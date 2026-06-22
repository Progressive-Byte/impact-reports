import SafeIcon from '../../../common/SafeIcon';
import { ErrorBanner, Field, Btn } from './LoginUI';

const LoginStep = ({ flow }) => {
  const { form, setForm, showPw, setShowPw, error, loading, handleLogin, setStep, clearError } = flow;

  return (
    <>
      <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-7">
        Sign in to continue
      </h2>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleLogin} className="space-y-4">
        <Field
          label="Username" icon="FiUser" type="text"
          value={form.username}
          onChange={v => setForm(p => ({ ...p, username: v }))}
          placeholder="Enter username"
        />

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            Password
          </label>
          <div className="relative">
            <SafeIcon icon="FiLock" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Enter password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-12 py-3.5 text-white text-sm font-medium placeholder-gray-600 focus:outline-none focus:border-[#E52321]/50 focus:ring-1 focus:ring-[#E52321]/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <SafeIcon icon={showPw ? 'FiEyeOff' : 'FiEye'} className="text-base" />
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => { setStep('forgot-email'); clearError(); }}
            className="text-[11px] font-bold text-gray-400 hover:text-[#E52321] transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <Btn loading={loading} label="Sign In" icon="FiLogIn" />
      </form>
    </>
  );
};

export default LoginStep;
