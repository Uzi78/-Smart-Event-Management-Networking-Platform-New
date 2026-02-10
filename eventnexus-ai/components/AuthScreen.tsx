import React, { useState } from 'react';
import { Zap, Mail, Lock, User, Briefcase, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface AuthScreenProps {
  onAuth: (user: any) => void;
}

const INTEREST_OPTIONS = [
  'AI / Machine Learning', 'Cloud Native', 'React / Frontend', 'Blockchain',
  'DevOps', 'Cybersecurity', 'Data Science', 'IoT', 'Mobile Dev', 'UI/UX Design',
];

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup extras
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [role, setRole] = useState<'ORGANIZER' | 'ATTENDEE'>('ATTENDEE');

  const toggleInterest = (i: string) =>
    setInterests(prev => (prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        onAuth(res.user);
      } else {
        if (!name.trim()) { setError('Name is required.'); setLoading(false); return; }
        const res = await api.signup({ name, email, password, company, industry, interests, role });
        onAuth(res.user);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <Zap size={24} fill="white" className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">EventNexus</h1>
          </div>
          <p className="text-slate-400 text-sm">Smart Event Management + AI Networking Platform</p>
        </div>

        {/* Card */}
        <div className="bg-[#12121e] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-slate-800">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                  mode === m
                    ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-600/5'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Signup: Name */}
            {mode === 'signup' && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <div className="mt-1.5 relative">
                  <User size={16} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
              <div className="mt-1.5 relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <div className="mt-1.5 relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Signup: Role selector */}
            {mode === 'signup' && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">I am joining as</label>
                <div className="mt-1.5 flex gap-3">
                  {([['ATTENDEE', 'Attendee'], ['ORGANIZER', 'Organizer']] as const).map(([r, label]) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                        role === r
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Signup: Company & Industry */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company</label>
                  <div className="mt-1.5 relative">
                    <Briefcase size={16} className="absolute left-3 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      placeholder="Acme Inc."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    placeholder="Software"
                    className="mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            {/* Signup: Interests */}
            {mode === 'signup' && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interests (for AI networking)</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map(i => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => toggleInterest(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        interests.includes(i)
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/30 disabled:opacity-60 active:scale-[0.98]"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-xs text-slate-500">
              {mode === 'login' ? "Don't have an account?" : 'Already registered?'}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                className="text-indigo-400 font-bold hover:underline"
              >
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Powered by */}
        <p className="text-center mt-6 text-[10px] text-slate-600 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
          <Sparkles size={12} />
          Powered by FastAPI + MongoDB + AI/RAG
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
