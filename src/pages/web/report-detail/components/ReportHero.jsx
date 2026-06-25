import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1200&q=80';

const ReportHero = ({ report, onImageError }) => {
  const plainBackground = report.projectBackground
    ? report.projectBackground.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
  const heroSummary = plainBackground.length > 200
    ? plainBackground.slice(0, 200).trimEnd() + '…'
    : plainBackground;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-[0_30px_80px_rgba(0,0,0,0.12)]"
      >
        <img
          src={report.image || FALLBACK_IMAGE}
          alt={report.title}
          onError={onImageError}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-end min-h-[360px] sm:min-h-[420px]">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {/* {[
              { icon: 'FiMapPin',  label: report.region },
              { icon: 'FiLayers', label: report.sector },
              { icon: 'FiCalendar', label: report.year },
            ].filter(({ label }) => label).map(({ icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md border border-white/30 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#0B0D0F] shadow-[0_14px_35px_rgba(0,0,0,0.35)]">
                <SafeIcon icon={icon} className="text-sm text-[#E52321]" />
                {label}
              </span>
            ))} */}
            {/* <span className="inline-flex items-center gap-2 rounded-full bg-[#E52321]/20 backdrop-blur-md border border-[#E52321]/30 text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] shadow-[0_14px_35px_rgba(0,0,0,0.35)]">
              <SafeIcon icon="FiCheck" className="text-sm text-[#E52321]" /> Verified Report
            </span> */}
            <span className="inline-flex items-center gap-2 rounded-full bg-[#D1FAE5] text-[#065F46] border border-[#065F46]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em]">
              <SafeIcon icon="FiCheck" className="text-sm" /> Verified Report
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.05] max-w-4xl text-left">
            {report.title}
          </h1>
          {heroSummary && (
            <p className="mt-4 text-sm sm:text-base md:text-lg text-white/80 max-w-3xl leading-relaxed text-left">
              {heroSummary}
            </p>
          )}

          {/* Location row */}
          <div className="mt-6 flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-1.5">
              <SafeIcon icon="FiMapPin" className="text-white text-[10px] flex-shrink-0" />
              <span className="text-white text-[11px] font-semibold">{report.region}</span>
            </div>
            <span className="text-[8px] md:text-[10px] uppercase tracking-[0.18em] text-white/70">
              {report.year} • {report.sector}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportHero;
