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
      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug line-clamp-2">
        {report.title}
      </h3>

      <p className="mt-2 text-sm text-white/70 leading-relaxed line-clamp-2">
        {report.summary}
      </p>

      {/* Bottom row — Location first, then Impact, arrow far right */}
      <div className="mt-5 flex items-end justify-between">
        <div className="flex items-end">
          <div className="flex flex-col items-start gap-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <SafeIcon icon="FiMapPin" className="text-white text-[10px] flex-shrink-0" />
              <span className="text-white text-[11px] font-semibold truncate">{report.region}</span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white truncate">
              {report.year} • {report.sector}
            </span>
          </div>

          <div className="min-w-0 ml-4 pl-4 border-l border-white/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Impact</p>
            <p className="text-lg font-black text-white tracking-tight">{report.metrics.beneficiaries.toLocaleString()}</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 group-hover:bg-[#E52321] border border-white/10 group-hover:border-[#E52321] text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 flex-shrink-0">
          <SafeIcon icon="FiArrowRight" className="text-base" />
        </span>
      </div>
    </div>
  </Link>
);

export default ReportCard;
