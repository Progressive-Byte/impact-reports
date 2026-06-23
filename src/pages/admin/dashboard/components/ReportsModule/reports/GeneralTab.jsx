import { Input } from './FormField';
import CustomSelect from './CustomSelect';
import MultiSelect from './MultiSelect';

const GeneralTab = ({ form, update, adminOptions = [], regionOptions = [], sectorOptions = [], isSuperAdmin = true, fieldErrors = {} }) => (
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
      <Input
        label="Fiscal Year" required
        placeholder="e.g. FY26"
        value={form.fiscalYear}
        onChange={e => update('fiscalYear', e.target.value)}
        error={fieldErrors.fiscalYear}
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
      <CustomSelect
        label="Sector" required
        value={form.sector}
        onChange={val => update('sector', val)}
        options={sectorOptions}
        placeholder={sectorOptions.length ? 'Select sector...' : 'Loading…'}
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
