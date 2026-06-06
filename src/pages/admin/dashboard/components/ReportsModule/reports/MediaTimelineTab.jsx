import SafeIcon from '../../../../../../common/SafeIcon';
import { Input } from './FormField';

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
            <div key={m.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="Date / Timeframe"
                  value={m.date}
                  onChange={e => updateMilestone(m.id, 'date', e.target.value)}
                  className="w-36 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none bg-transparent"
                />
                <div className="w-px h-4 bg-gray-200 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Milestone Title"
                  value={m.title}
                  onChange={e => updateMilestone(m.id, 'title', e.target.value)}
                  className="flex-1 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none bg-transparent"
                />
                <button
                  onClick={() => removeMilestone(m.id)}
                  className="text-gray-400 hover:text-[#E52321] transition-colors ml-2 flex-shrink-0"
                >
                  <SafeIcon icon="FiTrash2" className="text-sm" />
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Milestone notes..."
                value={m.notes}
                onChange={e => updateMilestone(m.id, 'notes', e.target.value)}
                className="w-full px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none bg-white resize-none"
              />
            </div>
          ))}
        </div>
        <button
          onClick={addMilestone}
          className="mt-3 w-full border border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          <SafeIcon icon="FiPlus" className="text-sm" />
          Add Milestone
        </button>
      </div>
    </div>
  );
};

export default MediaTimelineTab;
