import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema({
  key:           { type: String, default: 'platform', unique: true },
  defaultRegion: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('PlatformSettings', platformSettingsSchema);
