import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import { Card, Btn, Err, Input, Select, OCCUPATIONS } from '../components/UI.jsx';

const CATS = ['All', 'Scholarship', 'Farmers', 'Health', 'Housing', 'Business', 'Women & Girls', 'Skills'];

function Eligibility() {
  const { user } = useApp();
  const [f, setF] = useState({ age: user?.age ?? '', income: user?.income ?? '', occupation: user?.occupation || 'student', gender: user?.gender || 'female' });
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const check = () => api('/schemes/eligibility', { method: 'POST', body: f }).then((d) => { setRes(d); setErr(''); }).catch((e) => setErr(e.message));
  return (
    <Card className="p-5">
      <h3 className="font-bold text-lg mb-3">Check eligibility</h3>
      <div className="grid sm:grid-cols-4 gap-3">
        <Input type="number" placeholder="Age" value={f.age} onChange={set('age')} />
        <Input type="number" placeholder="Annual income (₹)" value={f.income} onChange={set('income')} />
        <Select options={OCCUPATIONS} value={f.occupation} onChange={set('occupation')} />
        <Select options={['female', 'male', 'other']} value={f.gender} onChange={set('gender')} />
      </div>
      <Btn onClick={check} className="mt-3 bg-blue-600 text-white">Check my eligibility</Btn>
      <div className="mt-3"><Err>{err}</Err></div>
      {res && (res.length ? <div className="mt-4 space-y-2"><div className="font-semibold text-green-700">You may qualify for {res.length} scheme{res.length > 1 ? 's' : ''}:</div>{res.map((s) => <div key={s._id} className="text-sm bg-green-50 rounded-xl px-4 py-2"><b>{s.name}</b>: {s.description}</div>)}</div>
        : <div className="mt-4 text-sm text-amber-700">No matching schemes. Check your details or browse all schemes.</div>)}
    </Card>
  );
}

function SchemeCard({ s }) {
  const { user, lang, setAuthOpen } = useApp();
  const [guide, setGuide] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const loadGuide = async () => { setBusy(true); setGuide((await api(`/schemes/${s._id}/guidance?lang=${lang}`)).text); setBusy(false); };
  const apply = async () => {
    if (!user) return setAuthOpen(true);
    try { const a = await api('/applications', { method: 'POST', body: { schemeId: s._id } }); setMsg(`Applied. Your application ID is ${a.appId}. Save it to track status.`); }
    catch (e) { setMsg(e.message); }
  };
  return (
    <Card className="p-5 flex flex-col">
      <div className="text-xs text-blue-700 font-semibold">{s.category}</div>
      <div className="font-bold text-lg">{lang === 'hi' && s.nameHi ? s.nameHi : s.name}</div>
      <p className="text-sm mt-2">{s.description}</p>
      <div className="text-xs mt-3 text-slate-600"><b>Documents:</b> {s.documents.join(', ')}</div>
      <a href={s.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 mt-3"><ShieldCheck size={16} />Verified official source</a>
      <div className="flex gap-2 mt-4"><Btn onClick={loadGuide} disabled={busy} className="bg-blue-50 text-blue-800">{busy ? 'Loading...' : 'How to apply'}</Btn><Btn onClick={apply} className="bg-blue-600 text-white">Apply</Btn></div>
      {msg && <div className="text-sm mt-3 bg-green-50 rounded-xl p-3">{msg}</div>}
      {guide && <div className="text-sm mt-3 bg-blue-50 rounded-xl p-3 whitespace-pre-wrap">{guide}</div>}
    </Card>
  );
}

export default function Schemes() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [cat, setCat] = useState('All');
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    setList(null);
    api(`/schemes?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`).then(setList).catch((e) => setErr(e.message));
  }, [q, cat]);
  return (
    <div className="space-y-5">
      <Eligibility />
      <div className="flex flex-wrap gap-2">{CATS.map((c) => <button key={c} onClick={() => setCat(c)} className={`px-4 py-1.5 rounded-full text-sm font-medium border ${cat === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-blue-100'}`}>{c}</button>)}</div>
      <Err>{err}</Err>
      {q && <div className="text-sm text-slate-600">Results for "{q}"</div>}
      {!list && !err && <div className="text-sm text-slate-500">Loading schemes...</div>}
      <div className="grid md:grid-cols-2 gap-4">{list?.map((s) => <SchemeCard key={s._id} s={s} />)}</div>
      {list && !list.length && <div className="text-sm text-slate-500">No schemes match. Try a different word or category.</div>}
    </div>
  );
}
