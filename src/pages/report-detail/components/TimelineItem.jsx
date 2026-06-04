import React from 'react';

const TimelineItem = ({ milestone, isLast }) => (
  <div className={`relative ${isLast ? '' : 'pb-7'} text-left`}>
    <div className="absolute -left-7 sm:-left-[34px] top-6 z-10">
      <div className="w-4 h-4 rounded-full bg-white border border-[#E52321]/35 shadow-[0_10px_26px_rgba(229,35,33,0.10)] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[#E52321]" />
      </div>
    </div>

    <div className="rounded-[1.75rem] bg-white border border-black/10 shadow-[0_12px_32px_rgba(0,0,0,0.06)] overflow-hidden transition-shadow hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)]">
      <div className="px-5 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/15 text-[10px] font-black uppercase tracking-[0.25em] tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E52321]" />
            {milestone.date}
          </span>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            Milestone
          </div>
        </div>
      </div>
      <div className="px-5 sm:px-6 py-5">
        <h4 className="text-base sm:text-lg font-black text-[#0B0D0F] tracking-tight leading-snug">
          {milestone.title}
        </h4>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{milestone.description}</p>
      </div>
    </div>
  </div>
);

export default TimelineItem;
