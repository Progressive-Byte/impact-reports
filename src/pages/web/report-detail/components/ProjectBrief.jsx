import React, { useState } from 'react';
import CollapsibleSection from '../../../../common/CollapsibleSection';
import SafeIcon from '../../../../common/SafeIcon';

const ProjectBrief = ({ report, hiddenFields }) => {
  const [openSections, setOpenSections] = useState({ background: true, response: false });
  const toggle = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  const isHidden = (key) => hiddenFields?.has ? hiddenFields.has(key) : (hiddenFields || []).includes(key);

  const shortId = report.projectId || `REP-${report.id.slice(-6).toUpperCase()}`;

  return (
    <section>
      <div className="bg-white rounded-[2rem] shadow-[0_18px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden text-left">
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#0B0D0F] text-white flex items-center justify-center flex-shrink-0">
              <SafeIcon icon="FiFileText" className="text-lg sm:text-2xl" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-3xl font-black text-[#0B0D0F] tracking-tight uppercase leading-tight">
                Executive Summary
              </h2>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm leading-relaxed">Key facts and narrative overview of this project.</p>
            </div>
          </div>

          {(() => {
            const metaCards = [
              !isHidden('actualProjectId') && { label: 'Project ID',         value: shortId },
              !isHidden('sector')          && { label: 'Sector' + ((report.sector || []).length > 1 ? 's' : ''), value: (report.sector || []).join(', ') },
              !isHidden('region')          && { label: 'Operational Region',  value: report.region },
            ].filter(Boolean);
            if (!metaCards.length) return null;
            return (
              <div className={`mt-6 grid grid-cols-1 gap-4 ${metaCards.length === 1 ? 'sm:grid-cols-1' : metaCards.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
                {metaCards.map(({ label, value }) => (
                  <div key={label} className="rounded-2xl bg-white border border-gray-100 p-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
                    <p className="text-sm font-black text-[#0B0D0F]">{value || '—'}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {!isHidden('projectBackground') && report.projectBackground && (
          <CollapsibleSection
            title="Project Background"
            isOpen={openSections.background}
            onToggle={() => toggle('background')}
            variant="brief"
          >
            <div
              className="rich-text-output text-gray-600 leading-relaxed text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: report.projectBackground }}
            />
          </CollapsibleSection>
        )}

        {!isHidden('strategicResponse') && report.strategicResponse && (
          <CollapsibleSection
            title="Strategic Response"
            isOpen={openSections.response}
            onToggle={() => toggle('response')}
            variant="brief"
          >
            <div
              className="rich-text-output text-gray-600 leading-relaxed text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: report.strategicResponse }}
            />
          </CollapsibleSection>
        )}
      </div>
    </section>
  );
};

export default ProjectBrief;
