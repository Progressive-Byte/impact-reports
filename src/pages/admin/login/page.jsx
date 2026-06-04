import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import SafeIcon from '../../../common/SafeIcon';

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data.token, data.admin);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D0F] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
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
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-7">
            Sign in to continue
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-[#E52321]/10 border border-[#E52321]/20 rounded-2xl px-4 py-3 mb-6"
            >
              <SafeIcon icon="FiAlertCircle" className="text-[#E52321] text-base flex-shrink-0" />
              <span className="text-[#E52321] text-sm font-bold">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Username
              </label>
              <div className="relative">
                <SafeIcon icon="FiUser" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  placeholder="Enter username"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm font-medium placeholder-gray-600 focus:outline-none focus:border-[#E52321]/50 focus:ring-1 focus:ring-[#E52321]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <SafeIcon icon="FiLock" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Enter password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-12 py-3.5 text-white text-sm font-medium placeholder-gray-600 focus:outline-none focus:border-[#E52321]/50 focus:ring-1 focus:ring-[#E52321]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <SafeIcon icon={showPassword ? 'FiEyeOff' : 'FiEye'} className="text-base" />
                </button>
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
                  Signing in...
                </>
              ) : (
                <>
                  <SafeIcon icon="FiLogIn" className="text-base" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Default: <span className="text-gray-400 font-bold">admin</span> / <span className="text-gray-400 font-bold">admin123</span>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
