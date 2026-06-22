import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../../common/SafeIcon';
import { adminApiRequest } from '../../../../../../services/adminApi';
import { useAdminAuth } from '../../../../../../context/AdminAuthContext';

const TotpSetupModal = ({ onClose }) => {
  const { updateAdmin } = useAdminAuth();
  const [step,       setStep]       = useState('loading'); // loading | scan | verify | done
  const [qrDataUrl,  setQrDataUrl]  = useState('');
  const [secret,     setSecret]     = useState('');
  const [code,       setCode]       = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    adminApiRequest('/api/admin/settings/setup-totp', { method: 'POST' })
      .then(data => {
        setQrDataUrl(data.qrDataUrl);
        setSecret(data.secret);
        setStep('scan');
      })
      .catch(err => {
        toast.error(err.message || 'Failed to start setup');
        onClose();
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      const data = await adminApiRequest('/api/admin/settings/verify-totp-setup', {
        method: 'POST',
        body:   JSON.stringify({ code }),
      });
      updateAdmin(data.admin);
      setStep('done');
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err.message || 'Incorrect code. Try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E52321]/10 flex items-center justify-center">
              <SafeIcon icon="FiSmartphone" className="text-[#E52321] text-sm" />
            </div>
            <p className="text-sm font-bold text-[#0B0D0F]">Set Up Authenticator App</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <SafeIcon icon="FiX" className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">

            {step === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center py-10"
              >
                <div className="w-6 h-6 border-2 border-[#E52321] border-t-transparent rounded-full animate-spin" />
              </motion.div>
            )}

            {step === 'scan' && (
              <motion.div key="scan" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <p className="text-xs text-gray-500 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.). You only need to do this once.
                </p>
                <div className="flex justify-center mb-4">
                  <img
                    src={qrDataUrl}
                    alt="TOTP QR Code"
                    className="w-44 h-44 rounded-xl border border-gray-100 p-1"
                  />
                </div>
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={() => setShowSecret(s => !s)}
                    className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors mx-auto"
                  >
                    <SafeIcon icon={showSecret ? 'FiEyeOff' : 'FiEye'} className="text-xs" />
                    {showSecret ? 'Hide' : 'Can\'t scan? Show'} setup key
                  </button>
                  {showSecret && (
                    <p className="mt-2 text-center text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 break-all text-gray-600 select-all">
                      {secret}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setStep('verify')}
                  className="w-full py-2.5 bg-[#E52321] text-white text-sm font-bold rounded-xl hover:bg-[#c91d1b] transition-colors"
                >
                  I've scanned it — Next
                </button>
              </motion.div>
            )}

            {step === 'verify' && (
              <motion.div key="verify" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <p className="text-xs text-gray-500 mb-5">
                  Enter the 6-digit code from your authenticator app to confirm the setup worked.
                </p>
                {error && (
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
                    <SafeIcon icon="FiAlertCircle" className="text-red-500 text-sm flex-shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}
                <form onSubmit={handleVerify} className="space-y-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => { if (/^\d*$/.test(e.target.value)) setCode(e.target.value.slice(0, 6)); }}
                    placeholder="000000"
                    autoFocus
                    className="w-full px-4 py-3 text-center text-[#0B0D0F] text-2xl font-black tracking-[0.4em] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E52321]/30 focus:border-[#E52321]/50 placeholder:text-gray-300 placeholder:tracking-normal transition-all"
                  />
                  <button
                    type="submit"
                    disabled={code.length !== 6 || loading}
                    className="w-full py-2.5 bg-[#E52321] text-white text-sm font-bold rounded-xl hover:bg-[#c91d1b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Verify & Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('scan'); setError(''); setCode(''); }}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ← Back to QR code
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8 text-center gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <SafeIcon icon="FiCheckCircle" className="text-green-500 text-2xl" />
                </div>
                <p className="text-sm font-bold text-[#0B0D0F]">Authenticator app enabled!</p>
                <p className="text-xs text-gray-400">You'll use it next time you sign in.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default TotpSetupModal;
