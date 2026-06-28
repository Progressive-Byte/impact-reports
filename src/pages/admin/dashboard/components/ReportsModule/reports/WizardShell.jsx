import SafeIcon from '../../../../../../common/SafeIcon';
import StepIndicator, { STEPS } from './TabNav';

const TOTAL_STEPS = STEPS.length;

const WizardShell = ({
  step, loading, form, update, adminOptions, allAdminOptions, regionOptions, sectorOptions,
  StepContent, saving, onBack, onNext, onStepClick, onApprove,
  isSuperAdmin = true, isViewer = false, isApprover = false, fieldErrors = {},
}) => {
  const isReadOnly = isViewer || isApprover;

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm">

      {/* Step indicator */}
      <div className="px-8 pt-7 pb-6 border-b border-gray-100">
        <StepIndicator current={step} completedSteps={form.stepsCompleted || []} onStepClick={onStepClick} />
      </div>

      {/* Approver banner */}
      {isApprover && (
        <div className="mx-8 mt-6 flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <SafeIcon icon="FiEye" className="text-blue-500 text-sm flex-shrink-0" />
          <p className="text-xs font-semibold text-blue-700">
            You are the approval reviewer for this report. Review all steps, then approve on the last step to publish.
          </p>
        </div>
      )}

      {/* Step content */}
      <div className="px-8 py-7">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : isReadOnly ? (
          <div className="pointer-events-none select-none">
            <StepContent
              form={form}
              update={update}
              adminOptions={adminOptions}
              allAdminOptions={allAdminOptions}
              regionOptions={regionOptions}
              sectorOptions={sectorOptions}
              departmentOptions={departmentOptions}
              isSuperAdmin={isSuperAdmin}
              fieldErrors={{}}
            />
          </div>
        ) : (
          <StepContent
            form={form}
            update={update}
            adminOptions={adminOptions}
            allAdminOptions={allAdminOptions}
            regionOptions={regionOptions}
            sectorOptions={sectorOptions}
            departmentOptions={departmentOptions}
            isSuperAdmin={isSuperAdmin}
            fieldErrors={fieldErrors}
          />
        )}
      </div>

      {/* Footer navigation */}
      <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex items-center justify-between">
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <SafeIcon icon={isReadOnly ? 'FiEye' : 'FiShield'} className="text-xs" />
          {isApprover
            ? `Step ${step} of ${TOTAL_STEPS} · approval review`
            : isViewer
              ? `Step ${step} of ${TOTAL_STEPS} · read-only view`
              : `Step ${step} of ${TOTAL_STEPS} · saved on Next`}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            disabled={saving}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          {isApprover ? (
            step < TOTAL_STEPS ? (
              <button
                onClick={onNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0B0D0F] hover:bg-[#1a1d20] text-white rounded-xl text-sm font-bold transition-colors"
              >
                Next <SafeIcon icon="FiArrowRight" className="text-sm" />
              </button>
            ) : (
              <button
                onClick={onApprove}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              >
                {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <SafeIcon icon="FiCheckCircle" className="text-sm" /> Approve &amp; Publish
              </button>
            )
          ) : isViewer ? (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0B0D0F] hover:bg-[#1a1d20] text-white rounded-xl text-sm font-bold transition-colors"
            >
              {step < TOTAL_STEPS ? (
                <>Next <SafeIcon icon="FiArrowRight" className="text-sm" /></>
              ) : (
                <>Close <SafeIcon icon="FiX" className="text-sm" /></>
              )}
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={saving || loading}
              className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
                step < TOTAL_STEPS ? 'bg-[#0B0D0F] hover:bg-[#1a1d20]' : 'bg-[#E52321] hover:bg-[#c91d1b]'
              }`}
            >
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {step < TOTAL_STEPS ? (
                <>Save &amp; Next <SafeIcon icon="FiArrowRight" className="text-sm" /></>
              ) : (
                <><SafeIcon icon="FiCheck" className="text-sm" /> Submit Report</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardShell;
