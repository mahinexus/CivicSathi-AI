import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import { Card, Btn, Err, Input } from '../components/UI.jsx';

const STEPS = ['Submitted', 'Documents verified', 'Under review', 'Approved'];

export default function Track() {
  const { user, lang } = useApp();
  const [id, setId] = useState('');
  const [app, setApp] = useState(null);
  const [mine, setMine] = useState([]);
  const [err, setErr] = useState('');
  const [reason, setReason] = useState('');
  const [explain, setExplain] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) api('/applications/mine').then(setMine).catch(() => {}); else setMine([]); }, [user]);
  const look = async (v = id) => {
    setErr(''); setExplain(''); setApp(null);
    try { const a = await api(`/applications/track/${encodeURIComponent(v.trim())}`); setApp(a); setReason(a.rejectionReason || ''); }
    catch (e) { setErr(e.message); }
  };
  const doExplain = async () => {
    setBusy(true); setErr('');
    try { setExplain((await api(`/applications/${app.appId}/explain`, { method: 'POST', body: { reason, lang } })).text); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const idx = app ? STEPS.indexOf(app.status) : -1;

  return (
    <div className="space-y-4 max-w-3xl">
      <Card className="p-5">
        <h3 className="font-bold text-lg mb-3">Track application</h3>
        <div className="flex gap-2"><Input value={id} onChange={(e) => setId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && look()} placeholder="Application ID, e.g. CS2026-1042" /><Btn onClick={() => look()} className="bg-blue-600 text-white whitespace-nowrap">Track status</Btn></div>
        {mine.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{mine.map((m) => <button key={m._id} onClick={() => { setId(m.appId); look(m.appId); }} className="text-xs rounded-full border border-blue-200 px-3 py-1 hover:bg-blue-50">{m.scheme?.name}: {m.appId}</button>)}</div>}
        <div className="mt-3"><Err>{err}</Err></div>
        {app && <div className="mt-5"><div className="font-semibold mb-3">{app.scheme} · {app.status}</div>
          {app.status !== 'Rejected' && <div className="space-y-3">{STEPS.map((x, i) => <div key={x} className="flex items-center gap-3"><span className={`w-6 h-6 rounded-full grid place-items-center text-white text-xs ${i <= idx ? 'bg-green-500' : 'bg-slate-300'}`}>{i <= idx ? '✓' : ''}</span><span className={i <= idx ? 'font-semibold' : 'text-slate-400'}>{x}</span></div>)}</div>}
        </div>}
      </Card>
      {app?.status === 'Rejected' && (
        <Card className="p-5 space-y-3">
          <h3 className="font-bold text-lg">Explain my rejection</h3>
          {!user && <div className="text-sm text-amber-700">Log in with the account that applied to get an explanation.</div>}
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Paste the rejection reason from your notice" />
          <Btn onClick={doExplain} disabled={busy || !user} className="bg-blue-600 text-white">{busy ? 'Explaining...' : 'Explain and show next steps'}</Btn>
          {explain && <div className="text-sm bg-amber-50 rounded-xl p-3 whitespace-pre-wrap">{explain}</div>}
        </Card>
      )}
    </div>
  );
}
