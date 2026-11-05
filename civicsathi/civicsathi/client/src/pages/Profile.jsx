import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import { Card, Btn, Err, Input, Select, OCCUPATIONS } from '../components/UI.jsx';

export default function Profile() {
  const { user, saveProfile, setAuthOpen, ready } = useApp();
  const [f, setF] = useState({});
  const [rec, setRec] = useState([]);
  const [apps, setApps] = useState([]);
  const [msg, setMsg] = useState('');
  const load = () => { api('/schemes/recommend').then(setRec).catch(() => {}); api('/applications/mine').then(setApps).catch(() => {}); };
  useEffect(() => { if (user) { setF({ name: user.name, age: user.age ?? '', income: user.income ?? '', occupation: user.occupation, gender: user.gender }); load(); } }, [user?.id]);
  if (!ready) return null;
  if (!user) return <Card className="p-8 text-center max-w-md mx-auto"><p className="mb-4">Log in to save your profile and get scheme recommendations made for you.</p><Btn onClick={() => setAuthOpen(true)} className="bg-blue-600 text-white">Login / Register</Btn></Card>;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => { try { await saveProfile({ ...f, age: f.age === '' ? undefined : +f.age, income: f.income === '' ? undefined : +f.income }); setMsg('Profile saved.'); load(); } catch (e) { setMsg(e.message); } };
  return (
    <div className="space-y-4 max-w-3xl">
      <Card className="p-5">
        <h3 className="font-bold text-lg mb-3">My dashboard</h3>
        <div className="grid sm:grid-cols-5 gap-3"><Input placeholder="Name" value={f.name || ''} onChange={set('name')} /><Input type="number" placeholder="Age" value={f.age ?? ''} onChange={set('age')} /><Input type="number" placeholder="Annual income (₹)" value={f.income ?? ''} onChange={set('income')} /><Select options={OCCUPATIONS} value={f.occupation || 'student'} onChange={set('occupation')} /><Select options={['female', 'male', 'other']} value={f.gender || 'female'} onChange={set('gender')} /></div>
        <div className="flex items-center gap-3 mt-3"><Btn onClick={save} className="bg-blue-600 text-white">Save profile</Btn><span className="text-sm text-slate-600">{msg}</span></div>
      </Card>
      <Card className="p-5"><h3 className="font-bold text-lg mb-3">Recommended for you</h3>
        {rec.length ? rec.map((s) => <div key={s._id} className="text-sm py-2 border-b border-blue-50 last:border-0"><b>{s.name}</b>: {s.description}</div>) : <p className="text-sm text-slate-500">Add your age and income to see matching schemes.</p>}</Card>
      <Card className="p-5"><h3 className="font-bold text-lg mb-3">My applications</h3>
        {apps.length ? apps.map((a) => <div key={a._id} className="text-sm py-2 border-b border-blue-50 last:border-0 flex justify-between"><span>{a.scheme?.name} <span className="text-slate-500">({a.appId})</span></span><b>{a.status}</b></div>) : <p className="text-sm text-slate-500">No applications yet. Open Find Schemes and choose Apply.</p>}</Card>
      <Err>{''}</Err>
    </div>
  );
}
