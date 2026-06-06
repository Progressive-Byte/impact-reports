import SafeIcon from '../../../../../../common/SafeIcon';
import { Input, Textarea } from './FormField';

const MediaTimelineTab = ({ form, update }) => {
  const addMilestone = () =>
    update('milestones', [...form.milestones, { id: Date.now(), date: '', title: '', notes: '' }]);
  const removeMilestone = (id) =>
    update('milestones', form.milestones.filter(m => m.id !== id));
  const updateMilestone = (id, key, val) =>
    update('milestones', form.milestones.map(m => m.id === id ? { ...m, [key]: val } : m));

  return (
    <div className="space-y-6">
      <Input
        label="Gallery Images URL (Cloudinary / S3)"
        placeholder="https://..."
        value={form.galleryUrl}
        onChange={e => update('galleryUrl', e.target.value)}
      />

      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Project Milestones</p>
        <div className="space-y-3">
          {form.milestones.map((m) => (
            <div key={m.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Input
                  placeholder="Date / Timeframe"
                  value={m.date}
                  onChange={e => updateMilestone(m.id, 'date', e.target.value)}
                  className="w-40 flex-shrink-0"
                />
                <Input
                  placeholder="Milestone Title"
                  value={m.title}
                  onChange={e => updateMilestone(m.id, 'title', e.target.value)}
                  className="flex-1"
                />
                <button
                  onClick={() => removeMilestone(m.id)}
                  className="w-10 h-[46px] flex items-center justify-center text-gray-400 hover:text-[#E52321] border border-gray-200 rounded-xl bg-white transition-colors flex-shrink-0"
                >
                  <SafeIcon icon="FiTrash2" className="text-sm" />
                </button>
              </div>
              <Textarea
                rows={3}
                placeholder="Milestone notes..."
                value={m.notes}
                onChange={e => updateMilestone(m.id, 'notes', e.target.value)}
              />
            </div>
          ))}
        </div>
        <button
          onClick={addMilestone}
          className="mt-3 w-full border border-dashed border-gray-200 rounded-xl py-3 text-sm text-[#76767e] font-semibold hover:bg-red-50 hover:border-[#E52321] hover:text-[#E52321] transition-colors flex items-center justify-center gap-2"
        >
          <SafeIcon icon="FiPlus" className="text-sm" />
          Add Milestone
        </button>
      </div>
    </div>
  );
};

export default MediaTimelineTab;
