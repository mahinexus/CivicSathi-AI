import { Link } from 'react-router-dom';
import { LayoutGrid, ShieldCheck, FileText, Bot, MapPin, Globe, Users, Zap, Sparkles } from 'lucide-react';
import hero from '../assets/hero.jpg';
import { useApp } from '../context/AppContext.jsx';
import ChatPanel from '../components/ChatPanel.jsx';
import { Btn } from '../components/UI.jsx';

const FEAT = [['Find Schemes', 'Discover relevant government schemes', LayoutGrid, '/schemes', 'bg-green-50'], ['Check Eligibility', 'Know if you qualify', ShieldCheck, '/schemes', 'bg-blue-50'], ['Document Guide', 'Get a complete checklist', FileText, '/documents', 'bg-purple-50'], ['AI Assistant', 'Ask anything in simple language', Bot, '/assistant', 'bg-green-50'], ['Explain Rejection', 'Understand and know next steps', FileText, '/track', 'bg-purple-50'], ['Track Application', 'Monitor your status', MapPin, '/track', 'bg-green-50'], ['Official Sources', 'Get trusted links', ShieldCheck, '/schemes', 'bg-blue-50'], ['Multilingual Support', 'English & Hindi', Globe, '/assistant', 'bg-purple-50']];
const FLOAT = [['Find Schemes', '/schemes', 'left-[10.7%] top-[5.6%] w-[19.6%] h-[31%]'], ['Get Guidance', '/assistant', 'left-[64.5%] top-[5.6%] w-[19.6%] h-[31%]'], ['Check Documents', '/documents', 'left-[2.2%] top-[38%] w-[19.6%] h-[31%]'], ['Track Status', '/track', 'left-[74%] top-[37.5%] w-[19.6%] h-[31%]']];

export default function Home() {
  const { t } = useApp();
  return (
    <div className="grid xl:grid-cols-[1fr_340px] gap-5">
      <div className="space-y-5 min-w-0">
        <section className="hero-bg rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 overflow-hidden">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold">CivicSathi <span className="text-blue-600">AI</span></h1>
            <h2 className="text-xl md:text-2xl font-bold mt-3">{t.h1}</h2>
            <p className="text-slate-600 mt-3 max-w-md">{t.sub}</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link to="/assistant"><Btn className="bg-blue-600 text-white shadow-lg inline-flex items-center gap-2"><Sparkles size={16} />{t.ask}</Btn></Link>
              <Link to="/schemes"><Btn className="bg-white border border-blue-600 text-blue-900">{t.exp}</Btn></Link>
            </div>
          </div>
          <div className="relative w-full max-w-[440px] shrink-0">
            <img src={hero} alt="Smiling student using the CivicSathi app" className="rounded-3xl w-full" />
            {FLOAT.map(([l, to, pos]) => <Link key={l} to={to} aria-label={l} title={l} className={`absolute ${pos} rounded-full hover:ring-2 ring-blue-400`} />)}
          </div>
        </section>
        <section>
          <h3 className="font-bold text-lg mb-3"><span className="text-orange-500">★</span> Our Key Features</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {FEAT.map(([a, b, Icon, to, bg]) => (
              <Link key={a} to={to} className={`rounded-2xl p-4 border border-white shadow-sm hover:-translate-y-0.5 transition ${bg}`}>
                <Icon className="text-blue-700" /><div className="font-bold mt-2 text-sm">{a}</div><div className="text-xs text-slate-500 mt-1">{b}</div>
              </Link>
            ))}
          </div>
        </section>
        <section className="bg-blue-50 rounded-2xl p-4 grid sm:grid-cols-3 gap-3 text-sm">
          {[[Users, 'Trusted by', 'Millions of Citizens'], [ShieldCheck, 'Secure & Reliable', 'Government Information'], [Zap, 'Fast & Easy', 'Access']].map(([Icon, a, b]) => (
            <div key={a} className="flex items-center gap-3 text-blue-700"><Icon size={26} /><div className="text-slate-800"><b>{a}</b><div>{b}</div></div></div>
          ))}
        </section>
      </div>
      <div className="hidden xl:block"><ChatPanel /></div>
    </div>
  );
}
