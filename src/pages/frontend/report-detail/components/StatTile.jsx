import React from 'react';
import SafeIcon from '../../../common/SafeIcon';

const StatTile = ({ title, value, icon }) => (
  <div className="p-6 sm:p-8 flex items-center gap-4 text-left">
    <div className="w-12 h-12 rounded-2xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center flex-shrink-0">
      <SafeIcon icon={icon} className="text-[#E52321] text-xl" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 truncate">{title}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-black text-[#0B0D0F] tracking-tight leading-none truncate">
        {value}
      </p>
    </div>
  </div>
);

export default StatTile;
