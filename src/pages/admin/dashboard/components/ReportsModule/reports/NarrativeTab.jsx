import RichTextEditor from '@/common/RichTextEditor';

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
  </div>
);

export default NarrativeTab;
