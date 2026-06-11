import SafeIcon from '../../../../../../common/SafeIcon';
import StepIndicator, { STEPS } from './TabNav';

const TOTAL_STEPS = STEPS.length;

const WizardShell = ({
  step, loading, form, update, adminOptions, regionOptions,
  StepContent, saving, onBack, onNext,
  isSuperAdmin = true, fieldErrors = {},
}) => (
  <div className="bg-white border border-gray-200 rounded-3xl shadow-sm">

    {/* Step indicator */}
    <div className="px-8 pt-7 pb-6 border-b border-gray-100">
      <StepIndicator current={step} />
    </div>

    {/* Step content */}
    <div className="px-8 py-7">
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      ) : (
        <StepContent
          form={form}
          update={update}
          adminOptions={adminOptions}
          regionOptions={regionOptions}
          isSuperAdmin={isSuperAdmin}
          fieldErrors={fieldErrors}
        />
      )}
    </div>

    {/* Footer navigation */}
    <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex items-center justify-between">
      <p className="text-xs text-gray-400 flex items-center gap-1.5">
        <SafeIcon icon="FiShield" className="text-xs" />
        Step {step} of {TOTAL_STEPS} · saved on Next
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={saving}
          className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {step === 1 ? 'Cancel' : '← Back'}
        </button>
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
      </div>
    </div>
  </div>
);

export default WizardShell;
