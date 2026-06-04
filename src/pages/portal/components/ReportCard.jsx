import React from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from '../../../common/SafeIcon';

const ReportCard = ({ report }) => (
  <div className="group relative rounded-[2rem] overflow-hidden border border-gray-100 bg-[#0B0D0F] shadow-[0_18px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.14)] transition-all duration-500 text-left">
    <div className="absolute inset-0">
      <img
        src={report.image}
        alt={report.title}
        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
    </div>

    <div className="relative z-10 p-6 sm:p-7 min-h-[340px] flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md border border-white/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] tabular-nums">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E52321]" />
          {report.year}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md border border-white/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <SafeIcon icon="FiMapPin" className="text-sm text-[#E52321]" />
          <span className="truncate max-w-[180px]">{report.region}</span>
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 flex-wrap">
        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          {report.sector}
        </span>
      </div>

      <div className="mt-auto pt-10">
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug line-clamp-2">
          {report.title}
        </h3>
        <p className="mt-3 text-sm text-white/75 leading-relaxed line-clamp-2">{report.summary}</p>
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Impact</p>
            <p className="text-lg font-black text-white tracking-tight">
              {report.metrics.beneficiaries.toLocaleString()}
            </p>
          </div>
          <Link
            to={`/report/${report.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-[#E52321] border border-white/10 hover:border-[#E52321] text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] transition-all"
          >
            <SafeIcon icon="FiArrowRight" className="text-base" />
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default ReportCard;
