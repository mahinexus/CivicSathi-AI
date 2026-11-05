import mongoose from 'mongoose';
export const STATUSES = ['Submitted', 'Documents verified', 'Under review', 'Approved', 'Rejected'];
const appSchema = new mongoose.Schema({
  appId: { type: String, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
  status: { type: String, enum: STATUSES, default: 'Submitted' },
  rejectionReason: String,
  history: [{ status: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });
export default mongoose.model('Application', appSchema);
