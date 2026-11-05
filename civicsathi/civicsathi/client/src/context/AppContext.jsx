import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const TEXT = {
  en: { tag: 'Your Rights. Your Benefits. Your Guide.', h1: 'Government Services Made Simple for Everyone', sub: 'Discover schemes, understand eligibility, and get step-by-step guidance with AI.', ask: 'Ask AI Assistant', exp: 'Explore Schemes', search: 'Search for schemes, services...', hello: "Namaste! I'm your CivicSathi AI assistant. How can I help you today?", type: 'Type or speak your question...' },
  hi: { tag: 'आपके अधिकार। आपके लाभ। आपका मार्गदर्शक।', h1: 'सरकारी सेवाएँ, सबके लिए आसान', sub: 'योजनाएँ खोजें, पात्रता जानें और AI से चरण-दर-चरण मार्गदर्शन पाएँ।', ask: 'AI सहायक से पूछें', exp: 'योजनाएँ देखें', search: 'योजनाएँ, सेवाएँ खोजें...', hello: 'नमस्ते! मैं आपका CivicSathi AI सहायक हूँ। मैं आपकी कैसे मदद करूँ?', type: 'अपना सवाल लिखें या बोलें...' },
};
const Ctx = createContext();
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState(localStorage.getItem('cs_lang') || 'en');
  const [authOpen, setAuthOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cs_token')) return setReady(true);
    api('/auth/me').then((d) => setUser(d.user)).catch(() => localStorage.removeItem('cs_token')).finally(() => setReady(true));
  }, []);
  useEffect(() => localStorage.setItem('cs_lang', lang), [lang]);

  const login = ({ token, user }) => { localStorage.setItem('cs_token', token); setUser(user); setAuthOpen(false); };
  const logout = () => { localStorage.removeItem('cs_token'); setUser(null); };
  const saveProfile = async (patch) => setUser((await api('/auth/me', { method: 'PUT', body: patch })).user);

  return <Ctx.Provider value={{ user, lang, setLang, t: TEXT[lang], login, logout, saveProfile, authOpen, setAuthOpen, ready }}>{children}</Ctx.Provider>;
}
