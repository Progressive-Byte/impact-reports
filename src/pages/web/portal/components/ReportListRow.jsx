import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiArrowRight } from 'react-icons/fi';

const ArrowBtn = ({ to }) => (
  <Link
    to={to}
    className="inline-flex items-center justify-center rounded-full bg-[#0B0D0F] hover:bg-[#E52321] text-white px-4 py-2 transition-colors duration-300 flex-shrink-0"
  >
    <FiArrowRight className="text-base" />
  </Link>
);

const ReportListRow = ({ report }) => {
  const destination = `/report/${report.slug || report.id}`;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.09)] hover:border-[#E52321]/20 transition-all duration-300">

      {/* ── Mobile layout ─────────────────────────────────────────── */}
      <div className="sm:hidden">
        {/* Image with padding on all sides → all corners rounded */}
        <div className="p-4 pb-3">
          <Link to={destination} className="block w-full h-52 rounded-2xl overflow-hidden">
            <img
              src={report.image}
              alt={report.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </Link>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {/* Meta row */}
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
              <FiMapPin className="text-[#E52321] text-[11px] flex-shrink-0" />
              {report.region}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {report.year} &middot; {(report.sector || []).join(', ')}
            </span>
          </div>

          <Link to={destination}>
            <h3 className="text-lg font-black text-[#0B0D0F] tracking-tight line-clamp-1 group-hover:text-[#E52321] transition-colors">
              {report.title}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-gray-500 line-clamp-1 leading-relaxed">{report.summary}</p>

          {/* Impact + button */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Impact</p>
              <p className="text-base font-black text-[#0B0D0F]">
                {report.metrics.beneficiaries.toLocaleString()}
              </p>
            </div>
            <ArrowBtn to={destination} />
          </div>
        </div>
      </div>

      {/* ── Desktop layout ────────────────────────────────────────── */}
      <div className="hidden sm:flex items-stretch gap-5 p-5">
        {/* Image — stretches to full card height, all corners rounded */}
        <Link to={destination} className="block w-40 rounded-2xl overflow-hidden flex-shrink-0">
          <img
            src={report.image}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>

        {/* Content — grows, stacks vertically */}
        <div className="flex-grow min-w-0 flex flex-col">
          <div>
            <Link to={destination}>
              <h3 className="text-xl font-black text-[#0B0D0F] tracking-tight line-clamp-1 group-hover:text-[#E52321] transition-colors">
                {report.title}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-500 line-clamp-1 leading-relaxed">{report.summary}</p>
          </div>

          {/* Bottom row pinned to bottom — [region / year-sector] | [IMPACT / number] → [button] */}
          <div className="flex items-center mt-auto pt-3 border-t border-gray-50">
            {/* Left col: region + year-sector stacked */}
            <div className="flex flex-col min-w-0">
              <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                <FiMapPin className="text-[#E52321] text-[11px] flex-shrink-0" />
                {report.region}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {report.year} - {report.sector}
              </span>
            </div>

            {/* Vertical divider */}
            <span className="w-px h-8 bg-gray-200 flex-shrink-0 mx-4" />

            {/* Right col: IMPACT label + number stacked */}
            <div className="flex flex-col flex-shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Impact</p>
              <p className="text-base font-black text-[#0B0D0F]">
                {report.metrics.beneficiaries.toLocaleString()}
              </p>
            </div>

            {/* Button pushed to far right */}
            <div className="ml-auto pl-4">
              <ArrowBtn to={destination} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ReportListRow;
