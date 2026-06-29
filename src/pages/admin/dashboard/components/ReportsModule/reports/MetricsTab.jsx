import SafeIcon from '../../../../../../common/SafeIcon';
import { Input } from './FormField';
import IconPicker from './IconPicker';
import FieldToggle from './FieldToggle';

const MetricsTab = ({ form, update, fieldErrors = {}, hiddenFields = [], onToggle }) => {
  const toggle = (key) => <FieldToggle fieldKey={key} hiddenFields={hiddenFields} onToggle={onToggle} />;

  const addDeliverable = () =>
    update('deliverables', [...form.deliverables, { id: Date.now(), label: '', count: '', icon: '', description: '' }]);
  const removeDeliverable = (id) =>
    update('deliverables', form.deliverables.filter(d => d.id !== id));
  const updateDeliverable = (id, key, val) =>
    update('deliverables', form.deliverables.map(d => d.id === id ? { ...d, [key]: val } : d));

  const total = (Number(form.children) || 0) + (Number(form.women) || 0) + (Number(form.men) || 0);
  const overLimit = total > 100;

  return (
    <div className="space-y-5">
      {/* Demographics section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Demographics</p>
          {toggle('demographics')}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Children %" type="number" min="0" max="100" value={form.children} onChange={e => update('children', e.target.value)} error={overLimit ? ' ' : undefined} />
          <Input label="Women %"   type="number" min="0" max="100" value={form.women}    onChange={e => update('women',    e.target.value)} error={overLimit ? ' ' : undefined} />
          <Input label="Men %"     type="number" min="0" max="100" value={form.men}      onChange={e => update('men',      e.target.value)} error={overLimit ? ' ' : undefined} />
        </div>
        <div className="flex items-center justify-between px-1">
          <p className={`text-xs font-bold ${overLimit ? 'text-[#E52321]' : 'text-gray-400'}`}>
            Total: {total}%
            {overLimit && ' — must not exceed 100%'}
          </p>
          <div className="flex-1 mx-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${overLimit ? 'bg-[#E52321]' : 'bg-green-500'}`}
              style={{ width: `${Math.min(total, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 tabular-nums w-8 text-right">100%</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Custom Deliverables <span className="text-[#E52321]">*</span>
          </p>
          <div className="flex items-center gap-3">
            {fieldErrors.deliverables && (
              <p className="text-xs text-red-500 font-medium">{fieldErrors.deliverables}</p>
            )}
            {toggle('deliverables')}
          </div>
        </div>

        <div className="space-y-3">
          {form.deliverables.map((d) => (
            <div key={d.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <IconPicker
                  value={d.icon}
                  onChange={val => updateDeliverable(d.id, 'icon', val)}
                />
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
