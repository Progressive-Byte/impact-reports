import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema({
  key:                    { type: String,  default: 'platform', unique: true },
  defaultRegion:          { type: String,  default: '' },
  sessionTimeoutMinutes:  { type: Number,  default: 30 },
  enforceStrongPasswords: { type: Boolean, default: false },
  failedLoginWarnings:    { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('PlatformSettings', platformSettingsSchema);
