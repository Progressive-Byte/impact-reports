import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';

const STARS = 5;

const TestimonialCard = () => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden"
  >
    {/* Top accent bar */}
    <div className="h-1 w-full bg-gradient-to-r from-[#E52321] via-[#E52321]/60 to-transparent" />

    <div className="p-6">
      {/* Header row: label + stars */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
            <SafeIcon icon="FiMessageSquare" className="text-[#E52321] text-sm" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Testimonial</p>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: STARS }).map((_, i) => (
            <SafeIcon key={i} icon="FiStar" className="text-amber-400 text-sm fill-amber-400" />
          ))}
        </div>
      </div>

      {/* Large opening quote */}
      <div className="w-10 h-10 rounded-2xl bg-[#E52321]/8 flex items-center justify-center mb-4">
        <span className="text-[#E52321] text-3xl font-black leading-none select-none" style={{ fontFamily: 'Georgia, serif', lineHeight: 1 }}>&ldquo;</span>
      </div>

      {/* Quote text */}
      <p className="text-sm sm:text-base font-semibold text-[#0B0D0F] leading-relaxed">
        The mobile clinic arrived when we had no other options. They saved my son's life — I cannot put into words the relief our family felt.
      </p>

      {/* Author */}
      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E52321]/15 to-[#E52321]/5 border border-[#E52321]/10 flex items-center justify-center flex-shrink-0">
          <SafeIcon icon="FiUser" className="text-[#E52321] text-lg" />
        </div>
        <div className="min-w-0 text-left">
          <p className="font-black text-[#0B0D0F] text-sm leading-none">Tariq M.</p>
          <p className="mt-1 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Father · Gaza, Palestine</p>
        </div>
        {/* Verified badge */}
        <div className="ml-auto flex-shrink-0">
          <span className="inline-flex items-center gap-1 bg-green-50 border border-green-100 text-green-600 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest">
            <SafeIcon icon="FiCheck" className="text-[9px]" /> Verified
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default TestimonialCard;
