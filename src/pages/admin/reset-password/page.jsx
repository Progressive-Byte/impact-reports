import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';

const AdminResetPassword = () => {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get('token') || '';

  const [form,     setForm]     = useState({ password: '', confirm: '' });
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  if (!token) {
    return (
      <InvalidState
        message="No reset token found in this URL."
        onBack={() => navigate('/alkabirimpact/login')}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      setSuccess(true);
      setTimeout(() => navigate('/alkabirimpact/login'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D0F] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E52321]/5 rounded-full blur-3xl" />
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

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                <SafeIcon icon="FiCheckCircle" className="text-green-400 text-2xl" />
              </div>
              <h2 className="text-white font-black text-lg mb-2">Password Updated!</h2>
              <p className="text-gray-400 text-sm">Redirecting you to login…</p>
            </motion.div>
          ) : (
            <>
              <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">
                Set New Password
              </h2>
              <p className="text-gray-500 text-xs mb-6">Choose a strong password for your account.</p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-[#E52321]/10 border border-[#E52321]/20 rounded-2xl px-4 py-3 mb-5"
                >
                  <SafeIcon icon="FiAlertCircle" className="text-[#E52321] text-base flex-shrink-0" />
                  <span className="text-[#E52321] text-sm font-bold">{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <SafeIcon icon="FiLock" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="Min. 6 characters"
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
                  disabled={loading}
                  className="w-full bg-[#E52321] hover:bg-[#C91D1B] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] transition-all duration-300 mt-2 flex items-center justify-center gap-3 active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <SafeIcon icon="FiKey" className="text-base" />
                      Update Password
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  onClick={() => navigate('/alkabirimpact/login')}
                  className="text-[11px] font-bold text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Back to login
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const InvalidState = ({ message, onBack }) => (
  <div className="min-h-screen bg-[#0B0D0F] flex items-center justify-center px-4">
    <div className="text-center max-w-sm">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
        <SafeIcon icon="FiAlertCircle" className="text-[#E52321] text-2xl" />
      </div>
      <h2 className="text-xl font-black text-white mb-2">Invalid Link</h2>
      <p className="text-gray-400 text-sm mb-6">{message}</p>
      <button onClick={onBack} className="text-sm font-bold text-[#E52321] hover:underline">
        Back to Login
      </button>
    </div>
  </div>
);

export default AdminResetPassword;
