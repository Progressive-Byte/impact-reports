import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SafeIcon from '../../../common/SafeIcon';

const ROLE_LABELS = { superadmin: 'Superadmin', admin: 'Admin' };

const AdminRegister = () => {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get('token') || '';

  const [invite,   setInvite]   = useState(null);   // { email, role, region, enforceStrongPasswords }
  const [checking, setChecking] = useState(true);
  const [invalid,  setInvalid]  = useState('');

  const [form,     setForm]     = useState({ username: '', password: '', confirm: '' });
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  // Validate the token on mount
  useEffect(() => {
    if (!token) { setInvalid('No invite token found in this URL.'); setChecking(false); return; }

    fetch(`/api/invite/validate?token=${encodeURIComponent(token)}`)
      .then(r => r.json().then(d => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (!ok) { setInvalid(data.message || 'Invalid or expired invite link'); }
        else      { setInvite(data); }
      })
      .catch(() => setInvalid('Could not validate the invite. Please try again.'))
      .finally(() => setChecking(false));
  }, [token]);

  const strong = invite?.enforceStrongPasswords ?? false;
  const pwChecks = strong ? {
    length:  form.password.length >= 12,
    number:  /[0-9]/.test(form.password),
    symbol:  /[^a-zA-Z0-9]/.test(form.password),
  } : null;
  const pwValid = !strong || (pwChecks.length && pwChecks.number && pwChecks.symbol);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (!pwValid) {
      toast.error('Password does not meet the strength requirements');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch('/api/invite/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      toast.success('Account created! Redirecting to login…');
      setTimeout(() => navigate('/alkabirimpact/login'), 1800);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ──
  if (checking) {
    return (
      <div className="min-h-screen bg-[#0B0D0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E52321] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Invalid / expired invite ──
  if (invalid) {
    return (
      <div className="min-h-screen bg-[#0B0D0F] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <SafeIcon icon="FiAlertCircle" className="text-[#E52321] text-2xl" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Invite Invalid</h2>
          <p className="text-gray-400 text-sm mb-6">{invalid}</p>
          <button
            onClick={() => navigate('/admin/login')}
            className="text-sm font-bold text-[#E52321] hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Registration form ──
  return (
    <div className="min-h-screen bg-[#0B0D0F] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E52321]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#E52321] items-center justify-center mb-4">
            <SafeIcon icon="FiZap" className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Complete Registration</h1>
          <p className="text-gray-500 text-sm mt-1">Impact Reports Admin Portal</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm">

          {/* Invite badge */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-7">
            <div className="w-8 h-8 rounded-lg bg-[#E52321]/20 flex items-center justify-center flex-shrink-0">
              <SafeIcon icon="FiMail" className="text-[#E52321] text-sm" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-bold truncate">{invite.email}</p>
              <p className="text-gray-400 text-[11px]">
                Invited as <span className="text-white font-bold">{ROLE_LABELS[invite.role] || invite.role}</span>
                {invite.region && invite.region !== 'global' && (
                  <> · <span className="capitalize">{invite.region.replace('_', ' ')}</span></>
                )}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Username
              </label>
              <div className="relative">
                <SafeIcon icon="FiUser" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="Choose a username"
                  required
                  minLength={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm font-medium placeholder-gray-600 focus:outline-none focus:border-[#E52321]/50 focus:ring-1 focus:ring-[#E52321]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
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
                  placeholder={strong ? 'Min. 12 chars, number & symbol' : 'Min. 6 characters'}
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

              {/* Strong password checklist */}
              {strong && form.password.length > 0 && (
                <ul className="mt-2.5 space-y-1">
                  {[
                    { key: 'length', label: 'At least 12 characters' },
                    { key: 'number', label: 'Contains a number' },
                    { key: 'symbol', label: 'Contains a symbol (e.g. !@#$)' },
                  ].map(({ key, label }) => (
                    <li key={key} className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${pwChecks[key] ? 'text-green-400' : 'text-gray-500'}`}>
                      <SafeIcon icon={pwChecks[key] ? 'FiCheckCircle' : 'FiCircle'} className="text-xs flex-shrink-0" />
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <SafeIcon icon="FiShield" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Re-enter password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm font-medium placeholder-gray-600 focus:outline-none focus:border-[#E52321]/50 focus:ring-1 focus:ring-[#E52321]/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !pwValid}
              className="w-full bg-[#E52321] hover:bg-[#c91d1b] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] transition-all mt-2 flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
              ) : (
                <><SafeIcon icon="FiCheck" className="text-base" /> Create Account</>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminRegister;
