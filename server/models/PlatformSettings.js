import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema({
  key:                    { type: String,  default: 'platform', unique: true },
  defaultRegion:          { type: String,  default: '' },
  sessionTimeoutMinutes:  { type: Number,  default: 30 },
  enforceStrongPasswords: { type: Boolean, default: false },
  failedLoginWarnings:    { type: Boolean, default: true },
  weeklyDigest:           { type: Boolean, default: false },
  require2fa:             { type: Boolean, default: false },
  regions:                { type: [String], default: [] },
  sectors:                { type: [String], default: [] },
  departments:            { type: [String], default: [] },
  socialLinks: {
    facebook:  { type: String, default: '' },
    twitter:   { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin:  { type: String, default: '' },
    youtube:   { type: String, default: '' },
  },
  socialLinksVisible: {
    facebook:  { type: Boolean, default: true },
    twitter:   { type: Boolean, default: true },
    instagram: { type: Boolean, default: true },
    linkedin:  { type: Boolean, default: true },
    youtube:   { type: Boolean, default: true },
  },
}, { timestamps: true });

export default mongoose.model('PlatformSettings', platformSettingsSchema);
