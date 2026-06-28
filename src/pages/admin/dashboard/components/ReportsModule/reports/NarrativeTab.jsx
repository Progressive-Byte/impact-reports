import RichTextEditor from '@/common/RichTextEditor';
import TestimonialsSection from './TestimonialsSection';

const NarrativeTab = ({ form, update, fieldErrors = {} }) => (
  <div className="space-y-5">
    <RichTextEditor
      label="Project Background" required
      placeholder="Describe the crisis context..."
      value={form.projectBackground}
      onChange={val => update('projectBackground', val)}
      error={fieldErrors.projectBackground}
      minHeight={150}
    />
    <RichTextEditor
      label="Strategic Response" required
      placeholder="Outline the response operations..."
      value={form.strategicResponse}
      onChange={val => update('strategicResponse', val)}
      error={fieldErrors.strategicResponse}
      minHeight={150}
    />

    <div className="pt-2 border-t border-gray-100">
      <TestimonialsSection form={form} update={update} />
    </div>
  </div>
);

export default NarrativeTab;
