import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, LayoutGrid, Bot, FileText, MapPin, User, LogOut, Search, Bell, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Auth from '../pages/Auth.jsx';

const NAV = [['/', 'Home', Home], ['/schemes', 'Find Schemes', LayoutGrid], ['/assistant', 'AI Assistant', Bot], ['/documents', 'Document Checker', FileText], ['/track', 'Track Application', MapPin], ['/profile', 'My Profile', User]];

export default function Layout() {
  const { user, logout, lang, setLang, t, authOpen, setAuthOpen } = useApp();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const link = ({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${isActive ? 'bg-blue-500' : 'hover:bg-white/10'}`;

  return (
    <div className="min-h-screen lg:flex">
      <aside className={`bg-gradient-to-b from-[#0a3a78] to-[#0a2250] text-white w-64 shrink-0 p-4 flex-col lg:flex lg:sticky lg:top-0 lg:h-screen ${open ? 'flex fixed inset-y-0 left-0 z-40' : 'hidden'}`}>
        <div className="text-center py-4"><div className="text-3xl">🇮🇳</div><div className="text-xl font-bold">CivicSathi AI</div><div className="text-xs opacity-80 mt-1">{t.tag}</div></div>
        <nav className="space-y-1 mt-4">
          {NAV.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={link}><Icon size={18} />{label}</NavLink>)}
          <div className="border-t border-white/20 my-2" />
          {user ? <button onClick={() => { logout(); nav('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-white/10"><LogOut size={18} />Logout</button>
                : <button onClick={() => setAuthOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-white/10"><User size={18} />Login / Register</button>}
        </nav>
        <div className="mt-auto text-center text-sm italic opacity-80">Digital India<br />Empowered Citizens</div>
      </aside>
      <main className="flex-1 min-w-0 p-3 md:p-6">
        <header className="flex items-center gap-3 mb-5">
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
          <div className="flex-1 flex items-center gap-2 bg-white rounded-full border border-blue-100 px-4 py-2.5">
            <Search size={18} className="text-blue-700" />
            <input defaultValue={params.get('q') || ''} onKeyDown={(e) => e.key === 'Enter' && nav(`/schemes?q=${encodeURIComponent(e.target.value)}`)} placeholder={t.search} className="flex-1 min-w-0 outline-none text-sm bg-transparent" />
          </div>
          <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="rounded-full border border-blue-200 bg-white px-3 py-2 text-sm font-semibold">{lang === 'en' ? 'हिन्दी' : 'English'}</button>
          <Bell className="hidden sm:block text-blue-700" />
          <button onClick={() => (user ? nav('/profile') : setAuthOpen(true))} className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-blue-600 text-white grid place-items-center font-bold">{user ? user.name[0].toUpperCase() : '?'}</span>
            <span className="hidden md:block text-sm font-semibold">{user ? user.name : 'Login'}</span>
          </button>
        </header>
        <Outlet />
      </main>
      {authOpen && <Auth />}
    </div>
  );
}
