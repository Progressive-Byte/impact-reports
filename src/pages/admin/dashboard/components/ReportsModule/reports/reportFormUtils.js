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
  deliverables:      [{ id: 1, label: '', count: '' }],
  galleryUrl:        '',
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
  deliverables:      (report.deliverables || []).map((d, i) => ({ ...d, id: i + 1 })),
  galleryUrl:        report.galleryUrl || '',
  milestones:        (report.milestones || []).map((m, i) => ({ ...m, id: i + 1 })),
});

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
    deliverables: f.deliverables.map(({ label, count }) => ({ label, count: Number(count) || 0 })),
  }),
  media:     (f) => ({
    galleryUrl: f.galleryUrl,
    milestones: f.milestones.map(({ date, title, notes }) => ({ date, title, notes })),
  }),
};
