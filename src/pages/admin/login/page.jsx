import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import SafeIcon from '../../../common/SafeIcon';

// step: 'credentials' | 'otp' | 'forgot' | 'forgot-sent'
const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate  = useNavigate();

  const [step,       setStep]       = useState('credentials');
  const [form,       setForm]       = useState({ username: '', password: '' });
  const [email,      setEmail]      = useState('');
  const [otp,        setOtp]        = useState(['', '', '', '', '', '']);
  const [tempToken,  setTempToken]  = useState('');
  const [maskedEmail,setMaskedEmail]= useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [resending,  setResending]  = useState(false);

  const otpRefs = useRef([]);

  // Auto-focus first OTP box when step changes to otp
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    }
  }, [step]);

  // ── Step 1: credentials ──
  const handleCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      setTempToken(data.tempToken);
      setMaskedEmail(data.email);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP ──
  const handleOtp = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/verify-2fa', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tempToken, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      login(data.token, data.admin, data.sessionTimeoutMinutes);
      navigate('/alkabirimpact/dashboard');
    } catch (err) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx]  = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '') && next.join('').length === 6) {
      // Auto-submit when all digits filled
      setTimeout(() => handleOtp(null), 60);
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...otp];
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend');
      setTempToken(data.tempToken);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  // ── Step 3: forgot password ──
  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setStep('forgot-sent');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setStep('credentials');
    setError('');
    setOtp(['', '', '', '', '', '']);
    setEmail('');
  };

  // ── Shared layout ──
  return (
    <div className="min-h-screen bg-[#0B0D0F] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E52321]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#E52321]/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-5 overflow-hidden">
            <img
              src="https://media-manager-c.questera.ai/greta-media/89a4c5054b952da31823a698574da50f94645c57fede58bf38e1dc553a5f65aa2a5866630191987f5de6ebb268aeb9b2/images/aW1hZ2UvcG5n/236c9d88c2db247a8226fc26d4a8c574.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Human Concern USA</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm">
          <AnimatePresence mode="wait">

            {/* ── CREDENTIALS ── */}
            {step === 'credentials' && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-7">
                  Sign in to continue
                </h2>
                {error && <ErrorBanner message={error} />}
                <form onSubmit={handleCredentials} className="space-y-4">
                  <InputField
                    label="Username"
                    icon="FiUser"
                    type="text"
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
                      onClick={() => { setStep('forgot'); setError(''); }}
                      className="text-[11px] font-bold text-gray-400 hover:text-[#E52321] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <SubmitButton loading={loading} label="Sign In" icon="FiLogIn" />
                </form>
              </motion.div>
            )}

            {/* ── OTP ── */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={resetToLogin}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-gray-300 transition-colors mb-6"
                >
                  <SafeIcon icon="FiArrowLeft" className="text-xs" /> Back
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#E52321]/20 flex items-center justify-center flex-shrink-0">
                    <SafeIcon icon="FiMail" className="text-[#E52321] text-base" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Check your email</p>
                    <p className="text-gray-400 text-[11px]">
                      We sent a 6-digit code to <span className="text-gray-300 font-bold">{maskedEmail}</span>
                    </p>
                  </div>
                </div>

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handleOtp} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                      Verification Code
                    </label>
                    <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                      {otp.map((digit, idx) => (
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

                  <SubmitButton
                    loading={loading}
                    disabled={otp.join('').length < 6}
                    label="Verify Code"
                    icon="FiShield"
                  />
                </form>

                <div className="mt-5 text-center">
                  <span className="text-[11px] text-gray-500">Didn't receive it? </span>
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-[11px] font-bold text-[#E52321] hover:underline disabled:opacity-50"
                  >
                    {resending ? 'Sending…' : 'Resend code'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {step === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={resetToLogin}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-gray-300 transition-colors mb-6"
                >
                  <SafeIcon icon="FiArrowLeft" className="text-xs" /> Back to login
                </button>
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">
                  Reset Password
                </h2>
                <p className="text-gray-500 text-xs mb-6">
                  Enter your account email and we'll send you a reset link.
                </p>

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handleForgot} className="space-y-4">
                  <InputField
                    label="Email Address"
                    icon="FiMail"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="Enter your email"
                  />
                  <SubmitButton loading={loading} label="Send Reset Link" icon="FiSend" />
                </form>
              </motion.div>
            )}

            {/* ── FORGOT SENT ── */}
            {step === 'forgot-sent' && (
              <motion.div
                key="forgot-sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="text-center py-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                  <SafeIcon icon="FiCheckCircle" className="text-green-400 text-2xl" />
                </div>
                <h2 className="text-white font-black text-lg mb-2">Check your inbox</h2>
                <p className="text-gray-400 text-sm mb-7">
                  If that email is registered, a password reset link has been sent. The link expires in 1 hour.
                </p>
                <button
                  onClick={resetToLogin}
                  className="text-[11px] font-bold text-[#E52321] hover:underline"
                >
                  Back to login
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// ── Small shared sub-components ──

const ErrorBanner = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3 bg-[#E52321]/10 border border-[#E52321]/20 rounded-2xl px-4 py-3 mb-5"
  >
    <SafeIcon icon="FiAlertCircle" className="text-[#E52321] text-base flex-shrink-0" />
    <span className="text-[#E52321] text-sm font-bold">{message}</span>
  </motion.div>
);

const InputField = ({ label, icon, type, value, onChange, placeholder }) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
      {label}
    </label>
    <div className="relative">
      <SafeIcon icon={icon} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm font-medium placeholder-gray-600 focus:outline-none focus:border-[#E52321]/50 focus:ring-1 focus:ring-[#E52321]/20 transition-all"
      />
    </div>
  </div>
);

const SubmitButton = ({ loading, disabled, label, icon }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="w-full bg-[#E52321] hover:bg-[#C91D1B] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] transition-all duration-300 mt-2 flex items-center justify-center gap-3 active:scale-95"
  >
    {loading ? (
      <>
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Please wait…
      </>
    ) : (
      <>
        <SafeIcon icon={icon} className="text-base" />
        {label}
      </>
    )}
  </button>
);

export default AdminLogin;
