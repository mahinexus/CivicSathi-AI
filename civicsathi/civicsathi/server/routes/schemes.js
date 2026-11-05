import { Router } from 'express';
import Scheme from '../models/Scheme.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { matchSchemes } from '../services/eligibility.js';
import { guidance } from '../services/ai.js';

const r = Router();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Smart search + category filter
r.get('/', async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const f = {};
    if (category && category !== 'All') f.category = String(category);
    if (q) { const rx = new RegExp(esc(String(q)), 'i'); f.$or = [{ name: rx }, { nameHi: rx }, { description: rx }, { category: rx }]; }
    res.json(await Scheme.find(f).sort({ name: 1 }));
  } catch (e) { next(e); }
});

// Eligibility checker
r.post('/eligibility', async (req, res, next) => {
  try { res.json(matchSchemes(req.body, await Scheme.find())); } catch (e) { next(e); }
});

// Personalised recommendations from the saved profile
r.get('/recommend', auth, async (req, res, next) => {
  try { res.json(matchSchemes(await User.findById(req.userId), await Scheme.find())); } catch (e) { next(e); }
});

// Application guidance: Gemini, with stored steps as fallback
r.get('/:id/guidance', async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    try { res.json({ text: await guidance({ scheme, lang: req.query.lang }), source: 'ai' }); }
    catch { res.json({ text: scheme.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'), source: 'stored' }); }
  } catch (e) { next(e); }
});
export default r;
