import React from 'react';
import SafeIcon from '../../../../common/SafeIcon';
import DemographicRow from './DemographicRow';

const COLORS = ['bg-[#E52321]', 'bg-[#0B0D0F]', 'bg-gray-300', 'bg-amber-400', 'bg-emerald-500', 'bg-sky-500'];

const DemographicsCard = ({ title, demographics }) => {
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-6 flex items-center gap-3 border-b border-gray-50">
        <div className="w-10 h-10 rounded-2xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
          <SafeIcon icon="FiUsers" className="text-[#E52321] text-lg" />
        </div>
        <h2 className="text-[11px] font-black text-[#0B0D0F] uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-6 space-y-6">
        {demographics.map((d, i) => (
          <DemographicRow
            key={i}
            label={d.label}
            percentage={d.percentage}
            icon={d.icon || 'FiUsers'}
            color={COLORS[i % COLORS.length]}
          />
        ))}
      </div>
    </div>
  );
};

export default DemographicsCard;
