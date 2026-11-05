import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import { Card, Btn, Err, Input } from '../components/UI.jsx';

export default function Auth() {
  const { login, setAuthOpen } = useApp();
  const [reg, setReg] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async () => {
    setErr(''); setBusy(true);
    try { login(await api(reg ? '/auth/register' : '/auth/login', { method: 'POST', body: f })); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
      <Card className="w-full max-w-sm p-6 space-y-3">
        <div className="flex justify-between"><h3 className="font-bold text-lg">{reg ? 'Create account' : 'Welcome back'}</h3><button onClick={() => setAuthOpen(false)} aria-label="Close"><X /></button></div>
        {reg && <Input placeholder="Full name" value={f.name} onChange={set('name')} />}
        <Input placeholder="Email" type="email" value={f.email} onChange={set('email')} />
        <Input placeholder="Password (6+ characters)" type="password" value={f.password} onChange={set('password')} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <Err>{err}</Err>
        <Btn onClick={submit} disabled={busy} className="w-full bg-blue-600 text-white">{reg ? 'Register' : 'Login'}</Btn>
        <button onClick={() => { setReg(!reg); setErr(''); }} className="text-sm text-blue-600 w-full">{reg ? 'Have an account? Login' : 'New here? Register'}</button>
      </Card>
    </div>
  );
}
