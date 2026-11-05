import mongoose from 'mongoose';
const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameHi: String,
  category: { type: String, index: true },
  description: String,
  minAge: { type: Number, default: 0 },
  maxAge: { type: Number, default: 99 },
  maxIncome: { type: Number, default: 1e10 },
  occupations: { type: [String], default: ['any'] },
  gender: String,
  documents: [String],
  steps: [String],
  officialUrl: String,
});
export default mongoose.model('Scheme', schemeSchema);
