import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  age: Number,
  income: Number,
  occupation: { type: String, default: 'student' },
  gender: { type: String, default: 'female' },
  language: { type: String, enum: ['en', 'hi'], default: 'en' },
}, { timestamps: true });
export default mongoose.model('User', userSchema);
