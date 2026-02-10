import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  DollarSign,
  Ticket,
  TrendingUp,
  Plus,
  ArrowRight,
  X,
  Calendar as CalendarIcon,
  MapPin,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { api, CreateEventPayload } from '../services/api';
import { Event } from '../types';
import { MOCK_EVENTS } from '../constants';

const data = [
  { name: 'Mon', registrations: 12 },
  { name: 'Tue', registrations: 45 },
  { name: 'Wed', registrations: 28 },
  { name: 'Thu', registrations: 89 },
  { name: 'Fri', registrations: 56 },
  { name: 'Sat', registrations: 102 },
  { name: 'Sun', registrations: 78 },
];

interface DashboardProps {
  onTabChange: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState<CreateEventPayload>({
    name: '',
    startDate: '',
    location: '',
    capacity: 500,
    description: ''
  });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoadingEvents(true);
        const incoming = await api.getEvents();
        setEvents(incoming.length ? incoming : MOCK_EVENTS);
        setSyncError(null);
      } catch (error) {
        console.warn('Failed to reach API, falling back to mock data.', error);
        setEvents(MOCK_EVENTS);
        setSyncError('API unreachable — showing mock analytics.');
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const loadAiHealth = async () => {
      try {
        const health = await api.getAiHealth();
        setAiStatus(health.ok ? `AI online (${health.rag_backend})` : 'AI offline');
      } catch (error) {
        setAiStatus('AI offline');
      }
    };

    loadAiHealth();
  }, []);

  const metrics = useMemo(() => {
    const totalRegistrations = events.reduce((sum, event) => sum + (event.registeredCount || 0), 0);
    const totalRevenue = events.reduce((sum, event) => sum + (event.revenue || 0), 0);
    return {
      totalRegistrations,
      totalRevenue,
      activeEvents: events.length,
      satisfaction: '94%'
    };
  }, [events]);

  const resetForm = () => {
    setNewEvent({ name: '', startDate: '', location: '', capacity: 500, description: '' });
    setFormError(null);
  };

  const hasConflict = events.some(event =>
    newEvent.startDate &&
    new Date(event.startDate).toDateString() === new Date(newEvent.startDate).toDateString() &&
    event.location.trim().toLowerCase() === newEvent.location.trim().toLowerCase()
  );

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (hasConflict) {
      setFormError('An event is already scheduled for this date and location.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createEvent(newEvent);
      setEvents(prev => [created, ...prev]);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      setFormError('Unable to create the event via API. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const recentEvents = events
    .slice()
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-theme-text tracking-tight">Organizer Dashboard</h2>
          <p className="text-theme-sub mt-1">Monitor live performance with FastAPI powered analytics.</p>
          {syncError && (
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1.5">
              <AlertCircle size={14} />
              <span>{syncError}</span>
            </div>
          )}
          {aiStatus && (
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-1.5">
              <span>{aiStatus}</span>
            </div>
          )}
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
        >
          <Plus size={20} />
          <span>Create New Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Registrations',
            value: metrics.totalRegistrations.toLocaleString(),
            trend: '+12% vs last week',
            icon: <Users className="text-blue-400" />,
            bg: 'bg-blue-500/10'
          },
          {
            label: 'Total Revenue',
            value: `$${metrics.totalRevenue.toLocaleString()}`,
            trend: '+8.5% growth',
            icon: <DollarSign className="text-emerald-400" />,
            bg: 'bg-emerald-500/10'
          },
          {
            label: 'Active Events',
            value: metrics.activeEvents.toString(),
            trend: 'Operational',
            icon: <Ticket className="text-amber-400" />,
            bg: 'bg-amber-500/10'
          },
          {
            label: 'Attendee Sat.',
            value: metrics.satisfaction,
            trend: '+2.1% uplift',
            icon: <TrendingUp className="text-purple-400" />,
            bg: 'bg-purple-500/10'
          },
        ].map((stat, idx) => (
          <div key={idx} className="bg-theme-surface p-6 rounded-2xl border border-theme-border shadow-sm hover:shadow-indigo-500/5 transition-all">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">{stat.trend}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-theme-sub text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
              <p className="text-2xl font-black text-theme-text mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-theme-surface p-6 rounded-3xl border border-theme-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-theme-text">Registration Trends</h3>
            <select className="text-xs font-bold bg-theme-bg border border-theme-border text-theme-sub rounded-lg px-3 py-1.5 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-sub)', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-sub)', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', color: 'var(--text)' }}
                  itemStyle={{ color: 'var(--text)', fontSize: '12px', fontWeight: 'bold' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-theme-surface p-6 rounded-3xl border border-theme-border shadow-sm flex flex-col h-full max-h-[440px]">
          <h3 className="font-bold text-lg text-theme-text mb-6">Recent Events</h3>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {loadingEvents ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="animate-pulse h-16 rounded-2xl bg-theme-border/50" />
              ))
            ) : recentEvents.length === 0 ? (
              <div className="text-theme-sub text-sm">No events scheduled yet. Create one to get started.</div>
            ) : (
              recentEvents.map(event => (
                <div 
                  key={event.id}
                  onClick={() => onTabChange('venue')}
                  className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-theme-bg transition-all cursor-pointer border border-transparent hover:border-theme-border"
                >
                  <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex flex-col items-center justify-center text-indigo-400 font-black">
                    <span className="text-[9px] uppercase leading-none opacity-60">
                      {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-lg">
                      {new Date(event.startDate).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-theme-text truncate text-sm">{event.name}</h4>
                    <p className="text-[10px] text-theme-sub mt-0.5 uppercase tracking-wider">{event.registeredCount} regs • {event.location}</p>
                  </div>
                  <ArrowRight size={16} className="text-theme-sub group-hover:text-indigo-400 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
          <div className="bg-theme-surface w-full max-w-lg rounded-3xl border border-theme-border shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-theme-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-400">
                  <Plus size={20} />
                </div>
                <h3 className="text-xl font-black text-theme-text">Create New Event</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-theme-sub hover:text-theme-text transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-5">
              {formError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-500 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{formError}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest">Event Name</label>
                <input 
                  required
                  autoFocus
                  type="text" 
                  placeholder="e.g. World AI Summit 2025"
                  value={newEvent.name}
                  onChange={(e) => {
                    setNewEvent({ ...newEvent, name: e.target.value });
                    if (formError) setFormError(null);
                  }}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-sm text-theme-text focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-theme-sub"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest">Description</label>
                <textarea
                  placeholder="Optional description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-sm text-theme-text focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-theme-sub"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest">Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-sub" size={16} />
                    <input 
                      required
                      type="date" 
                      value={newEvent.startDate}
                      onChange={(e) => {
                        setNewEvent({ ...newEvent, startDate: e.target.value });
                        if (formError) setFormError(null);
                      }}
                      className="w-full bg-theme-bg border border-theme-border rounded-xl pl-10 pr-4 py-3 text-sm text-theme-text focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest">Capacity</label>
                  <input 
                    required
                    type="number" 
                    min={1}
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl px-4 py-3 text-sm text-theme-text focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-sub" size={16} />
                  <input 
                    required
                    type="text" 
                    placeholder="City, Venue, or Remote"
                    value={newEvent.location}
                    onChange={(e) => {
                      setNewEvent({ ...newEvent, location: e.target.value });
                      if (formError) setFormError(null);
                    }}
                    className="w-full bg-theme-bg border border-theme-border rounded-xl pl-10 pr-4 py-3 text-sm text-theme-text focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-theme-sub"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-900/40 active:scale-[0.98] disabled:opacity-60"
                >
                  <Check size={20} />
                  <span>{isSubmitting ? 'Creating...' : 'Launch Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
