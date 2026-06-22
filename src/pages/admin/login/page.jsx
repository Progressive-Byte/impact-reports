import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import LoginStep       from './components/LoginStep';
import ForgotEmailStep from './components/ForgotEmailStep';
import ForgotOtpStep   from './components/ForgotOtpStep';
import ForgotResetStep from './components/ForgotResetStep';
import ForgotDoneStep  from './components/ForgotDoneStep';
import TwoFaStep       from './components/TwoFaStep';

const STEP_MOTION = {
  'login':        { initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x:  16 }, transition: { duration: 0.2 } },
  '2fa-otp':      { initial: { opacity: 0, x:  16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.2 } },
  'forgot-email': { initial: { opacity: 0, x:  16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.2 } },
  'forgot-otp':   { initial: { opacity: 0, x:  16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.2 } },
  'forgot-reset': { initial: { opacity: 0, x:  16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.2 } },
  'forgot-done':  { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.25 } },
};

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate  = useNavigate();

  const [step,           setStep]           = useState('login');
  const [form,           setForm]           = useState({ username: '', password: '' });
  const [showPw,         setShowPw]         = useState(false);
  const [error,          setError]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [fpEmail,        setFpEmail]        = useState('');
  const [fpOtp,          setFpOtp]          = useState(['', '', '', '', '', '']);
  const [fpResetToken,   setFpResetToken]   = useState('');
  const [fpPassword,     setFpPassword]     = useState({ password: '', confirm: '' });
  const [showNewPw,      setShowNewPw]      = useState(false);
  const [resending,      setResending]      = useState(false);
  const [twoFaUsername,  setTwoFaUsername]  = useState('');
  const [twoFaOtp,       setTwoFaOtp]       = useState(['', '', '', '', '', '']);
  const [twoFaResending, setTwoFaResending] = useState(false);

  const otpRefs   = useRef([]);
  const twoFaRefs = useRef([]);

  useEffect(() => {
    if (step === 'forgot-otp') setTimeout(() => otpRefs.current[0]?.focus(), 80);
    if (step === '2fa-otp')    setTimeout(() => twoFaRefs.current[0]?.focus(), 80);
  }, [step]);

  const clearError = () => setError('');

  const goBackToLogin = () => {
    setStep('login');
    clearError();
    setFpEmail('');
    setFpOtp(['', '', '', '', '', '']);
    setFpPassword({ password: '', confirm: '' });
  };

  // ── Login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      if (data.twoFaRequired) {
        setTwoFaUsername(form.username);
        setTwoFaOtp(['', '', '', '', '', '']);
        setStep('2fa-otp');
        return;
      }
      login(data.token, data.admin, data.sessionTimeoutMinutes);
      navigate('/alkabirimpact/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── 2FA ──
  const handle2faVerify = async (code) => {
    clearError();
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/verify-2fa', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: twoFaUsername, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      login(data.token, data.admin, data.sessionTimeoutMinutes);
      navigate('/alkabirimpact/dashboard');
    } catch (err) {
      setError(err.message);
      setTwoFaOtp(['', '', '', '', '', '']);
      setTimeout(() => twoFaRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handle2faOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...twoFaOtp];
    next[idx]  = val.slice(-1);
    setTwoFaOtp(next);
    if (val && idx < 5) twoFaRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '')) setTimeout(() => handle2faVerify(next.join('')), 60);
  };

  const handle2faOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !twoFaOtp[idx] && idx > 0) twoFaRefs.current[idx - 1]?.focus();
  };

  const handle2faOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...twoFaOtp];
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setTwoFaOtp(next);
    twoFaRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) setTimeout(() => handle2faVerify(pasted), 60);
  };

  const handle2faOtpSubmit = (e) => {
    e.preventDefault();
    const code = twoFaOtp.join('');
    if (code.length === 6) handle2faVerify(code);
  };

  const handle2faResend = async () => {
    setTwoFaResending(true);
    clearError();
    try {
      await fetch('/api/auth/resend-2fa-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: twoFaUsername }),
      });
      setTwoFaOtp(['', '', '', '', '', '']);
      setTimeout(() => twoFaRefs.current[0]?.focus(), 50);
    } catch { /* server always returns 200 */ }
    finally { setTwoFaResending(false); }
  };

  // ── Forgot password ──
  const handleForgotEmail = async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail }),
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

  const handleVerifyOtp = async (code) => {
    clearError();
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, code }),
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

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...fpOtp];
    next[idx]  = val.slice(-1);
    setFpOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '')) setTimeout(() => handleVerifyOtp(next.join('')), 60);
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !fpOtp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...fpOtp];
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setFpOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) setTimeout(() => handleVerifyOtp(pasted), 60);
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail }),
      });
      setFpOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch { /* server always returns 200 */ }
    finally { setResending(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearError();
    if (fpPassword.password !== fpPassword.confirm) return setError('Passwords do not match');
    if (fpPassword.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: fpResetToken, password: fpPassword.password }),
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

  const flow = {
    step, setStep, clearError, goBackToLogin,
    form, setForm, showPw, setShowPw,
    error, loading,
    fpEmail, setFpEmail,
    fpOtp, otpRefs,
    fpPassword, setFpPassword,
    showNewPw, setShowNewPw,
    resending,
    handleLogin, handleForgotEmail,
    handleOtpChange, handleOtpKeyDown, handleOtpPaste, handleOtpSubmit,
    handleResendOtp, handleResetPassword,
    twoFaOtp, twoFaRefs, twoFaResending,
    handle2faOtpChange, handle2faOtpKeyDown, handle2faOtpPaste, handle2faOtpSubmit,
    handle2faResend,
  };

  const stepMotion = STEP_MOTION[step] ?? STEP_MOTION['forgot-email'];

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

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div key={step} {...stepMotion}>
              {step === 'login'        && <LoginStep       flow={flow} />}
              {step === '2fa-otp'      && <TwoFaStep       flow={flow} />}
              {step === 'forgot-email' && <ForgotEmailStep flow={flow} />}
              {step === 'forgot-otp'   && <ForgotOtpStep   flow={flow} />}
              {step === 'forgot-reset' && <ForgotResetStep flow={flow} />}
              {step === 'forgot-done'  && <ForgotDoneStep />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
