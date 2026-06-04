import React from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from '../../../../common/SafeIcon';

const ReportListRow = ({ report }) => (
  <div className="group bg-white rounded-[2rem] p-4 sm:p-5 border border-gray-100 shadow-[0_12px_35px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.08)] hover:border-[#E52321]/20 transition-all duration-300 text-left">
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="w-full sm:w-36 h-32 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 relative">
        <img
          src={report.image}
          alt={report.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500">
            {report.year}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#E52321]/10 border border-[#E52321]/15 text-[10px] font-black uppercase tracking-widest text-[#E52321]">
            {report.sector}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 truncate">
            {report.region}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-[#0B0D0F] tracking-tight truncate group-hover:text-[#E52321] transition-colors">
          {report.title}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-1">{report.summary}</p>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="hidden sm:block text-right min-w-[100px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Impact</p>
          <p className="text-base font-black text-[#0B0D0F]">
            {report.metrics.beneficiaries.toLocaleString()}
          </p>
        </div>
        <Link
          to={`/report/${report.id}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B0D0F] hover:bg-[#E52321] text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] transition-all"
        >
          Report <SafeIcon icon="FiArrowRight" className="text-base" />
        </Link>
      </div>
    </div>
  </div>
);

export default ReportListRow;
