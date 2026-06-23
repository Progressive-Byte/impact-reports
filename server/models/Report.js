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

const reportSchema = new mongoose.Schema(
  {
    projectName:       { type: String, required: true, trim: true },
    slug:              { type: String, default: '', index: true },
    projectId:         { type: String, default: '' },
    assignedTo:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
    createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    status:            { type: String, enum: ['pending', 'draft', 'published'], default: 'pending' },

    // General step
    actualProjectId:   { type: String, default: '' },
    cost:              { type: Number, default: 0 },
    projectLead:       { type: String, default: '' },
    fiscalYear:        { type: String, default: 'FY25' },
    region:            { type: String, default: '' },
    sector:            { type: String, default: '' },
    livesImpacted:     { type: Number, default: 0 },

    // Narrative step
    projectBackground: { type: String, default: '' },
    strategicResponse: { type: String, default: '' },

    // Metrics step
    children:          { type: Number, default: 0 },
    women:             { type: Number, default: 0 },
    men:               { type: Number, default: 0 },
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
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema);
