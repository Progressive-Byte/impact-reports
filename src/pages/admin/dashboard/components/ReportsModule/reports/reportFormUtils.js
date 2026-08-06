export const BLANK_FORM = {
  projectName:         '',
  projectId:           '',
  status:              'pending',
  approvalAssignedTo:  [],
  actualProjectId:     '',
  shortSubtitle:     '',
  donationUrl:       '',
  ctaTitle:          'Support This Mission',
  ctaDescription:    'Your partnership allows our teams to remain on the ground and expand our reach to those who need it most.',
  ctaButtonText:     'Donate Now',
  cost:              0,
  assignedTo:        [],
  programLead:          '',
  implementingPartner:  '',
  partnerOrganizations: '',
  reportingPeriod:   String(new Date().getFullYear()),
  region:            '',
  sector:            [],
  livesImpacted:     0,
  projectBackground: '',
  strategicResponse: '',
  testimonials:      [],
  demographicsTitle: 'Recipient Demographics',
  demographics:      [],
  deliverables:      [{ id: 1, label: '', count: '', icon: '', description: '' }],
  images:            [{ id: 1, url: '' }],
  thumbnail:         '',
  videoUrl:          '',
  milestones:        [],
  countries:         [],
  locations:         [],
  hiddenFields:      [],
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
  shortSubtitle:     report.shortSubtitle   || '',
  donationUrl:       report.donationUrl     || '',
  cost:              report.cost            ?? 0,
  assignedTo:        (report.assignedTo || []).map(a => String(a._id ?? a)),
  programLead:          report.programLead          || '',
  implementingPartner:  report.implementingPartner  || '',
  partnerOrganizations: report.partnerOrganizations || '',
  reportingPeriod:   report.reportingPeriod || String(new Date().getFullYear()),
  region:            report.region      || defaultRegion,
  sector:            Array.isArray(report.sector) ? report.sector : (report.sector ? [report.sector] : []),
  livesImpacted:     report.livesImpacted ?? 0,
  projectBackground: report.projectBackground || '',
  strategicResponse: report.strategicResponse || '',
  testimonials: (report.testimonials || []).map((t, i) => ({
    id:          i + 1,
    title:       t.title       || '',
    body:        t.body        || '',
    clientImage: t.clientImage || '',
    name:        t.name        || '',
    designation: t.designation || '',
    address:     t.address     || '',
  })),
  demographicsTitle: report.demographicsTitle || 'Recipient Demographics',
  demographics: (report.demographics || []).map((d, i) => ({
    id:         i + 1,
    label:      d.label || '',
    percentage: d.percentage ?? '',
    icon:       d.icon  || '',
  })),
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
  hiddenFields:      report.hiddenFields || [],
});

export function validateStep(stepKey, form, isSuperAdmin = true) {
  const errors = {};

  switch (stepKey) {
    case 'general':
      if (isSuperAdmin) {
        if (!form.projectName.trim())        errors.projectName        = 'Project name is required';
        if (!form.assignedTo.length)         errors.assignedTo         = 'At least one assignee is required';
        if (!form.approvalAssignedTo.length) errors.approvalAssignedTo = 'At least one approval reviewer is required';
      }
      if (!form.programLead.trim())          errors.programLead         = 'Program lead is required';
      if (!form.implementingPartner.trim())  errors.implementingPartner = 'Implementing partner is required';
      if (!form.reportingPeriod)        errors.reportingPeriod = 'Reporting period is required';
      if (!form.region)                 errors.region          = 'Region is required';
      if (!form.sector.length)          errors.sector          = 'At least one sector is required';
      if (!form.livesImpacted || Number(form.livesImpacted) <= 0)
        errors.livesImpacted = 'Lives impacted must be greater than 0';
      break;

    case 'narrative':
      if (!form.projectBackground.trim()) errors.projectBackground = 'Project background is required';
      if (!form.strategicResponse.trim()) errors.strategicResponse  = 'Strategic response is required';
      break;

    case 'metrics': {
      const total = form.demographics.reduce((sum, d) => {
        if (d.percentage === '' || d.percentage === null || d.percentage === undefined) return sum;
        return sum + (Number(d.percentage) || 0);
      }, 0);
      if (total > 100) errors.demographics = 'Demographic percentages must not exceed 100%';
      const validDeliverables = form.deliverables.filter(d => d.label.trim() && Number(d.count) > 0);
      if (!validDeliverables.length) errors.deliverables = 'Add at least one deliverable with a label and count';
      break;
    }

    case 'media': {
      const validImages = form.images.filter(img => img.url.trim());
      if (!validImages.length)     errors.images = 'Add at least one image URL';
      if (validImages.length > 10) errors.images = 'Maximum 10 images allowed';
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
    projectName:        f.projectName,
    assignedTo:         f.assignedTo,
    approvalAssignedTo: f.approvalAssignedTo,
    actualProjectId:    f.actualProjectId || '',
    shortSubtitle:      f.shortSubtitle   || '',
    donationUrl:        f.donationUrl     || '',
    cost:               Number(f.cost) || 0,
    programLead:          f.programLead,
    implementingPartner:  f.implementingPartner,
    partnerOrganizations: f.partnerOrganizations || '',
    reportingPeriod:    f.reportingPeriod,
    region:             f.region,
    sector:             f.sector,
    livesImpacted:      Number(f.livesImpacted) || 0,
  }),
  narrative: (f) => ({
    projectBackground: f.projectBackground,
    strategicResponse: f.strategicResponse,
    testimonials: f.testimonials.map(({ title, body, clientImage, name, designation, address }) => ({
      title, body, clientImage, name, designation, address,
    })),
  }),
  metrics:   (f) => ({
    demographicsTitle: f.demographicsTitle.trim() || 'Recipient Demographics',
    demographics: f.demographics
      .filter(d => d.label.trim())
      .map(({ label, percentage, icon }) => ({
        label:      label.trim(),
        percentage: (percentage === '' || percentage === null || percentage === undefined) ? null : Number(percentage),
        icon:       icon || '',
      })),
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
    milestones: f.milestones
      .filter(m => m.date.trim() && m.title.trim())
      .map(({ date, title, description }) => ({ date, title, description })),
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
