import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq:  { type: Number, default: 0 },
});

/**
 * Atomically increments the named counter and returns the new value.
 */
counterSchema.statics.next = async function (name) {
  const doc = await this.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
};

export default mongoose.model('Counter', counterSchema);
