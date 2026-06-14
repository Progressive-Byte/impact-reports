import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';

const TestimonialCard = () => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden"
  >
    <div className="p-6 border-b border-gray-50 flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
        <SafeIcon icon="FiMessageSquare" className="text-[#E52321] text-lg" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Testimonial</p>
    </div>
    <div className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
          <SafeIcon icon="FiQuote" className="text-[#E52321] text-xl" />
        </div>
        <p className="text-base sm:text-lg font-semibold text-[#0B0D0F] leading-relaxed">
          "The mobile clinic arrived when we had no other options. They saved my son's life."
        </p>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-100 flex items-center justify-center flex-shrink-0">
          <SafeIcon icon="FiUser" className="text-gray-400 text-xl" />
        </div>
        <div className="min-w-0 text-left">
          <p className="font-black text-[#0B0D0F] text-sm leading-none">Tariq M.</p>
          <p className="mt-1 text-[10px] text-gray-500 uppercase tracking-[0.25em] font-black">Father, Gaza</p>
        </div>
      </div>
    </div>
  </motion.div>
);

export default TestimonialCard;
