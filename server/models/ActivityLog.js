import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  type:       { type: String, enum: ['login', 'logout', 'purge'], required: true },
  username:   { type: String, required: true },
  role:       { type: String },
  ip:         { type: String },
  details:    { type: String, default: '' },
  archivedAt: { type: Date, default: null },
}, { timestamps: true });

// Primary display query: live records in the last 30 days
activityLogSchema.index({ archivedAt: 1, createdAt: -1 });
// Archival cron query: find old live records by age
activityLogSchema.index({ createdAt: 1 });

export default mongoose.model('ActivityLog', activityLogSchema);
