import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../../common/SafeIcon';
import { Input } from './FormField';
import RichTextEditor from '@/common/RichTextEditor';
import { adminApiRequest } from '../../../../../../services/adminApi';
import FieldToggle from './FieldToggle';

const MAX_IMAGES  = 10;
const MAX_SIZE_MB = 2;

const MediaTimelineTab = ({ form, update, fieldErrors = {}, hiddenFields = [], onToggle }) => {
  const fileInputRef              = useRef({});
  const [uploading, setUploading] = useState({});

  const handleFileSelect = async (imgId, file) => {
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setUploading(prev => ({ ...prev, [imgId]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await adminApiRequest('/api/upload', { method: 'POST', body: formData });
      updateImage(imgId, data.url);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [imgId]: false }));
    }
  };

  // ── Images ──────────────────────────────────────────────────────────
  const addImage = () => {
    if (form.images.length >= MAX_IMAGES) return;
    update('images', [...form.images, { id: Date.now(), url: '' }]);
  };
  const removeImage = (id) => {
    const img = form.images.find(i => i.id === id);
    if (img && img.url === form.thumbnail) update('thumbnail', '');
    update('images', form.images.filter(i => i.id !== id));
  };
  const updateImage = (id, val) =>
    update('images', form.images.map(img => img.id === id ? { ...img, url: val } : img));
  const setThumbnail = (url) =>
    update('thumbnail', form.thumbnail === url ? '' : url);

  // ── Milestones ──────────────────────────────────────────────────────
  const addMilestone = () =>
    update('milestones', [...form.milestones, { id: Date.now(), date: '', title: '', description: '' }]);
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
            <FieldToggle fieldKey="images" hiddenFields={hiddenFields} onToggle={onToggle} />
          </div>
        </div>

        {form.thumbnail && (
          <p className="text-[10px] text-amber-600 font-semibold mb-2 flex items-center gap-1">
            <SafeIcon icon="FiStar" className="text-xs" /> Thumbnail set — shown as the report card image on the portal
          </p>
        )}
        <div className="space-y-2">
          {form.images.map((img, idx) => {
            const isThumbnail = img.url.trim() && img.url === form.thumbnail;
            return (
              <div key={img.id} className={`flex items-center gap-3 rounded-xl transition-colors ${isThumbnail ? 'bg-amber-50 ring-1 ring-amber-300 px-2 -mx-2' : ''}`}>
                {/* Image preview */}
                <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {img.url.trim() ? (
                    <img src={img.url} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                  ) : (
                    <SafeIcon icon="FiImage" className="text-gray-400 text-sm" />
                  )}
                </div>

                {/* URL input */}
                <Input
                  placeholder={`Image ${idx + 1} URL (paste or upload →)`}
                  value={img.url}
                  onChange={e => updateImage(img.id, e.target.value)}
                  className="flex-1"
                />

                {/* Set as thumbnail */}
                <button
                  type="button"
                  onClick={() => img.url.trim() && setThumbnail(img.url)}
                  disabled={!img.url.trim()}
                  title={isThumbnail ? 'Remove as thumbnail' : 'Set as report thumbnail'}
                  className={`w-10 h-10 flex items-center justify-center border rounded-xl transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed ${isThumbnail ? 'bg-amber-50 border-amber-300 text-amber-500' : 'bg-white border-gray-200 text-gray-400 hover:text-amber-500 hover:border-amber-300'}`}
                >
                  <SafeIcon icon={isThumbnail ? 'FiStar' : 'FiBookmark'} className="text-sm" />
                </button>

                {/* Upload from device */}
                <input
                  ref={el => fileInputRef.current[img.id] = el}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={e => handleFileSelect(img.id, e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current[img.id]?.click()}
                  disabled={uploading[img.id]}
                  title={`Upload image (max ${MAX_SIZE_MB} MB)`}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#E52321] border border-gray-200 rounded-xl bg-white transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  {uploading[img.id]
                    ? <div className="w-4 h-4 border-2 border-[#E52321] border-t-transparent rounded-full animate-spin" />
                    : <SafeIcon icon="FiUpload" className="text-sm" />
                  }
                </button>

                {/* Delete row */}
                <button
                  onClick={() => removeImage(img.id)}
                  disabled={form.images.length === 1}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#E52321] border border-gray-200 rounded-xl bg-white transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <SafeIcon icon="FiTrash2" className="text-sm" />
                </button>
              </div>
            );
          })}
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
        rightLabel={<FieldToggle fieldKey="videoUrl" hiddenFields={hiddenFields} onToggle={onToggle} />}
      />

      {/* ── Milestones ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Project Milestones <span className="text-[#E52321]">*</span>
          </p>
          <div className="flex items-center gap-3">
            {fieldErrors.milestones && (
              <p className="text-xs text-red-500 font-medium">{fieldErrors.milestones}</p>
            )}
            <FieldToggle fieldKey="milestones" hiddenFields={hiddenFields} onToggle={onToggle} />
          </div>
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
              <RichTextEditor
                placeholder="Milestone notes..."
                value={m.description}
                onChange={val => updateMilestone(m.id, 'description', val)}
                minHeight={80}
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
