export const BLANK_FORM = {
  projectName:         '',
  projectId:           '',
  status:              'pending',
  approvalAssignedTo:  [],
  actualProjectId:     '',
  donationUrl:       '',
  cost:              0,
  assignedTo:        [],
  projectLead:       '',
  fiscalYear:        'FY25',
  region:            '',
  sector:            '',
  livesImpacted:     0,
  projectBackground: '',
  strategicResponse: '',
  testimonials:      [],
  children:          0,
  women:             0,
  men:               0,
  deliverables:      [{ id: 1, label: '', count: '', icon: '', description: '' }],
  images:            [{ id: 1, url: '' }],
  thumbnail:         '',
  videoUrl:          '',
  milestones:        [{ id: 1, date: '', title: '', description: '' }],
  countries:         [],
  locations:         [],
};

export const getBlankForm = (defaultRegion = '') => ({
  ...BLANK_FORM,
  region: defaultRegion,
});

export const reportToForm = (report, defaultRegion = '') => ({
  projectName:         report.projectName     || '',
  projectId:           report.projectId       || '',
  status:              report.status          || 'pending',
  approvalAssignedTo:  (report.approvalAssignedTo || []).map(a => String(a._id ?? a)),
  actualProjectId:     report.actualProjectId || '',
  donationUrl:       report.donationUrl     || '',
  cost:              report.cost            ?? 0,
  assignedTo:        (report.assignedTo || []).map(a => String(a._id ?? a)),
  projectLead:       report.projectLead || '',
  fiscalYear:        report.fiscalYear  || 'FY25',
  region:            report.region      || defaultRegion,
  sector:            report.sector      || '',
  livesImpacted:     report.livesImpacted ?? 0,
  projectBackground: report.projectBackground || '',
  strategicResponse: report.strategicResponse || '',
  testimonials: (report.testimonials || []).map((t, i) => ({
    id:          i + 1,
    stars:       t.stars       ?? 5,
    body:        t.body        || '',
    clientImage: t.clientImage || '',
    name:        t.name        || '',
    designation: t.designation || '',
    address:     t.address     || '',
  })),
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
  thumbnail:         report.thumbnail || '',
  videoUrl:          report.videoUrl || '',
  milestones:        (report.milestones || []).map((m, i) => ({ ...m, id: i + 1, description: m.description || m.notes || '' })),
  stepsCompleted:    report.stepsCompleted || [],
  countries:         report.countries || [],
  locations:         (report.locations || []).map((l, i) => ({
    id:      i + 1,
    country: l.country || '',
    address: l.address || '',
    lat:     l.lat     || '',
    lng:     l.lng     || '',
  })),
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
      if (!form.region)                 errors.region          = 'Region is required';
      if (!form.sector)                 errors.sector          = 'Sector is required';
      if (!form.livesImpacted || Number(form.livesImpacted) <= 0)
        errors.livesImpacted = 'Lives impacted must be greater than 0';
      break;

    case 'narrative':
      if (!form.projectBackground.trim()) errors.projectBackground = 'Project background is required';
      if (!form.strategicResponse.trim()) errors.strategicResponse  = 'Strategic response is required';
      break;

    case 'metrics': {
      const total = (Number(form.children) || 0) + (Number(form.women) || 0) + (Number(form.men) || 0);
      if (total > 100) errors.demographics = 'Children + Women + Men must not exceed 100%';
      const validDeliverables = form.deliverables.filter(d => d.label.trim() && Number(d.count) > 0);
      if (!validDeliverables.length) errors.deliverables = 'Add at least one deliverable with a label and count';
      break;
    }

    case 'media': {
      const validImages = form.images.filter(img => img.url.trim());
      if (!validImages.length)     errors.images = 'Add at least one image URL';
      if (validImages.length > 10) errors.images = 'Maximum 10 images allowed';
      const validMilestones = form.milestones.filter(m => m.date.trim() && m.title.trim());
      if (!validMilestones.length) errors.milestones = 'Add at least one milestone with a date and title';
      break;
    }

    case 'location': {
      if (!form.countries.length) {
        errors.countries = 'Select at least one country';
      } else {
        form.countries.forEach(country => {
          const hasLoc = form.locations.some(l => l.country === country && l.address.trim());
          if (!hasLoc) errors[`loc_${country}`] = 'Add at least one location';
        });
      }
      break;
    }

    default:
      break;
  }

  return errors;
}

export const buildStepPayload = {
  general:   (f) => ({
    projectName:     f.projectName,
    assignedTo:      f.assignedTo,
    actualProjectId: f.actualProjectId || '',
    donationUrl:     f.donationUrl     || '',
    cost:            Number(f.cost) || 0,
    projectLead:     f.projectLead,
    fiscalYear:      f.fiscalYear,
    region:          f.region,
    sector:          f.sector,
    livesImpacted:   Number(f.livesImpacted) || 0,
  }),
  narrative: (f) => ({
    projectBackground: f.projectBackground,
    strategicResponse: f.strategicResponse,
    testimonials: f.testimonials.map(({ stars, body, clientImage, name, designation, address }) => ({
      stars, body, clientImage, name, designation, address,
    })),
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
    images:     f.images.filter(img => img.url.trim()).map(({ url }) => ({ url })),
    thumbnail:  f.thumbnail || '',
    videoUrl:   f.videoUrl.trim(),
    milestones: f.milestones.map(({ date, title, description }) => ({ date, title, description })),
  }),
  location:  (f) => ({
    countries: f.countries,
    locations: f.locations
      .filter(l => l.address.trim())
      .map(({ country, address, lat, lng }) => ({
        country,
        address: address.trim(),
        lat:     lat || '',
        lng:     lng || '',
      })),
  }),
};
