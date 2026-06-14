import React from 'react';
import SafeIcon from '../../../../common/SafeIcon';
import DemographicRow from './DemographicRow';

const DemographicsCard = ({ demographics }) => (
  <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden">
    <div className="p-6 flex items-center gap-3 border-b border-gray-50">
      <div className="w-10 h-10 rounded-2xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
        <SafeIcon icon="FiUsers" className="text-[#E52321] text-lg" />
      </div>
      <h2 className="text-[11px] font-black text-[#0B0D0F] uppercase tracking-widest">Recipient Demographics</h2>
    </div>
    <div className="p-6 space-y-6">
      <DemographicRow label="Men"              percentage={demographics.men}      icon="FiUser"  color="bg-gray-300"  />
      <DemographicRow label="Women"            percentage={demographics.women}    icon="FiUser"  color="bg-[#0B0D0F]" />
      <DemographicRow label="Children (< 18)" percentage={demographics.children} icon="FiSmile" color="bg-[#E52321]"  />
    </div>
  </div>
);

export default DemographicsCard;
