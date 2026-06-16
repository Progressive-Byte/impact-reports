import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  type:     { type: String, enum: ['login', 'logout'], required: true },
  username: { type: String, required: true },
  role:     { type: String },
  ip:       { type: String },
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
