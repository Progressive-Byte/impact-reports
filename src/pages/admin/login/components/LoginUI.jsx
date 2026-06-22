import { motion } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';

export const ErrorBanner = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3 bg-[#E52321]/10 border border-[#E52321]/20 rounded-2xl px-4 py-3 mb-5"
  >
    <SafeIcon icon="FiAlertCircle" className="text-[#E52321] text-base flex-shrink-0" />
    <span className="text-[#E52321] text-sm font-bold">{message}</span>
  </motion.div>
);

export const BackLink = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-gray-300 transition-colors mb-6"
  >
    <SafeIcon icon="FiArrowLeft" className="text-xs" /> {label}
  </button>
);

export const Field = ({ label, icon, type, value, onChange, placeholder }) => (
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

export const Btn = ({ loading, disabled, label, icon }) => (
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
