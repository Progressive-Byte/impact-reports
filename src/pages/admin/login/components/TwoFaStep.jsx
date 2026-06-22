import SafeIcon from '../../../../common/SafeIcon';
import { BackLink, ErrorBanner, Btn } from './LoginUI';

const TwoFaStep = ({ flow }) => {
  const {
    twoFaOtp, twoFaRefs, twoFaResending, error, loading,
    handle2faOtpChange, handle2faOtpKeyDown, handle2faOtpPaste, handle2faOtpSubmit,
    handle2faResend, goBackToLogin,
  } = flow;

  return (
    <>
      <BackLink onClick={goBackToLogin} label="Back to login" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#E52321]/20 flex items-center justify-center flex-shrink-0">
          <SafeIcon icon="FiShield" className="text-[#E52321] text-base" />
        </div>
        <div>
          <p className="text-white text-sm font-bold">Two-Factor Authentication</p>
          <p className="text-gray-400 text-[11px]">
            A 6-digit code has been sent to your registered email address.
          </p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handle2faOtpSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
            Verification Code
          </label>
          <div className="flex gap-2 justify-between" onPaste={handle2faOtpPaste}>
            {twoFaOtp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { twoFaRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handle2faOtpChange(idx, e.target.value)}
                onKeyDown={e => handle2faOtpKeyDown(idx, e)}
                className="w-12 h-14 text-center text-white text-xl font-black bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#E52321]/50 focus:ring-1 focus:ring-[#E52321]/20 transition-all caret-transparent"
              />
            ))}
          </div>
        </div>

        <Btn loading={loading} disabled={twoFaOtp.join('').length < 6} label="Verify & Sign In" icon="FiLogIn" />
      </form>

      <div className="mt-5 text-center">
        <span className="text-[11px] text-gray-500">Didn't receive it? </span>
        <button
          type="button"
          onClick={handle2faResend}
          disabled={twoFaResending}
          className="text-[11px] font-bold text-[#E52321] hover:underline disabled:opacity-50"
        >
          {twoFaResending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
    </>
  );
};

export default TwoFaStep;
