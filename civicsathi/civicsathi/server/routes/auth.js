import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const r = Router();
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, age: u.age, income: u.income, occupation: u.occupation, gender: u.gender, language: u.language });

r.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 6)
      return res.status(400).json({ error: 'Enter your name, a valid email and a password of 6+ characters.' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ error: 'This email is already registered. Please log in.' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(user), user: pub(user) });
  } catch (e) { next(e); }
});

r.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
      return res.status(401).json({ error: 'Wrong email or password.' });
    res.json({ token: sign(user), user: pub(user) });
  } catch (e) { next(e); }
});

r.get('/me', auth, async (req, res) => res.json({ user: pub(await User.findById(req.userId)) }));

r.put('/me', auth, async (req, res, next) => {
  try {
    const allowed = ['name', 'age', 'income', 'occupation', 'gender', 'language'];
    const patch = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    await User.updateOne({ _id: req.userId }, patch, { runValidators: true });
    res.json({ user: pub(await User.findById(req.userId)) });
  } catch (e) { next(e); }
});
export default r;
