import { Router } from 'express';
import Application, { STATUSES } from '../models/Application.js';
import Scheme from '../models/Scheme.js';
import { auth } from '../middleware/auth.js';
import { explainRejection } from '../services/ai.js';

const r = Router();
const newId = () => `CS${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

r.post('/', auth, async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.body.schemeId);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    const dup = await Application.findOne({ user: req.userId, scheme: scheme._id, status: { $ne: 'Rejected' } });
    if (dup) return res.status(409).json({ error: `You already applied. Application ID: ${dup.appId}` });
    for (let i = 0; i < 5; i++) {
      try {
        const a = await Application.create({ appId: newId(), user: req.userId, scheme: scheme._id, history: [{ status: 'Submitted' }] });
        return res.status(201).json(a);
      } catch (e) { if (e.code !== 11000) throw e; }
    }
    res.status(500).json({ error: 'Could not create an application ID. Try again.' });
  } catch (e) { next(e); }
});

r.get('/mine', auth, async (req, res, next) => {
  try { res.json(await Application.find({ user: req.userId }).populate('scheme', 'name').sort('-createdAt')); } catch (e) { next(e); }
});

// Public tracking by ID: returns no personal data
r.get('/track/:appId', async (req, res, next) => {
  try {
    const a = await Application.findOne({ appId: req.params.appId.trim().toUpperCase() }).populate('scheme', 'name');
    if (!a) return res.status(404).json({ error: 'No application found with this ID.' });
    res.json({ appId: a.appId, scheme: a.scheme?.name, status: a.status, rejectionReason: a.rejectionReason, history: a.history, updatedAt: a.updatedAt });
  } catch (e) { next(e); }
});

r.post('/:appId/explain', auth, async (req, res, next) => {
  try {
    const a = await Application.findOne({ appId: req.params.appId, user: req.userId }).populate('scheme');
    if (!a) return res.status(404).json({ error: 'Application not found.' });
    const reason = req.body.reason || a.rejectionReason;
    if (!reason) return res.status(400).json({ error: 'Enter the rejection reason from your notice.' });
    res.json({ text: await explainRejection({ scheme: a.scheme, reason, lang: req.body.lang }) });
  } catch (e) { next(e.status ? e : Object.assign(e, { status: 502, message: 'The AI assistant is unavailable. Please try again.' })); }
});

// Status updates come from officials / admin tooling, protected by ADMIN_KEY
r.patch('/:appId/status', async (req, res, next) => {
  try {
    if (!process.env.ADMIN_KEY || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(403).json({ error: 'Forbidden' });
    if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
    const a = await Application.findOne({ appId: req.params.appId });
    if (!a) return res.status(404).json({ error: 'Not found' });
    a.status = req.body.status;
    a.rejectionReason = req.body.status === 'Rejected' ? req.body.rejectionReason : undefined;
    a.history.push({ status: a.status });
    res.json(await a.save());
  } catch (e) { next(e); }
});
export default r;
