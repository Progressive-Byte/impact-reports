import { Input, Select } from './FormField';

const ASSIGNED_OPTIONS = [
  { value: '', label: 'Select an option...' },
  { value: 'marcus', label: 'Marcus Chen' },
  { value: 'sarah', label: 'Sarah Ahmad' },
  { value: 'ali', label: 'Ali Hassan' },
];
const FISCAL_YEARS = ['FY23', 'FY24', 'FY25', 'FY26'].map(v => ({ value: v, label: v }));
const STATUSES = ['Draft', 'Review', 'Published', 'Archived'].map(v => ({ value: v, label: v }));

const GeneralTab = ({ form, update }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-5">
      <Input
        label="Project Name" required
        placeholder="e.g. Winter Relief Alpha"
        value={form.projectName}
        onChange={e => update('projectName', e.target.value)}
      />
      <Select
        label="Assigned To" required
        value={form.assignedTo}
        onChange={e => update('assignedTo', e.target.value)}
        options={ASSIGNED_OPTIONS}
      />
    </div>
    <div className="grid grid-cols-2 gap-5">
      <Input
        label="Project Lead"
        placeholder="Lead name"
        value={form.projectLead}
        onChange={e => update('projectLead', e.target.value)}
      />
      <Select
        label="Fiscal Year"
        value={form.fiscalYear}
        onChange={e => update('fiscalYear', e.target.value)}
        options={FISCAL_YEARS}
      />
    </div>
    <div className="grid grid-cols-2 gap-5">
      <Input
        label="Lives Impacted"
        type="number"
        value={form.livesImpacted}
        onChange={e => update('livesImpacted', e.target.value)}
      />
      <Select
        label="Status"
        value={form.status}
        onChange={e => update('status', e.target.value)}
        options={STATUSES}
      />
    </div>
  </div>
);

export default GeneralTab;
