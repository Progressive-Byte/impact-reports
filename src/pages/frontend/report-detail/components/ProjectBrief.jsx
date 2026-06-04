import React, { useState } from 'react';
import CollapsibleSection from '../../../../common/CollapsibleSection';

const ProjectBrief = ({ report }) => {
  const [openSections, setOpenSections] = useState({ background: true, response: false });
  const toggle = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section>
      <div className="bg-white rounded-[2rem] shadow-[0_18px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden text-left">
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
          <div className="flex items-start justify-between gap-4">
            <h2 className="mt-1 text-xl sm:text-2xl font-black text-[#0B0D0F] tracking-tight">
              Executive Summary
            </h2>
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E52321]" />
              {report.id.toUpperCase()}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Project ID', value: report.id.toUpperCase() },
              { label: 'Primary Sector', value: report.sector },
              { label: 'Operational Region', value: report.region },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-white border border-gray-100 p-5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
                <p className="text-sm font-black text-[#0B0D0F]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <CollapsibleSection
          title="Project Background"
          isOpen={openSections.background}
          onToggle={() => toggle('background')}
          variant="brief"
        >
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            The {report.title} was launched to address critical resource gaps in{' '}
            {report.sector.toLowerCase()} services within {report.region}. This initiative focuses on
            long-term sustainability and community self-reliance.
          </p>
        </CollapsibleSection>

        <CollapsibleSection
          title="Strategic Response"
          isOpen={openSections.response}
          onToggle={() => toggle('response')}
          variant="brief"
        >
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            Human Concern USA mobilized expert field teams and local partners to implement a phased
            deployment strategy, ensuring maximum impact for every dollar invested.
          </p>
        </CollapsibleSection>
      </div>
    </section>
  );
};

export default ProjectBrief;
