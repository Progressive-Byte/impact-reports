import { Input } from './FormField';
import CustomSelect from './CustomSelect';

const ASSIGNED_OPTIONS = [
  { value: '',       label: 'Select an option...' },
  { value: 'marcus', label: 'Marcus Chen' },
  { value: 'aisha',  label: 'Aisha Khan' },
  { value: 'daniel', label: 'Daniel Park' },
  { value: 'sara',   label: 'Sara Ahmed' },
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
      <CustomSelect
        label="Assigned To" required
        value={form.assignedTo}
        onChange={val => update('assignedTo', val)}
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
      <CustomSelect
        label="Fiscal Year"
        value={form.fiscalYear}
        onChange={val => update('fiscalYear', val)}
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
      <CustomSelect
        label="Status"
        value={form.status}
        onChange={val => update('status', val)}
        options={STATUSES}
      />
    </div>
  </div>
);

export default GeneralTab;
