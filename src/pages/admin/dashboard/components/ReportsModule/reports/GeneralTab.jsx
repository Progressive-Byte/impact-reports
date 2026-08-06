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

      {/* Row 2: Project Name | Program Lead */}
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
          label="Program Lead" required
          placeholder="Lead name"
          value={form.programLead}
          onChange={e => update('programLead', e.target.value)}
          error={fieldErrors.programLead}
          rightLabel={toggle('programLead')}
        />
      </div>

      {/* Row 2b: Implementing Partner | Partner Organization(s) */}
      <div className="grid grid-cols-2 gap-5">
        <Input
          label="Implementing Partner" required
          placeholder="Partner organization name"
          value={form.implementingPartner}
          onChange={e => update('implementingPartner', e.target.value)}
          error={fieldErrors.implementingPartner}
          rightLabel={toggle('implementingPartner')}
        />
        <Input
          label="Partner Organization(s)"
          placeholder="e.g. Red Crescent, WFP, local NGOs..."
          value={form.partnerOrganizations}
          onChange={e => update('partnerOrganizations', e.target.value)}
          error={fieldErrors.partnerOrganizations}
          rightLabel={toggle('partnerOrganizations')}
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

      {/* Row 4: Reporting Period — full width */}
      <ReportingPeriodField
        label="Reporting Period" required
        value={form.reportingPeriod}
        onChange={val => update('reportingPeriod', val)}
        error={fieldErrors.reportingPeriod}
        rightLabel={toggle('reportingPeriod')}
      />

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
        <MultiSelect
          label="Sector" required
          value={form.sector}
          onChange={val => update('sector', val)}
          options={sectorOptions}
          placeholder={sectorOptions.length ? 'Select sectors...' : 'Loading…'}
          error={fieldErrors.sector}
          rightLabel={toggle('sector')}
        />
      </div>

      {/* Row 6: Lives Impacted | Cost */}
      <div className="grid grid-cols-2 gap-5">
        <Input
          label="Lives Impacted" required
          type="number"
          min="1"
          value={form.livesImpacted}
          onChange={e => update('livesImpacted', e.target.value)}
          error={fieldErrors.livesImpacted}
          rightLabel={toggle('livesImpacted')}
        />
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
