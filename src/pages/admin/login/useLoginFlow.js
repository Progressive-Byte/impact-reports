import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../context/AdminAuthContext';

export function useLoginFlow() {
  const { login } = useAdminAuth();
  const navigate  = useNavigate();

  const [step,         setStep]         = useState('login');
  const [form,         setForm]         = useState({ username: '', password: '' });
  const [showPw,       setShowPw]       = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [fpEmail,        setFpEmail]        = useState('');
  const [fpOtp,          setFpOtp]          = useState(['', '', '', '', '', '']);
  const [fpResetToken,   setFpResetToken]   = useState('');
  const [fpPassword,     setFpPassword]     = useState({ password: '', confirm: '' });
  const [showNewPw,      setShowNewPw]      = useState(false);
  const [resending,      setResending]      = useState(false);

  // 2FA state
  const [twoFaUsername,  setTwoFaUsername]  = useState('');
  const [twoFaOtp,       setTwoFaOtp]       = useState(['', '', '', '', '', '']);
  const [twoFaResending, setTwoFaResending] = useState(false);

  const otpRefs    = useRef([]);
  const twoFaRefs  = useRef([]);

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

  return {
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
  };
}
