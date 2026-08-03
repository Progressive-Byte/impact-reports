import { Input, Textarea } from './FormField';
import CustomSelect from './CustomSelect';
import MultiSelect from './MultiSelect';
import FieldToggle from './FieldToggle';
import ReportingPeriodField from './ReportingPeriodField';

const GeneralTab = ({ form, update, adminOptions = [], allAdminOptions = [], regionOptions = [], sectorOptions = [], isSuperAdmin = true, fieldErrors = {}, hiddenFields = [], onToggle }) => {
  const toggle = (key) => <FieldToggle fieldKey={key} hiddenFields={hiddenFields} onToggle={onToggle} />;

  return (
    <div className="space-y-5">

      {/* Row 1: Actual Project ID | Donation URL */}
      <div className="grid grid-cols-2 gap-5">
        <Input
          label="Actual Project ID"
          placeholder="e.g. Burma Water 1001"
          value={form.actualProjectId}
          onChange={e => update('actualProjectId', e.target.value)}
          rightLabel={toggle('actualProjectId')}
        />
        <Input
          label="Donation URL"
          placeholder="https://donate.example.com/project"
          value={form.donationUrl}
          onChange={e => update('donationUrl', e.target.value)}
          rightLabel={toggle('donationUrl')}
        />
      </div>

      {/* Row 2: Project Name | Project Lead/Partner */}
      <div className="grid grid-cols-2 gap-5">
        <Input
          label="Project Name" required
          placeholder="e.g. Winter Relief Alpha"
          value={form.projectName}
          onChange={e => update('projectName', e.target.value)}
          readOnly={!isSuperAdmin}
          error={fieldErrors.projectName}
        />
        <Input
          label="Project Lead/Partner" required
          placeholder="Lead name"
          value={form.projectLead}
          onChange={e => update('projectLead', e.target.value)}
          error={fieldErrors.projectLead}
          rightLabel={toggle('projectLead')}
        />
      </div>

      {/* Short Subtitle — full width */}
      <Textarea
        label="Short Subtitle"
        placeholder="Brief description shown on the report card and hero section..."
        rows={2}
        value={form.shortSubtitle}
        onChange={e => update('shortSubtitle', e.target.value)}
        rightLabel={toggle('shortSubtitle')}
      />

      {/* Row 3: Assigned To | Approval Reviewer */}
      <div className={`grid gap-5 ${isSuperAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <MultiSelect
          label="Assigned To" required
          value={form.assignedTo}
          onChange={val => update('assignedTo', val)}
          options={adminOptions}
          placeholder="Select team members..."
          readOnly={!isSuperAdmin}
          error={fieldErrors.assignedTo}
        />
        {isSuperAdmin && (
          <MultiSelect
            label="Approval Reviewer" required
            value={form.approvalAssignedTo}
            onChange={val => update('approvalAssignedTo', val)}
            options={allAdminOptions}
            placeholder="Select approval reviewers..."
            error={fieldErrors.approvalAssignedTo}
          />
        )}
      </div>

      {/* Row 4: Fiscal Year | Lives Impacted */}
      <div className="grid grid-cols-2 gap-5">
        <Input
          label="Fiscal Year" required
          placeholder="e.g. FY26"
          value={form.fiscalYear}
          onChange={e => update('fiscalYear', e.target.value)}
          error={fieldErrors.fiscalYear}
          rightLabel={toggle('fiscalYear')}
        />
        <Input
          label="Lives Impacted" required
          type="number"
          min="1"
          value={form.livesImpacted}
          onChange={e => update('livesImpacted', e.target.value)}
          error={fieldErrors.livesImpacted}
          rightLabel={toggle('livesImpacted')}
        />
      </div>

      {/* Row 5: Region | Sector */}
      <div className="grid grid-cols-2 gap-5">
        <CustomSelect
          label="Region" required
          value={form.region}
          onChange={val => update('region', val)}
          options={regionOptions}
          placeholder={regionOptions.length ? 'Select region...' : 'Loading…'}
          error={fieldErrors.region}
          rightLabel={toggle('region')}
        />
        <CustomSelect
          label="Sector" required
          value={form.sector}
          onChange={val => update('sector', val)}
          options={sectorOptions}
          placeholder={sectorOptions.length ? 'Select sector...' : 'Loading…'}
          error={fieldErrors.sector}
          rightLabel={toggle('sector')}
        />
      </div>

      {/* Row 6: Cost */}
      <div className="grid grid-cols-2 gap-5">
        <Input
          label="Cost"
          type="number"
          min="0"
          placeholder="0"
          value={form.cost}
          onChange={e => update('cost', e.target.value)}
          rightLabel={toggle('cost')}
        />
      </div>

    </div>
  );
};

export default GeneralTab;
