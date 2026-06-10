import { Textarea } from './FormField';

const NarrativeTab = ({ form, update, fieldErrors = {} }) => (
  <div className="space-y-5">
    <Textarea
      label="Project Background" required rows={6}
      placeholder="Describe the crisis context..."
      value={form.projectBackground}
      onChange={e => update('projectBackground', e.target.value)}
      error={fieldErrors.projectBackground}
    />
    <Textarea
      label="Strategic Response" required rows={6}
      placeholder="Outline the response operations..."
      value={form.strategicResponse}
      onChange={e => update('strategicResponse', e.target.value)}
      error={fieldErrors.strategicResponse}
    />
  </div>
);

export default NarrativeTab;
