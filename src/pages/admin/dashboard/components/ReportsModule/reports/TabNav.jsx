import SafeIcon from '../../../../../../common/SafeIcon';

export const STEPS = [
  { id: 1, label: 'General' },
  { id: 2, label: 'Narrative' },
  { id: 3, label: 'Metrics' },
  { id: 4, label: 'Media & Timeline' },
  { id: 5, label: 'Country & Location' },
];

const StepIndicator = ({ current }) => (
  <div className="flex items-center w-full">
    {STEPS.map((step, i) => {
      const done   = current > step.id;
      const active = current === step.id;

      return (
        <div key={step.id} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
              done   ? 'bg-green-500 text-white' :
              active ? 'bg-[#E52321] text-white'  :
                       'bg-gray-100 text-gray-400'
            }`}>
              {done ? <SafeIcon icon="FiCheck" className="text-sm" /> : step.id}
            </div>
            <span className={`text-sm font-bold whitespace-nowrap transition-colors ${
              active ? 'text-[#0B0D0F]' : done ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-4 transition-colors ${done ? 'bg-green-300' : 'bg-gray-200'}`} />
          )}
        </div>
      );
    })}
  </div>
);

export default StepIndicator;
