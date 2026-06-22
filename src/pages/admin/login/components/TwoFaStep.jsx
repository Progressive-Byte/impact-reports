import { useState, useEffect, useRef } from 'react';
import SafeIcon from '../../../../common/SafeIcon';
import { BackLink, ErrorBanner, Btn } from './LoginUI';

const TwoFaStep = ({ flow }) => {
  const {
    twoFaMethods, error, loading, goBackToLogin,
    twoFaOtp, twoFaRefs, twoFaResending,
    twoFaCode, handle2faCodeChange, handle2faCodeSubmit,
    handle2faOtpChange, handle2faOtpKeyDown, handle2faOtpPaste, handle2faOtpSubmit,
    handle2faResend,
  } = flow;

  const hasTotp  = twoFaMethods.includes('totp');
  const hasEmail = twoFaMethods.includes('email');
  const [activeTab, setActiveTab] = useState(hasTotp ? 'totp' : 'email');

  // 30-second countdown for TOTP code rotation hint
  const [countdown, setCountdown] = useState(() => 30 - (Math.floor(Date.now() / 1000) % 30));
  useEffect(() => {
    if (activeTab !== 'totp') return;
    const tick = setInterval(() => {
      setCountdown(30 - (Math.floor(Date.now() / 1000) % 30));
    }, 1000);
    return () => clearInterval(tick);
  }, [activeTab]);

  // Auto-send email OTP when user switches to email tab
  const emailSentRef = useRef(false);
  useEffect(() => {
    if (activeTab === 'email' && hasTotp && !emailSentRef.current) {
      emailSentRef.current = true;
      handle2faResend();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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
            Verify your identity to continue.
          </p>
        </div>
      </div>

      {/* Method tabs — only shown when both methods are available */}
      {hasTotp && hasEmail && (
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('totp')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'totp'
                ? 'bg-[#E52321] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Authenticator App
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'email'
                ? 'bg-[#E52321] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Email OTP
          </button>
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {/* ── TOTP tab ── */}
      {activeTab === 'totp' && (
        <form onSubmit={handle2faCodeSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Authenticator Code
            </label>
            <p className="text-[11px] text-gray-500 mb-3">
              Open your authenticator app and enter the 6-digit code.
            </p>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={twoFaCode}
                onChange={e => handle2faCodeChange(e.target.value)}
                placeholder="000000"
                autoFocus
                className="w-full px-4 py-3 pr-16 text-center text-white text-2xl font-black tracking-[0.4em] bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#E52321]/50 focus:ring-1 focus:ring-[#E52321]/20 transition-all placeholder:text-gray-700 placeholder:tracking-normal"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(#E52321 ${(countdown / 30) * 360}deg, rgba(255,255,255,0.08) 0deg)`,
                  }}
                />
                <span className="text-[10px] text-gray-500 font-mono tabular-nums w-4">{countdown}s</span>
              </div>
            </div>
          </div>
          <Btn
            loading={loading}
            disabled={twoFaCode.length < 6}
            label="Verify & Sign In"
            icon="FiLogIn"
          />
        </form>
      )}

      {/* ── Email OTP tab ── */}
      {activeTab === 'email' && (
        <>
          {!hasTotp && (
            <p className="text-[11px] text-gray-500 mb-4">
              A 6-digit code has been sent to your registered email address.
            </p>
          )}
          {hasTotp && (
            <p className="text-[11px] text-gray-500 mb-4">
              A code has been sent to your email. Check your inbox.
            </p>
          )}
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
      )}
    </>
  );
};

export default TwoFaStep;
