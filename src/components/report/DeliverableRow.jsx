import React from 'react';
import SafeIcon from '../../common/SafeIcon';

const DeliverableRow = ({ item }) => (
  <div className="flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-[#E52321]/20 hover:bg-white transition-all">
    <div className="flex items-center min-w-0">
      <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
        <SafeIcon icon={item.icon} className="text-[#E52321] text-xl" />
      </div>
      <p className="text-sm sm:text-base font-black text-[#0B0D0F] truncate">{item.name}</p>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Verified Volume</p>
      <p className="mt-1 text-lg sm:text-xl font-black text-[#0B0D0F]">{item.count.toLocaleString()}</p>
    </div>
  </div>
);

export default DeliverableRow;
