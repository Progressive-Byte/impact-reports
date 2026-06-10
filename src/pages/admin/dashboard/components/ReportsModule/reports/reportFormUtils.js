export const BLANK_FORM = {
  projectName:       '',
  assignedTo:        [],
  projectLead:       '',
  fiscalYear:        'FY25',
  livesImpacted:     0,
  projectBackground: '',
  strategicResponse: '',
  children:          0,
  women:             0,
  men:               0,
  deliverables:      [{ id: 1, label: '', count: '', icon: '', description: '' }],
  images:            [{ id: 1, url: '' }],
  videoUrl:          '',
  milestones:        [{ id: 1, date: '', title: '', notes: '' }],
};

export const reportToForm = (report) => ({
  projectName:       report.projectName || '',
  assignedTo:        (report.assignedTo || []).map(a => String(a._id ?? a)),
  projectLead:       report.projectLead || '',
  fiscalYear:        report.fiscalYear || 'FY25',
  livesImpacted:     report.livesImpacted ?? 0,
  projectBackground: report.projectBackground || '',
  strategicResponse: report.strategicResponse || '',
  children:          report.children ?? 0,
  women:             report.women ?? 0,
  men:               report.men ?? 0,
  deliverables:      (report.deliverables || []).map((d, i) => ({
    id:          i + 1,
    label:       d.label       || '',
    count:       d.count       ?? '',
    icon:        d.icon        || '',
    description: d.description || '',
  })),
  images:            (report.images || []).map((img, i) => ({ id: i + 1, url: img.url || '' })),
  videoUrl:          report.videoUrl || '',
  milestones:        (report.milestones || []).map((m, i) => ({ ...m, id: i + 1 })),
});

export function validateStep(stepKey, form, isSuperAdmin = true) {
  const errors = {};

  switch (stepKey) {
    case 'general':
      if (isSuperAdmin) {
        if (!form.projectName.trim())   errors.projectName = 'Project name is required';
        if (!form.assignedTo.length)    errors.assignedTo  = 'At least one assignee is required';
      }
      if (!form.projectLead.trim())     errors.projectLead     = 'Project lead is required';
      if (!form.fiscalYear)             errors.fiscalYear      = 'Fiscal year is required';
      if (!form.livesImpacted || Number(form.livesImpacted) <= 0)
        errors.livesImpacted = 'Lives impacted must be greater than 0';
      break;

    case 'narrative':
      if (!form.projectBackground.trim()) errors.projectBackground = 'Project background is required';
      if (!form.strategicResponse.trim()) errors.strategicResponse  = 'Strategic response is required';
      break;

    case 'metrics': {
      const validDeliverables = form.deliverables.filter(d => d.label.trim() && Number(d.count) > 0);
      if (!validDeliverables.length) errors.deliverables = 'Add at least one deliverable with a label and count';
      break;
    }

    case 'media': {
      if (!form.galleryUrl.trim()) errors.galleryUrl = 'Gallery URL is required';
      const validMilestones = form.milestones.filter(m => m.date.trim() && m.title.trim());
      if (!validMilestones.length) errors.milestones = 'Add at least one milestone with a date and title';
      break;
    }

    default:
      break;
  }

  return errors;
}

export const buildStepPayload = {
  general:   (f) => ({
    projectName:   f.projectName,
    assignedTo:    f.assignedTo,
    projectLead:   f.projectLead,
    fiscalYear:    f.fiscalYear,
    livesImpacted: Number(f.livesImpacted) || 0,
  }),
  narrative: (f) => ({
    projectBackground: f.projectBackground,
    strategicResponse: f.strategicResponse,
  }),
  metrics:   (f) => ({
    children:     Number(f.children) || 0,
    women:        Number(f.women) || 0,
    men:          Number(f.men) || 0,
    deliverables: f.deliverables.map(({ label, count, icon, description }) => ({
      label,
      count:       Number(count) || 0,
      icon:        icon        || '',
      description: description || '',
    })),
  }),
  media:     (f) => ({
    galleryUrl: f.galleryUrl,
    milestones: f.milestones.map(({ date, title, notes }) => ({ date, title, notes })),
  }),
};
