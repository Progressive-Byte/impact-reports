import { Input } from './FormField';
import CustomSelect from './CustomSelect';
import MultiSelect from './MultiSelect';

const FISCAL_YEARS = ['FY23', 'FY24', 'FY25', 'FY26'].map(v => ({ value: v, label: v }));

const GeneralTab = ({ form, update, adminOptions = [], regionOptions = [], isSuperAdmin = true, fieldErrors = {} }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-5">
      <Input
        label="Project Name" required
        placeholder="e.g. Winter Relief Alpha"
        value={form.projectName}
        onChange={e => update('projectName', e.target.value)}
        readOnly={!isSuperAdmin}
        error={fieldErrors.projectName}
      />
      <MultiSelect
        label="Assigned To" required
        value={form.assignedTo}
        onChange={val => update('assignedTo', val)}
        options={adminOptions}
        placeholder="Select team members..."
        readOnly={!isSuperAdmin}
        error={fieldErrors.assignedTo}
      />
    </div>
    <div className="grid grid-cols-2 gap-5">
      <Input
        label="Project Lead" required
        placeholder="Lead name"
        value={form.projectLead}
        onChange={e => update('projectLead', e.target.value)}
        error={fieldErrors.projectLead}
      />
      <CustomSelect
        label="Fiscal Year" required
        value={form.fiscalYear}
        onChange={val => update('fiscalYear', val)}
        options={FISCAL_YEARS}
      />
    </div>
    <div className="grid grid-cols-2 gap-5">
      <CustomSelect
        label="Region" required
        value={form.region}
        onChange={val => update('region', val)}
        options={regionOptions}
        placeholder={regionOptions.length ? 'Select region...' : 'Loading…'}
        error={fieldErrors.region}
      />
      <Input
        label="Sector" required
        placeholder="e.g. WASH, Education, Healthcare"
        value={form.sector}
        onChange={e => update('sector', e.target.value)}
        error={fieldErrors.sector}
      />
    </div>
    <div className="grid grid-cols-1 gap-5">
      <Input
        label="Lives Impacted" required
        type="number"
        min="1"
        value={form.livesImpacted}
        onChange={e => update('livesImpacted', e.target.value)}
        error={fieldErrors.livesImpacted}
      />
    </div>
  </div>
);

export default GeneralTab;
