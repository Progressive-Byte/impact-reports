import RichTextEditor from '@/common/RichTextEditor';
import TestimonialsSection from './TestimonialsSection';
import FieldToggle from './FieldToggle';
import SafeIcon from '../../../../../../common/SafeIcon';
import { Input } from './FormField';

const NarrativeTab = ({ form, update, fieldErrors = {}, hiddenFields = [], onToggle }) => {
  const toggle = (key) => <FieldToggle fieldKey={key} hiddenFields={hiddenFields} onToggle={onToggle} />;

  return (
    <div className="space-y-5">
      <RichTextEditor
        label="Project Background" required
        placeholder="Describe the crisis context..."
        value={form.projectBackground}
        onChange={val => update('projectBackground', val)}
        error={fieldErrors.projectBackground}
        minHeight={150}
        rightLabel={toggle('projectBackground')}
      />
      <RichTextEditor
        label="Strategic Response" required
        placeholder="Outline the response operations..."
        value={form.strategicResponse}
        onChange={val => update('strategicResponse', val)}
        error={fieldErrors.strategicResponse}
        minHeight={150}
        rightLabel={toggle('strategicResponse')}
      />

      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Testimonials</p>
          {toggle('testimonials')}
        </div>
        <Input
          placeholder="Section title (e.g. Testimonial)"
          value={form.testimonialsTitle}
          onChange={e => update('testimonialsTitle', e.target.value)}
          className="mb-4"
        />
        <TestimonialsSection form={form} update={update} />
      </div>
    </div>
  );
};

export default NarrativeTab;
