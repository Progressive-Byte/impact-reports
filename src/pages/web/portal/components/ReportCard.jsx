import React from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from '../../../../common/SafeIcon';

const ReportCard = ({ report }) => (
  <Link to={`/report/${report.slug || report.id}`} className="group relative rounded-[2rem] overflow-hidden bg-black shadow-[0_18px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.14)] transition-all duration-500 text-left block cursor-pointer">
    {/* Background image */}
    <img
      src={report.image}
      alt={report.title}
      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
    />

    {/* Gradient overlay — transparent at top, dark at bottom */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

    {/* Bottom content */}
    <div className="relative z-10 p-6 sm:p-7 min-h-[340px] flex flex-col justify-end">
      {/* Title row — title on left, region+year on right */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug line-clamp-2 flex-1">
          {report.title}
        </h3>
        <div className="flex flex-col items-end gap-1 flex-shrink-0 pt-0.5">
          <div className="flex items-center gap-1.5">
            <SafeIcon icon="FiMapPin" className="text-[#E52321] text-[10px]" />
            <span className="text-white/80 text-[11px] font-semibold">{report.region}</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">
            {report.year} • {report.sector}
          </span>
        </div>
      </div>

      <p className="mt-2 text-sm text-white/70 leading-relaxed line-clamp-2">
        {report.summary}
      </p>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Impact</p>
          <p className="text-lg font-black text-white tracking-tight">{report.metrics.beneficiaries.toLocaleString()}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 group-hover:bg-[#E52321] border border-white/10 group-hover:border-[#E52321] text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300">
          <SafeIcon icon="FiArrowRight" className="text-base" />
        </span>
      </div>
    </div>
  </Link>
);

export default ReportCard;
