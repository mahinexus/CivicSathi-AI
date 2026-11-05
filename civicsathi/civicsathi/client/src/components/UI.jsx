export const Card = ({ children, className = '' }) => <div className={`bg-white rounded-2xl shadow-sm border border-blue-100 ${className}`}>{children}</div>;
export const Btn = ({ children, className = '', ...p }) => <button {...p} className={`rounded-full px-5 py-2.5 font-semibold text-sm disabled:opacity-50 ${className}`}>{children}</button>;
export const Err = ({ children }) => (children ? <div className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">{children}</div> : null);
export const Input = (p) => <input {...p} className={`w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ring-blue-400 ${p.className || ''}`} />;
export const Select = ({ options, ...p }) => <select {...p} className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm">{options.map((o) => <option key={o}>{o}</option>)}</select>;
export const OCCUPATIONS = ['student', 'farmer', 'business', 'unemployed', 'salaried'];
