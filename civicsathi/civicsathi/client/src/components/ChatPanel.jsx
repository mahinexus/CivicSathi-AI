import { useEffect, useRef, useState } from 'react';
import { Bot, Mic, Send, ArrowRight } from 'lucide-react';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import { Card } from './UI.jsx';

const QUICK = ['Tell me about scholarships', 'What documents are needed?', 'Explain a government scheme', 'Check my eligibility'];

export default function ChatPanel({ tall }) {
  const { lang, t } = useApp();
  const [msgs, setMsgs] = useState([{ role: 'model', text: t.hello }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const end = useRef();
  useEffect(() => end.current?.scrollIntoView({ block: 'nearest' }), [msgs, busy]);

  const send = async (q) => {
    q = (q ?? text).trim();
    if (!q || busy) return;
    setText(''); setBusy(true);
    const history = msgs.slice(1);
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    try {
      const { reply } = await api('/ai/chat', { method: 'POST', body: { message: q, history, lang } });
      setMsgs((m) => [...m, { role: 'model', text: reply }]);
    } catch (e) { setMsgs((m) => [...m, { role: 'model', text: e.message, error: true }]); }
    setBusy(false);
  };

  const voice = () => {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) return setMsgs((m) => [...m, { role: 'model', text: 'Voice input is not supported in this browser. Please type.', error: true }]);
    const r = new R();
    r.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onresult = (e) => send(e.results[0][0].transcript);
    r.start();
  };

  return (
    <Card className={`flex flex-col ${tall ? 'h-[72vh]' : 'h-full min-h-[480px]'}`}>
      <div className="flex items-center gap-3 p-4 border-b border-blue-50">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white grid place-items-center"><Bot /></div>
        <div><div className="font-bold">CivicSathi AI Assistant</div><div className="text-xs text-green-600">● Online</div></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
            <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : m.error ? 'bg-red-50 text-red-700' : 'bg-blue-50'}`}>{m.text}</div>
          </div>
        ))}
        {busy && <div className="text-sm text-slate-500">Thinking...</div>}
        {msgs.length < 2 && QUICK.map((q) => (
          <button key={q} onClick={() => send(q)} className="w-full flex justify-between items-center text-left text-sm font-medium bg-white border border-blue-100 rounded-xl px-4 py-2.5 hover:bg-blue-50">{q}<ArrowRight size={16} className="text-blue-600" /></button>
        ))}
        <div ref={end} />
      </div>
      <div className="p-3 flex items-center gap-2 border-t border-blue-50">
        <button onClick={voice} aria-label="Speak" className={`p-2 rounded-full ${listening ? 'bg-red-100 text-red-600' : 'text-blue-700'}`}><Mic /></button>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder={t.type} className="flex-1 min-w-0 rounded-full bg-blue-50 px-4 py-2.5 text-sm outline-none focus:ring-2 ring-blue-400" />
        <button onClick={() => send()} aria-label="Send" className="w-10 h-10 rounded-full bg-blue-600 text-white grid place-items-center"><Send size={18} /></button>
      </div>
    </Card>
  );
}
