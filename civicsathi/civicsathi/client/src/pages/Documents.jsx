import { useEffect, useState } from 'react';
import { FileText, CheckCircle2, UploadCloud, AlertTriangle } from 'lucide-react';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import { Card, Btn, Err } from '../components/UI.jsx';

export default function Documents() {
  const { user, setAuthOpen } = useApp();
  const [schemes, setSchemes] = useState([]);
  const [sid, setSid] = useState('');
  const [res, setRes] = useState({});
  const [err, setErr] = useState('');
  useEffect(() => { api('/schemes').then((d) => { setSchemes(d); setSid(d[0]?._id || ''); }).catch((e) => setErr(e.message)); }, []);
  const s = schemes.find((x) => x._id === sid);

  const scan = async (doc, file) => {
    if (!file) return;
    if (!user) return setAuthOpen(true);
    setRes((r) => ({ ...r, [doc]: { busy: true } })); setErr('');
    const form = new FormData(); form.append('file', file); form.append('expected', doc);
    try { const data = await api('/ai/scan', { method: 'POST', form }); setRes((r) => ({ ...r, [doc]: { data } })); }
    catch (e) { setRes((r) => ({ ...r, [doc]: {} })); setErr(e.message); }
  };
  const ready = s ? s.documents.filter((d) => res[d]?.data?.matchesExpected).length : 0;

  return (
    <div className="space-y-4 max-w-3xl">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-3"><h3 className="font-bold text-lg">Document checker</h3>
          <select value={sid} onChange={(e) => { setSid(e.target.value); setRes({}); }} className="rounded-xl border border-blue-100 px-3 py-2 text-sm bg-white">{schemes.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</select></div>
        {s && <><div className="mt-3 h-2 bg-blue-50 rounded-full"><div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${(ready / s.documents.length) * 100}%` }} /></div>
          <div className="text-xs mt-1 text-slate-600">{ready} of {s.documents.length} documents verified by AI scan</div></>}
        {!user && <div className="text-sm mt-3 text-amber-700">Log in to scan documents with AI.</div>}
      </Card>
      <Err>{err}</Err>
      {s?.documents.map((d) => {
        const r = res[d]; const x = r?.data;
        return (
          <Card key={d} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">{x?.matchesExpected ? <CheckCircle2 className="text-green-600" /> : <FileText className="text-slate-400" />}
                <div><div className="font-semibold text-sm">{d}</div><div className="text-xs text-slate-500">{r?.busy ? 'Scanning with AI...' : x ? `Detected: ${x.documentType} (${x.quality} quality)` : 'Not uploaded'}</div></div></div>
              <label className="cursor-pointer text-sm font-semibold text-blue-600 flex items-center gap-1"><UploadCloud size={16} />Scan<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={(e) => scan(d, e.target.files[0])} /></label>
            </div>
            {x && <div className="mt-3 text-xs bg-blue-50 rounded-xl p-3 space-y-1">
              {x.extractedText && <div><b>Text found:</b> {x.extractedText}</div>}
              {x.fields?.name && <div><b>Name:</b> {x.fields.name}</div>}
              {x.issues?.map((i) => <div key={i} className="text-amber-700 flex gap-1"><AlertTriangle size={14} />{i}</div>)}
            </div>}
          </Card>
        );
      })}
      <p className="text-xs text-slate-500">Scans are read by the Gemini API on the server. Files are not stored. Only the last 4 digits of ID numbers are shown.</p>
    </div>
  );
}
