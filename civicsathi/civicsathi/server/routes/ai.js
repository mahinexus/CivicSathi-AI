import { Router } from 'express';
import multer from 'multer';
import Scheme from '../models/Scheme.js';
import { auth } from '../middleware/auth.js';
import { chat, scanDocument } from '../services/ai.js';

const r = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(file.mimetype) ? null : new Error('Upload a JPG, PNG, WebP or PDF file.'), true),
});
const fail = (e, msg) => (e.status ? e : Object.assign(e, { status: 502, message: msg }));

r.post('/chat', async (req, res, next) => {
  try {
    const { message, history, lang } = req.body;
    if (!message || message.length > 800) return res.status(400).json({ error: 'Message is empty or too long.' });
    res.json({ reply: await chat({ message, history, lang, schemes: await Scheme.find().lean() }) });
  } catch (e) { next(fail(e, 'The AI assistant is unavailable. Please try again.')); }
});

r.post('/scan', auth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    res.json(await scanDocument({ buffer: req.file.buffer, mimeType: req.file.mimetype, expected: req.body.expected }));
  } catch (e) { next(fail(e, 'Scan failed. Try a clearer photo.')); }
});
export default r;
