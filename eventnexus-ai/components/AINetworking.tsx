
import React, { useState, useEffect } from 'react';
import { Network, Sparkles, MessageSquare, UserPlus, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const MOCK_ATTENDEES = [
  { name: 'Sarah Chen', company: 'AI Solutions', industry: 'Data Science', interests: ['Machine Learning', 'AI Ethics'] },
  { name: 'Michael Brown', company: 'WebScale', industry: 'Cloud Infrastructure', interests: ['Kubernetes', 'Serverless'] },
  { name: 'Emily White', company: 'DesignCo', industry: 'Product Design', interests: ['UI/UX', 'Accessibility'] },
  { name: 'David Lee', company: 'FinTech Hub', industry: 'Finance', interests: ['Blockchain', 'Security'] },
  { name: 'Lisa Ray', company: 'GreenEnergy', industry: 'Sustainability', interests: ['IoT', 'Renewable Energy'] },
];

interface AINetworkingProps {
  currentUser?: any;
}

const AINetworking: React.FC<AINetworkingProps> = ({ currentUser }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // Fetch real attendees from MongoDB, fallback to mocks
      let attendees = MOCK_ATTENDEES;
      try {
        const dbAttendees = await api.getAttendees();
        if (dbAttendees.length > 0) attendees = dbAttendees;
      } catch {}

      const user = currentUser || { name: 'User', interests: [] };
      const results = await api.getNetworkingRecommendations(user, attendees, 3);
      setRecommendations(results);
    } catch (error) {
      console.warn('AI backend unreachable; falling back to empty recommendations.', error);
      setRecommendations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-theme-text flex items-center gap-3 tracking-tight">
            AI Networking Assistant
            <Sparkles className="text-amber-500 animate-pulse" size={28} />
          </h2>
          <p className="text-theme-sub mt-1">Smart matching based on your profile and professional interests.</p>
        </div>
        <button 
          onClick={fetchRecommendations}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Matches</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-xl text-theme-text">Matches Recommended for You</h3>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-theme-surface p-6 rounded-3xl border border-theme-border animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-theme-border rounded-2xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-theme-border rounded w-1/4"></div>
                      <div className="h-3 bg-theme-border rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-theme-border rounded w-full"></div>
                    <div className="h-3 bg-theme-border rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-theme-surface p-6 rounded-3xl border border-theme-border shadow-sm hover:shadow-indigo-500/5 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-900/20">
                        {rec.name[0]}
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-theme-text">{rec.name}</h4>
                        <div className="flex gap-2">
                          <button className="p-2.5 text-theme-sub hover:text-indigo-400 hover:bg-indigo-600/10 rounded-xl transition-all border border-transparent hover:border-indigo-500/20">
                            <UserPlus size={20} />
                          </button>
                          <button className="p-2.5 text-theme-sub hover:text-indigo-400 hover:bg-indigo-600/10 rounded-xl transition-all border border-transparent hover:border-indigo-500/20">
                            <MessageSquare size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-indigo-600/5 rounded-2xl border border-indigo-500/10">
                        <p className="text-[10px] font-bold text-indigo-400 mb-1.5 uppercase tracking-widest">Ai Reasoning</p>
                        <p className="text-theme-sub text-sm leading-relaxed">{rec.reason}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-theme-sub bg-theme-bg p-3.5 rounded-xl border border-theme-border">
                        <span className="font-black text-indigo-400 uppercase text-[9px] tracking-widest">Starter:</span>
                        <span className="italic">"{rec.starter}"</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-theme-surface border-2 border-dashed border-theme-border rounded-3xl p-12 text-center">
              <Network className="mx-auto text-theme-sub opacity-30 mb-4" size={48} />
              <p className="text-theme-sub font-bold">Click "Refresh Matches" to find your network peers.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-2xl shadow-indigo-900/40 border border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <Network size={80} />
            </div>
            <h3 className="font-black text-xl mb-1 relative z-10">My Networking Profile</h3>
            <p className="text-indigo-100 text-xs mb-6 relative z-10 opacity-70 uppercase tracking-widest font-bold">Interests Matching Active</p>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center font-black">{(currentUser?.name || 'U')[0].toUpperCase()}{(currentUser?.name || 'User').split(' ')[1]?.[0]?.toUpperCase() || ''}</div>
                <div>
                  <p className="font-bold">{currentUser?.name || 'User'}</p>
                  <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest opacity-80">{currentUser?.company || 'My Company'}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[9px] font-bold text-indigo-100 uppercase tracking-[0.2em] mb-3">Professional Focus</p>
                <div className="flex flex-wrap gap-1.5">
                  {(currentUser?.interests || []).map((interest: string) => (
                    <span key={interest} className="text-[9px] font-bold bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg">{interest}</span>
                  ))}
                </div>
              </div>
              <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-white text-indigo-600 font-black rounded-xl text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 shadow-xl">
                Update Preferences
              </button>
            </div>
          </div>

          <div className="bg-theme-surface p-6 rounded-3xl border border-theme-border shadow-sm">
            <h3 className="font-bold text-lg text-theme-text mb-4">Network Graph</h3>
            <div className="aspect-square bg-theme-bg rounded-2xl relative flex items-center justify-center overflow-hidden border border-theme-border">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white z-10 shadow-2xl border-4 border-theme-surface font-black text-xs">ME</div>
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <div 
                  key={i} 
                  className="absolute w-10 h-10 bg-theme-surface rounded-xl border border-theme-border transition-all hover:scale-110 hover:border-indigo-500 cursor-help"
                  style={{ 
                    transform: `rotate(${deg}deg) translate(80px) rotate(-${deg}deg)` 
                  }}
                ></div>
              ))}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                   <line key={i} x1="50%" y1="50%" x2={`${50 + 35 * Math.cos(deg * Math.PI / 180)}%`} y2={`${50 + 35 * Math.sin(deg * Math.PI / 180)}%`} stroke="#6366f1" strokeWidth="2" />
                ))}
              </svg>
            </div>
            <p className="text-[10px] font-bold text-theme-sub mt-4 text-center uppercase tracking-widest">Real-time Node Distribution</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AINetworking;
