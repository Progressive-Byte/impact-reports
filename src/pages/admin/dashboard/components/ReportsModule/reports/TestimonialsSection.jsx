import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import SafeIcon from '../../../../../../common/SafeIcon';
import { Input } from './FormField';
import RichTextEditor from '@/common/RichTextEditor';
import { adminApiRequest } from '../../../../../../services/adminApi';

const MAX_SIZE_MB = 2;
const MAX_STARS   = 5;

const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: MAX_STARS }).map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i + 1)}
        className="transition-transform hover:scale-110"
      >
        <SafeIcon
          icon="FiStar"
          className={`text-xl transition-colors ${i < value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
        />
      </button>
    ))}
    <span className="ml-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {value} / {MAX_STARS}
    </span>
  </div>
);

const TestimonialsSection = ({ form, update }) => {
  const fileInputRefs = useRef({});
  const [uploading, setUploading] = useState({});

  const add = () =>
    update('testimonials', [
      ...form.testimonials,
      { id: Date.now(), stars: 5, body: '', clientImage: '', name: '', designation: '', address: '' },
    ]);

  const remove = (id) =>
    update('testimonials', form.testimonials.filter(t => t.id !== id));

  const set = (id, key, val) =>
    update('testimonials', form.testimonials.map(t => t.id === id ? { ...t, [key]: val } : t));

  const handleUpload = async (id, file) => {
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_SIZE_MB} MB.`);
      return;
    }
    setUploading(prev => ({ ...prev, [id]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await adminApiRequest('/api/upload', { method: 'POST', body: formData });
      set(id, 'clientImage', data.url);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
        Testimonials
      </p>

      <div className="space-y-4">
        {form.testimonials.map((t, idx) => (
          <div key={t.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-4">

            {/* Star rating + index + remove */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  #{idx + 1}
                </span>
                <StarPicker value={t.stars} onChange={val => set(t.id, 'stars', val)} />
              </div>
              <button
                onClick={() => remove(t.id)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#E52321] border border-gray-200 rounded-lg bg-white transition-colors"
              >
                <SafeIcon icon="FiTrash2" className="text-sm" />
              </button>
            </div>

            {/* Body (rich text) */}
            <RichTextEditor
              placeholder="Testimonial quote..."
              value={t.body}
              onChange={val => set(t.id, 'body', val)}
              minHeight={80}
            />

            {/* Client image */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {t.clientImage ? (
                  <img src={t.clientImage} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <SafeIcon icon="FiUser" className="text-gray-400 text-sm" />
                )}
              </div>
              <Input
                placeholder="Client image URL (paste or upload →)"
                value={t.clientImage}
                onChange={e => set(t.id, 'clientImage', e.target.value)}
                className="flex-1"
              />
              <input
                ref={el => fileInputRefs.current[t.id] = el}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={e => handleUpload(t.id, e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => fileInputRefs.current[t.id]?.click()}
                disabled={uploading[t.id]}
                title={`Upload image (max ${MAX_SIZE_MB} MB)`}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#E52321] border border-gray-200 rounded-xl bg-white transition-colors flex-shrink-0 disabled:opacity-50"
              >
                {uploading[t.id]
                  ? <div className="w-4 h-4 border-2 border-[#E52321] border-t-transparent rounded-full animate-spin" />
                  : <SafeIcon icon="FiUpload" className="text-sm" />
                }
              </button>
            </div>

            {/* Name / Designation / Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Name"
                value={t.name}
                onChange={e => set(t.id, 'name', e.target.value)}
              />
              <Input
                placeholder="Designation"
                value={t.designation}
                onChange={e => set(t.id, 'designation', e.target.value)}
              />
              <Input
                placeholder="Address"
                value={t.address}
                onChange={e => set(t.id, 'address', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-3 w-full border border-dashed border-gray-200 rounded-xl py-3 text-sm text-[#76767e] font-semibold hover:bg-red-50 hover:border-[#E52321] hover:text-[#E52321] transition-colors flex items-center justify-center gap-2"
      >
        <SafeIcon icon="FiPlus" className="text-sm" />
        Add Testimonial
      </button>
    </div>
  );
};

export default TestimonialsSection;
