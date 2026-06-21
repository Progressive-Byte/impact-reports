import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import SafeIcon from '../../../common/SafeIcon';

// Steps:
//  'login'        — username + password (normal login)
//  'forgot-email' — enter registered email to receive OTP
//  'forgot-otp'   — enter 6-digit code sent to that email
//  'forgot-reset' — enter new password + confirm
//  'forgot-done'  — success, redirecting

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate  = useNavigate();

  const [step,       setStep]       = useState('login');
  const [form,       setForm]       = useState({ username: '', password: '' });
  const [showPw,     setShowPw]     = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  // Forgot password state
  const [fpEmail,     setFpEmail]     = useState('');
  const [fpOtp,       setFpOtp]       = useState(['', '', '', '', '', '']);
  const [fpResetToken,setFpResetToken]= useState('');
  const [fpPassword,  setFpPassword]  = useState({ password: '', confirm: '' });
  const [showNewPw,   setShowNewPw]   = useState(false);
  const [resending,   setResending]   = useState(false);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (step === 'forgot-otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    }
  }, [step]);

  const clearError = () => setError('');

  // ── Step: normal login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data.token, data.admin, data.sessionTimeoutMinutes);
      navigate('/alkabirimpact/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step: submit email for OTP ──
  const handleForgotEmail = async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: fpEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setStep('forgot-otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP box handlers ──
  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...fpOtp];
    next[idx]  = val.slice(-1);
    setFpOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '')) {
      setTimeout(() => handleVerifyOtp(next.join('')), 60);
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !fpOtp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...fpOtp];
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setFpOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) {
      setTimeout(() => handleVerifyOtp(pasted), 60);
    }
  };

  // ── Step: verify OTP ──
  const handleVerifyOtp = async (code) => {
    clearError();
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/verify-reset-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: fpEmail, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      setFpResetToken(data.resetToken);
      setStep('forgot-reset');
    } catch (err) {
      setError(err.message);
      setFpOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const code = fpOtp.join('');
    if (code.length === 6) handleVerifyOtp(code);
  };

  const handleResendOtp = async () => {
    setResending(true);
    clearError();
    try {
      await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: fpEmail }),
      });
      setFpOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch { /* server always returns 200, ignore */ }
    finally { setResending(false); }
  };

  // ── Step: reset password ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearError();
    if (fpPassword.password !== fpPassword.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (fpPassword.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ resetToken: fpResetToken, password: fpPassword.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      setStep('forgot-done');
      setTimeout(() => {
        setStep('login');
        setFpEmail('');
        setFpOtp(['', '', '', '', '', '']);
        setFpPassword({ password: '', confirm: '' });
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => {
    setStep('login');
    clearError();
    setFpEmail('');
    setFpOtp(['', '', '', '', '', '']);
    setFpPassword({ password: '', confirm: '' });
  };

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

            {/* ── NORMAL LOGIN ── */}
            {step === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-7">
                  Sign in to continue
                </h2>

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handleLogin} className="space-y-4">
                  <Field label="Username" icon="FiUser" type="text"
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
                      <button type="button" onClick={() => setShowPw(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                        <SafeIcon icon={showPw ? 'FiEyeOff' : 'FiEye'} className="text-base" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="button"
                      onClick={() => { setStep('forgot-email'); clearError(); }}
                      className="text-[11px] font-bold text-gray-400 hover:text-[#E52321] transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  <Btn loading={loading} label="Sign In" icon="FiLogIn" />
                </form>
              </motion.div>
            )}

            {/* ── FORGOT: ENTER EMAIL ── */}
            {step === 'forgot-email' && (
              <motion.div
                key="forgot-email"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                <BackLink onClick={goBackToLogin} label="Back to login" />

                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">
                  Forgot Password
                </h2>
                <p className="text-gray-500 text-xs mb-6">
                  Enter your registered email address and we'll send you a verification code.
                </p>

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handleForgotEmail} className="space-y-4">
                  <Field label="Email Address" icon="FiMail" type="email"
                    value={fpEmail}
                    onChange={setFpEmail}
                    placeholder="Enter your email"
                  />
                  <Btn loading={loading} label="Send Verification Code" icon="FiSend" />
                </form>
              </motion.div>
            )}

            {/* ── FORGOT: ENTER OTP ── */}
            {step === 'forgot-otp' && (
              <motion.div
                key="forgot-otp"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
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
                  <button onClick={handleResendOtp} disabled={resending}
                    className="text-[11px] font-bold text-[#E52321] hover:underline disabled:opacity-50">
                    {resending ? 'Sending…' : 'Resend code'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── FORGOT: SET NEW PASSWORD ── */}
            {step === 'forgot-reset' && (
              <motion.div
                key="forgot-reset"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
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
                      <button type="button" onClick={() => setShowNewPw(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                        <SafeIcon icon={showNewPw ? 'FiEyeOff' : 'FiEye'} className="text-base" />
                      </button>
                    </div>
                  </div>

                  <Field label="Confirm Password" icon="FiShield"
                    type={showNewPw ? 'text' : 'password'}
                    value={fpPassword.confirm}
                    onChange={v => setFpPassword(p => ({ ...p, confirm: v }))}
                    placeholder="Re-enter password"
                  />

                  <Btn loading={loading} label="Update Password" icon="FiKey" />
                </form>
              </motion.div>
            )}

            {/* ── FORGOT: SUCCESS ── */}
            {step === 'forgot-done' && (
              <motion.div
                key="forgot-done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="text-center py-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                  <SafeIcon icon="FiCheckCircle" className="text-green-400 text-2xl" />
                </div>
                <h2 className="text-white font-black text-lg mb-2">Password Updated!</h2>
                <p className="text-gray-400 text-sm">Redirecting you to login…</p>
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

const BackLink = ({ onClick, label }) => (
  <button onClick={onClick}
    className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-gray-300 transition-colors mb-6">
    <SafeIcon icon="FiArrowLeft" className="text-xs" /> {label}
  </button>
);

const Field = ({ label, icon, type, value, onChange, placeholder }) => (
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

const Btn = ({ loading, disabled, label, icon }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="w-full bg-[#E52321] hover:bg-[#C91D1B] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] transition-all duration-300 mt-2 flex items-center justify-center gap-3 active:scale-95"
  >
    {loading ? (
      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Please wait…</>
    ) : (
      <><SafeIcon icon={icon} className="text-base" />{label}</>
    )}
  </button>
);

export default AdminLogin;
