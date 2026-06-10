import SafeIcon from '../../../../../../common/SafeIcon';
import { Input } from './FormField';

const MetricsTab = ({ form, update, fieldErrors = {} }) => {
  const addDeliverable = () =>
    update('deliverables', [...form.deliverables, { id: Date.now(), label: '', count: '', icon: '', description: '' }]);
  const removeDeliverable = (id) =>
    update('deliverables', form.deliverables.filter(d => d.id !== id));
  const updateDeliverable = (id, key, val) =>
    update('deliverables', form.deliverables.map(d => d.id === id ? { ...d, [key]: val } : d));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <Input label="Children %" required type="number" value={form.children} onChange={e => update('children', e.target.value)} />
        <Input label="Women %"   required type="number" value={form.women}    onChange={e => update('women',    e.target.value)} />
        <Input label="Men %"     required type="number" value={form.men}      onChange={e => update('men',      e.target.value)} />
      </div>

      <div className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium border ${
        fieldErrors.demographics
          ? 'bg-red-50 border-red-300 text-red-700'
          : isValid
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
      }`}>
        <span>Demographic split</span>
        <span>{fieldErrors.demographics || `${total}% — should total 100%`}</span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Custom Deliverables <span className="text-[#E52321]">*</span>
          </p>
          {fieldErrors.deliverables && (
            <p className="text-xs text-red-500 font-medium">{fieldErrors.deliverables}</p>
          )}
        </div>

        <div className="space-y-3">
          {form.deliverables.map((d) => (
            <div key={d.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
              {/* Row 1: icon picker + label + count + delete */}
              <div className="flex items-center gap-3">
                {/* Icon preview + name input */}
                <div className="flex items-center gap-2 w-52 flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <SafeIcon icon={d.icon || 'FiBox'} className="text-[#E52321] text-lg" />
                  </div>
                  <Input
                    placeholder="e.g. FiBox"
                    value={d.icon}
                    onChange={e => updateDeliverable(d.id, 'icon', e.target.value)}
                    className="flex-1"
                  />
                </div>

                <Input
                  placeholder="Metric Label (e.g. Solar Wells)"
                  value={d.label}
                  onChange={e => updateDeliverable(d.id, 'label', e.target.value)}
                  className="flex-1"
                />

                <Input
                  type="number"
                  placeholder="Count"
                  value={d.count}
                  onChange={e => updateDeliverable(d.id, 'count', e.target.value)}
                  className="w-28"
                />

                <button
                  onClick={() => removeDeliverable(d.id)}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#E52321] border border-gray-200 rounded-xl bg-white transition-colors flex-shrink-0"
                >
                  <SafeIcon icon="FiTrash2" className="text-sm" />
                </button>
              </div>

              {/* Row 2: description */}
              <Input
                placeholder="Short description (e.g. Installed across rural communities)"
                value={d.description}
                onChange={e => updateDeliverable(d.id, 'description', e.target.value)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={addDeliverable}
          className="mt-3 w-full border border-dashed border-gray-200 rounded-xl py-3 text-sm text-[#76767e] font-semibold hover:bg-red-50 hover:border-[#E52321] hover:text-[#E52321] transition-colors flex items-center justify-center gap-2"
        >
          <SafeIcon icon="FiPlus" className="text-sm" />
          Add Metric
        </button>
      </div>
    </div>
  );
};

export default MetricsTab;
