import SafeIcon from '../../../../common/SafeIcon';
import { BackLink, ErrorBanner, Btn } from './LoginUI';

const ForgotOtpStep = ({ flow }) => {
  const {
    fpEmail, fpOtp, otpRefs, error, loading, resending,
    handleOtpChange, handleOtpKeyDown, handleOtpPaste, handleOtpSubmit,
    handleResendOtp, setStep, clearError,
  } = flow;

  return (
    <>
      <BackLink onClick={() => { setStep('forgot-email'); clearError(); }} label="Change email" />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#E52321]/20 flex items-center justify-center flex-shrink-0">
          <SafeIcon icon="FiMail" className="text-[#E52321] text-base" />
        </div>
        <div>
          <p className="text-white text-sm font-bold">Check your email</p>
          <p className="text-gray-400 text-[11px]">
            We sent a 6-digit code to <span className="text-gray-300 font-bold">{fpEmail}</span>
          </p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleOtpSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
            Verification Code
          </label>
          <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
            {fpOtp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { otpRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(idx, e)}
                className="w-12 h-14 text-center text-white text-xl font-black bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#E52321]/50 focus:ring-1 focus:ring-[#E52321]/20 transition-all caret-transparent"
              />
            ))}
          </div>
        </div>

        <Btn loading={loading} disabled={fpOtp.join('').length < 6} label="Verify Code" icon="FiShield" />
      </form>

      <div className="mt-5 text-center">
        <span className="text-[11px] text-gray-500">Didn't receive it? </span>
        <button
          onClick={handleResendOtp}
          disabled={resending}
          className="text-[11px] font-bold text-[#E52321] hover:underline disabled:opacity-50"
        >
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
    </>
  );
};

export default ForgotOtpStep;
