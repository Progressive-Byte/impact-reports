import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema(
  {
    email:     { type: String, required: true, lowercase: true, trim: true },
    role:      { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
    region:    { type: String, default: 'global' },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Invite', inviteSchema);
