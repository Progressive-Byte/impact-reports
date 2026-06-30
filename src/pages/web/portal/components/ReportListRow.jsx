import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiArrowRight } from 'react-icons/fi';

const ReportListRow = ({ report }) => {
  const destination = `/report/${report.slug || report.id}`;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.09)] hover:border-[#E52321]/20 transition-all duration-300 overflow-hidden">

      {/* ── Mobile: full-width image on top ─────────────────────── */}
      <Link to={destination} className="block sm:hidden w-full h-52 overflow-hidden">
        <img
          src={report.image}
          alt={report.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </Link>

      {/* ── Card body ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-4 sm:p-5">

        {/* Desktop image — left column */}
        <Link
          to={destination}
          className="hidden sm:block w-40 h-[6.5rem] rounded-2xl overflow-hidden flex-shrink-0"
        >
          <img
            src={report.image}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>

        {/* Centre — title, description, meta */}
        <div className="flex-grow min-w-0">

          {/* Mobile meta row */}
          <div className="flex items-center justify-between sm:hidden mb-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
              <FiMapPin className="text-[#E52321] text-xs flex-shrink-0" />
              {report.region}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {report.year} &middot; {report.sector}
            </span>
          </div>

          <Link to={destination}>
            <h3 className="text-lg sm:text-xl font-black text-[#0B0D0F] tracking-tight line-clamp-1 group-hover:text-[#E52321] transition-colors">
              {report.title}
            </h3>
          </Link>

          <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {report.summary}
          </p>

          {/* Desktop meta row */}
          <div className="hidden sm:flex items-center gap-2.5 mt-2.5">
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
              <FiMapPin className="text-[#E52321] text-xs flex-shrink-0" />
              {report.region}
            </span>
            <span className="w-px h-3 bg-gray-300 flex-shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {report.year} &middot; {report.sector}
            </span>
          </div>
        </div>

        {/* Right — impact + arrow (desktop stacked, mobile side-by-side) */}
        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-3 flex-shrink-0">
          <div className="sm:text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Impact</p>
            <p className="text-base sm:text-lg font-black text-[#0B0D0F]">
              {report.metrics.beneficiaries.toLocaleString()}
            </p>
          </div>
          <Link
            to={destination}
            className="w-10 h-10 rounded-xl bg-[#0B0D0F] hover:bg-[#E52321] text-white flex items-center justify-center transition-colors duration-300 flex-shrink-0"
          >
            <FiArrowRight className="text-base" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ReportListRow;
