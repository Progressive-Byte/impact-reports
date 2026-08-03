import React from 'react';
import SafeIcon from '../../../../common/SafeIcon';

const ProjectMetaCard = ({ report }) => (
  <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden">
    <div className="p-6 border-b border-gray-50 flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
        <SafeIcon icon="FiInfo" className="text-[#E52321] text-lg" />
      </div>
      <h2 className="text-[11px] font-black text-[#0B0D0F] uppercase tracking-widest">Project Details</h2>
    </div>
    <div className="p-6 space-y-4">
      {[
        { label: 'Sector',           value: (report.sector || []).join(', '), icon: 'FiLayers'   },
        { label: 'Reporting Period', value: report.reportingPeriod,  icon: 'FiCalendar' },
        { label: 'Region',       value: report.region,      icon: 'FiGlobe'    },
        { label: 'Project Lead', value: report.projectLead, icon: 'FiUser'     },
      ].filter(({ value }) => value).map(({ label, value, icon }) => (
        <div key={label} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
            <SafeIcon icon={icon} className="text-gray-400 text-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-[#0B0D0F] truncate">{value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ProjectMetaCard;
