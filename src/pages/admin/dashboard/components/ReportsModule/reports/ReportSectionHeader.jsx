import SafeIcon from '../../../../../../common/SafeIcon';

const ReportSectionHeader = ({ isWizard, isSuperAdmin, projectName, onBack, onNewReport }) => (
  <div className="flex items-center justify-between px-1">
    <div>
      {isWizard ? (
        <>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#0B0D0F] mb-1 transition-colors"
          >
            <SafeIcon icon="FiArrowLeft" className="text-sm" />
            Back to reports
          </button>
          <h2 className="text-2xl font-black text-[#0B0D0F] tracking-tight">
            {projectName || 'New Report'}
          </h2>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-black text-[#0B0D0F] tracking-tight">Impact Core</h2>
          <p className="text-sm text-gray-400 mt-0.5">Technical reporting &amp; executive accountability</p>
        </>
      )}
    </div>

    {!isWizard && isSuperAdmin && (
      <button
        onClick={onNewReport}
        className="flex items-center gap-2 bg-[#0B0D0F] hover:bg-[#1a1d20] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
      >
        <SafeIcon icon="FiPlus" className="text-base" />
        New Report
      </button>
    )}
  </div>
);

export default ReportSectionHeader;
