import SafeIcon from '../../../../../../common/SafeIcon';
import { Input, Textarea } from './FormField';

const MAX_IMAGES = 10;

const MediaTimelineTab = ({ form, update, fieldErrors = {} }) => {
  // ── Images ──────────────────────────────────────────────────────────
  const addImage = () => {
    if (form.images.length >= MAX_IMAGES) return;
    update('images', [...form.images, { id: Date.now(), url: '' }]);
  };
  const removeImage = (id) =>
    update('images', form.images.filter(img => img.id !== id));
  const updateImage = (id, val) =>
    update('images', form.images.map(img => img.id === id ? { ...img, url: val } : img));

  // ── Milestones ──────────────────────────────────────────────────────
  const addMilestone = () =>
    update('milestones', [...form.milestones, { id: Date.now(), date: '', title: '', notes: '' }]);
  const removeMilestone = (id) =>
    update('milestones', form.milestones.filter(m => m.id !== id));
  const updateMilestone = (id, key, val) =>
    update('milestones', form.milestones.map(m => m.id === id ? { ...m, [key]: val } : m));

  const imageCount    = form.images.length;
  const atImageLimit  = imageCount >= MAX_IMAGES;

  return (
    <div className="space-y-6">

      {/* ── Field Documentation Images ───────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Field Documentation Images <span className="text-[#E52321]">*</span>
          </p>
          <div className="flex items-center gap-3">
            {fieldErrors.images && (
              <p className="text-xs text-red-500 font-medium">{fieldErrors.images}</p>
            )}
            <span className={`text-xs font-bold tabular-nums ${atImageLimit ? 'text-[#E52321]' : 'text-gray-400'}`}>
              {imageCount} / {MAX_IMAGES}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {form.images.map((img, idx) => (
            <div key={img.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                {img.url.trim() ? (
                  <img
                    src={img.url}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <SafeIcon icon="FiImage" className="text-gray-400 text-sm" style={{ display: img.url.trim() ? 'none' : 'block' }} />
              </div>
              <Input
                placeholder={`Image URL ${idx + 1} (Cloudinary / S3 / https://...)`}
                value={img.url}
                onChange={e => updateImage(img.id, e.target.value)}
                className="flex-1"
              />
              <button
                onClick={() => removeImage(img.id)}
                disabled={form.images.length === 1}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#E52321] border border-gray-200 rounded-xl bg-white transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SafeIcon icon="FiTrash2" className="text-sm" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addImage}
          disabled={atImageLimit}
          className="mt-3 w-full border border-dashed border-gray-200 rounded-xl py-3 text-sm text-[#76767e] font-semibold hover:bg-red-50 hover:border-[#E52321] hover:text-[#E52321] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-200 disabled:hover:text-[#76767e]"
        >
          <SafeIcon icon="FiPlus" className="text-sm" />
          {atImageLimit ? `Limit reached (${MAX_IMAGES} max)` : 'Add Image URL'}
        </button>
      </div>

      {/* ── Video URL ─────────────────────────────────────────────────── */}
      <Input
        label="Video URL (optional)"
        placeholder="https://youtube.com/watch?v=... or Vimeo / S3 link"
        value={form.videoUrl}
        onChange={e => update('videoUrl', e.target.value)}
      />

      {/* ── Milestones ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Project Milestones <span className="text-[#E52321]">*</span>
          </p>
          {fieldErrors.milestones && (
            <p className="text-xs text-red-500 font-medium">{fieldErrors.milestones}</p>
          )}
        </div>
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
