import mongoose from 'mongoose';

const deliverableSchema = new mongoose.Schema(
  {
    label:       { type: String, default: '' },
    count:       { type: Number, default: 0 },
    icon:        { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    country: { type: String, default: '' },
    address: { type: String, default: '' },
    lat:     { type: String, default: '' },
    lng:     { type: String, default: '' },
  },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema(
  { date: String, title: String, description: String },
  { _id: false }
);

const testimonialSchema = new mongoose.Schema(
  {
    title:       { type: String, default: '' },
    body:        { type: String, default: '' },
    clientImage: { type: String, default: '' },
    name:        { type: String, default: '' },
    designation: { type: String, default: '' },
    address:     { type: String, default: '' },
  },
  { _id: false }
);

const demographicSchema = new mongoose.Schema(
  {
    label:      { type: String, default: '' },
    percentage: { type: Number, default: null },
    icon:       { type: String, default: '' },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    projectName:       { type: String, required: true, trim: true },
    slug:              { type: String, default: '', index: true },
    projectId:         { type: String, default: '' },
    assignedTo:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
    approvalAssignedTo:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
    createdBy:           { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    status:              { type: String, enum: ['pending', 'draft', 'published', 'pending_approval', 'trash'], default: 'pending' },

    // General step
    actualProjectId:   { type: String, default: '' },
    shortSubtitle:     { type: String, default: '' },
    donationUrl:       { type: String, default: '' },
    ctaTitle:          { type: String, default: 'Support This Mission' },
    ctaDescription:    { type: String, default: 'Your partnership allows our teams to remain on the ground and expand our reach to those who need it most.' },
    ctaButtonText:     { type: String, default: 'Donate Now' },
    cost:              { type: Number, default: 0 },
    programLead:          { type: String, default: '' },
    implementingPartner:  { type: String, default: '' },
    partnerOrganizations: { type: String, default: '' },
    reportingPeriod:   { type: String, default: String(new Date().getFullYear()) },
    region:            { type: String, default: '' },
    sector:            { type: [String], default: [] },
    livesImpacted:     { type: Number, default: 0 },

    // Narrative step
    projectBackground: { type: String, default: '' },
    strategicResponse: { type: String, default: '' },
    testimonialsTitle: { type: String, default: 'Testimonial' },
    testimonials:      { type: [testimonialSchema], default: [] },

    // Metrics step
    demographicsTitle: { type: String, default: 'Recipient Demographics' },
    demographics:      { type: [demographicSchema], default: [] },
    deliverables:      { type: [deliverableSchema], default: [] },

    // Media & Timeline step
    images:            { type: [{ url: { type: String, default: '' } }], default: [], _id: false },
    thumbnail:         { type: String, default: '' },
    videoUrl:          { type: String, default: '' },
    milestones:        { type: [milestoneSchema], default: [] },

    // Country & Location step
    countries:         [{ type: String }],
    locations:         { type: [locationSchema], default: [] },

    // Completed step tracking
    stepsCompleted:    [{ type: String, enum: ['general', 'narrative', 'metrics', 'media', 'location'] }],

    // Field visibility — keys in this array are hidden on the public report page
    hiddenFields:      [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema);
