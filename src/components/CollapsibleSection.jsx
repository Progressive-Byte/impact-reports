import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';

/**
 * variant="section"  — large card sections (ReportDetail top-level)
 * variant="brief"    — compact inner items (ProjectBrief sub-items)
 * variant="filter"   — slim filter sidebar accordions (Portal)
 */
const CollapsibleSection = ({
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
  headerRight,
  variant = 'section',
}) => {
  if (variant === 'brief') {
    return (
      <div className="border-t border-gray-100 overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-6 sm:px-8 py-5 hover:bg-gray-50/60 transition-colors group"
        >
          <h3 className="text-base sm:text-lg font-black text-[#0B0D0F] tracking-tight">{title}</h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all ${
              isOpen
                ? 'bg-[#0B0D0F] border-[#0B0D0F] text-white'
                : 'bg-white border-gray-100 text-gray-400 group-hover:text-[#E52321] group-hover:border-[#E52321]/20'
            }`}
          >
            <SafeIcon icon="FiChevronDown" className="text-lg" />
          </motion.div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              <div className="px-6 sm:px-8 pb-6">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'filter') {
    return (
      <div className="rounded-2xl bg-gray-50/60 border border-gray-100 overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/70 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#E52321]" />
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.25em] group-hover:text-[#0B0D0F] transition-colors">
              {title}
            </h4>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#E52321] group-hover:border-[#E52321]/20 transition-all"
          >
            <SafeIcon icon="FiChevronDown" className="text-base" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 text-left max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // variant === 'section' (default)
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2rem] shadow-[0_18px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 sm:px-10 py-6 sm:py-8 hover:bg-gray-50/60 transition-colors group text-left"
      >
        <div className="flex items-start gap-4 pr-4">
          <div className="w-10 h-10 rounded-2xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#E52321]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#0B0D0F] tracking-tight leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-500 mt-1 text-xs sm:text-sm leading-relaxed">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {headerRight && <div className="hidden sm:block">{headerRight}</div>}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center transition-all ${
              isOpen
                ? 'bg-[#0B0D0F] border-[#0B0D0F] text-white shadow-sm'
                : 'bg-white border-gray-100 text-gray-400 group-hover:text-[#E52321] group-hover:border-[#E52321]/20'
            }`}
          >
            <SafeIcon icon="FiChevronDown" className="text-lg" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <div className="border-t border-gray-100">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default CollapsibleSection;
