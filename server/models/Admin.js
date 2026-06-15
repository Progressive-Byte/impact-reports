import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role:     { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
    region:   { type: String, default: 'global' },
    isActive:           { type: Boolean, default: true },
    lastLogin:          { type: Date },
    failedLoginAttempts:{ type: Number, default: 0 },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.methods.toSafeObject = function () {
  const { password, __v, ...rest } = this.toObject();
  return rest;
};

export default mongoose.model('Admin', adminSchema);
