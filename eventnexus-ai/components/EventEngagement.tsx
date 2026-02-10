
import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Star, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ThumbsUp,
  User,
  ShieldCheck,
  X,
  Send,
  Calendar,
  ChevronLeft,
  ArrowRight,
  MapPin,
  Play,
  Bell,
  BellRing
} from "lucide-react";
import { Event, UserRole } from "../types";
import { MOCK_EVENTS } from "../constants";
import { api } from "../services/api";

// ── Theme Mapping ────────────────────────────────────────────────────────────
const C = {
  bg:      "transparent",
  surface: "var(--surface)",
  card:    "var(--card)",
  border:  "var(--border)",
  border2: "var(--border-strong)",
  text:    "var(--text)",
  sub:     "var(--text-sub)",
  sub2:    "var(--text-sub2)",
  blue:    "var(--accent)",
  green:   "#10B981",
  orange:  "#F59E0B",
  red:     "#EF4444",
  purple:  "#8B5CF6",
};

// ── Primitives ─────────────────────────────────────────────────────────────

function Pill({ color, children }: { color: string, children: React.ReactNode }) {
  const bgColor = color.startsWith('var') ? `color-mix(in srgb, ${color}, transparent 80%)` : color + "20";
  const borderColor = color.startsWith('var') ? `color-mix(in srgb, ${color}, transparent 65%)` : color + "35";
  
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
      textTransform: "uppercase", padding: "2px 8px", borderRadius: 5,
      background: bgColor, color, border: `1px solid ${borderColor}`,
    }}>{children}</span>
  );
}

function ActionBtn({ children, onClick, variant = "ghost", disabled, small }: any) {
  const [h, setH] = useState(false);
  const pad = small ? "5px 12px" : "8px 18px";
  const fz = small ? 12 : 13;
  const styles: any = {
    primary: { bg: h ? "var(--accent-hover)" : C.blue, color: "#fff", border: "none" },
    green:   { bg: h ? "#059669" : C.green, color: "#fff", border: "none" },
    danger:  { bg: h ? "#DC2626" : C.red,   color: "#fff", border: "none" },
    ghost:   { bg: h ? C.border2 : "transparent", color: h ? C.text : C.sub2, border: `1px solid ${h ? C.border2 : C.border}` },
    outline: { bg: "transparent", color: h ? C.text : C.sub2, border: `1px solid ${h ? C.border2 : C.border}` },
  };
  const s = styles[variant];
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        fontWeight: 600, fontSize: fz,
        padding: pad, borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
        background: s.bg, color: s.color, border: s.border,
        opacity: disabled ? 0.45 : 1, transition: "all 0.12s",
        display: "inline-flex", alignItems: "center", gap: 6,
      }}
    >{children}</button>
  );
}

function Tab({ label, active, onClick, badge, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        fontWeight: active ? 700 : 500, fontSize: 14,
        color: active ? C.text : C.sub, background: "none", border: "none",
        borderBottom: `2px solid ${active ? C.blue : "transparent"}`,
        padding: "0 4px 12px", cursor: "pointer", transition: "all 0.15s",
        display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
      }}
    >
      <Icon size={16} />
      {label}
      {badge != null && (
        <span style={{
          background: active ? C.blue : C.border, color: active ? "#fff" : C.sub,
          fontSize: 10, fontWeight: 700, borderRadius: 10,
          padding: "1px 6px", minWidth: 18, textAlign: "center",
        }}>{badge}</span>
      )}
    </button>
  );
}

// ── Poll Card Component ─────────────────────────────────────────────────────────────

function LivePollBar({ pct, isVoted, animKey }: any) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 80);
    return () => clearTimeout(t);
  }, [pct, animKey]);
  const color = isVoted ? C.blue : C.border2;
  const barBg = isVoted ? `color-mix(in srgb, ${C.blue}, transparent 85%)` : `color-mix(in srgb, ${C.border2}, transparent 70%)`;
  
  return (
    <div style={{
      position: "absolute", inset: 0, width: `${width}%`,
      background: barBg,
      transition: "width 0.55s cubic-bezier(0.4,0,0.2,1)",
      borderRight: width > 0 ? `2px solid color-mix(in srgb, ${color}, transparent 60%)` : "none",
    }} />
  );
}

function PollCard({ poll, onVote, onToggle, isModerator }: any) {
  const total = poll.options.reduce((s: number, o: any) => s + o.votes, 0);

  return (
    <div style={{
      background: C.card, border: `1px solid ${poll.active ? C.border2 : C.border}`,
      borderRadius: 16, overflow: "hidden",
      boxShadow: poll.active ? `0 10px 30px color-mix(in srgb, ${C.blue}, transparent 95%)` : "none",
    }}>
      <div style={{ padding: "18px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: C.text, lineHeight: 1.4, flex: 1 }}>
            {poll.question}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <Pill color={poll.active ? C.green : C.sub}>{poll.active ? "Live" : "Closed"}</Pill>
            {isModerator && (
              <button onClick={() => onToggle(poll.id)} className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-400">
                {poll.active ? "End" : "Resume"}
              </button>
            )}
          </div>
        </div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
          <BarChart3 size={12} /> {total.toLocaleString()} responses
        </div>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {poll.options.map((opt: any) => {
          const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
          const isVoted = poll.voted === opt.id;
          const canVote = poll.active && !poll.voted;
          return (
            <div
              key={opt.id}
              onClick={() => canVote && onVote(poll.id, opt.id)}
              style={{
                position: "relative", borderRadius: 10, overflow: "hidden",
                border: `1px solid ${isVoted ? C.blue : C.border}`,
                cursor: canVote ? "pointer" : "default",
                transition: "all 0.2s",
              }}
            >
              <LivePollBar pct={poll.voted ? pct : 0} isVoted={isVoted} animKey={poll.voted} />
              <div style={{
                position: "relative", padding: "12px 14px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {isVoted && <CheckCircle2 size={14} className="text-indigo-500" />}
                  <span style={{ fontSize: 14, color: isVoted ? C.blue : C.text, fontWeight: isVoted ? 700 : 400 }}>
                    {opt.label}
                  </span>
                </div>
                {poll.voted && (
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: isVoted ? C.blue : C.sub2 }}>
                      {pct}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Q&A Card Component ─────────────────────────────────────────────────────────────

function timeAgo(ts: number) {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

function QACard({ q, onUpvote, onApprove, onReject, onAnswer, onStar, isModerator }: any) {
  const [answering, setAnswering] = useState(false);
  const [answerText, setAnswerText] = useState("");

  const handleAnswer = () => {
    if (!answerText.trim()) return;
    onAnswer(q.id, answerText.trim());
    setAnswering(false);
    setAnswerText("");
  };

  const statusColor = q.status === "approved" ? C.green : q.status === "pending" ? C.orange : C.red;

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${q.status === "pending" && isModerator ? `color-mix(in srgb, ${C.orange}, transparent 60%)` : C.border}`,
      borderRadius: 16, overflow: "hidden",
      opacity: q.status === "rejected" ? 0.4 : 1,
    }}>
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: `linear-gradient(135deg, var(--accent), var(--accent-hover))`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 11, color: "#fff",
            }}>{q.avatar}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{q.author}</div>
              <div style={{ fontSize: 10, color: C.sub, marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={10} /> {timeAgo(q.createdAt)}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {q.starred && <Star size={14} className="text-amber-500 fill-amber-500" />}
            <Pill color={statusColor}>{q.status}</Pill>
          </div>
        </div>

        <div style={{ fontSize: 15, color: C.text, lineHeight: 1.6, marginBottom: 16 }}>
          {q.text}
        </div>

        {q.answer && (
          <div style={{
            background: "color-mix(in srgb, #10b981, transparent 94%)", borderLeft: `4px solid ${C.green}`, borderRadius: 12,
            padding: "14px", marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.green, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
              Speaker Response
            </div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{q.answer}</div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => onUpvote(q.id)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: q.upvoted ? `color-mix(in srgb, ${C.blue}, transparent 80%)` : "transparent",
              border: `1px solid ${q.upvoted ? C.blue : C.border2}`,
              color: q.upvoted ? C.blue : C.sub2,
              borderRadius: 12, padding: "8px 14px", cursor: "pointer",
              fontWeight: 800, fontSize: 13, transition: "all 0.2s",
            }}
          >
            <ThumbsUp size={16} fill={q.upvoted ? C.blue : "none"} />
            {q.votes}
          </button>

          {isModerator && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onStar(q.id)} className={`p-2 rounded-lg border transition-colors ${q.starred ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-transparent border-theme-border text-theme-sub hover:text-theme-text'}`}><Star size={16} /></button>
              {q.status === "pending" && (
                <>
                  <ActionBtn small variant="green" onClick={() => onApprove(q.id)}>Approve</ActionBtn>
                  <ActionBtn small variant="danger" onClick={() => onReject(q.id)}>Deny</ActionBtn>
                </>
              )}
              {q.status === "approved" && !q.answer && (
                <ActionBtn small variant="outline" onClick={() => setAnswering(!answering)}>Answer</ActionBtn>
              )}
            </div>
          )}
        </div>
      </div>

      {answering && (
        <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          <textarea
            value={answerText}
            onChange={e => setAnswerText(e.target.value)}
            placeholder="Official response..."
            className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-sm text-theme-text focus:border-indigo-500 outline-none resize-none mb-3"
            rows={3}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <ActionBtn variant="green" small onClick={handleAnswer}>Post Answer</ActionBtn>
            <ActionBtn variant="ghost" small onClick={() => setAnswering(false)}>Cancel</ActionBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

const SEED_POLLS = [
  {
    id: 1, question: "Which AI application area excites you most in 2025?",
    active: true, voted: null, options: [
      { id: "a", label: "Generative AI & LLMs", votes: 187 },
      { id: "b", label: "Computer Vision", votes: 94 },
      { id: "c", label: "AI Agents & Automation", votes: 231 },
      { id: "d", label: "Robotics & Embodied AI", votes: 66 },
    ],
  },
  {
    id: 2, question: "How are you attending this session?",
    active: true, voted: null, options: [
      { id: "a", label: "In-person", votes: 312 },
      { id: "b", label: "Remotely", votes: 148 },
      { id: "c", label: "Hybrid", votes: 57 },
    ],
  }
];

const SEED_QA = [
  { id: 1, author: "Sarah K.", avatar: "SK", text: "Can you elaborate on how transformer attention scales with context length beyond 128k tokens?", votes: 47, upvoted: false, status: "approved", starred: true, answer: null, createdAt: Date.now() - 60000 * 12 },
  { id: 2, author: "Marcus T.", avatar: "MT", text: "What's the practical difference between RAG and fine-tuning for enterprise use cases?", votes: 38, upvoted: false, status: "approved", starred: false, answer: "Great question! RAG is preferred for dynamic data...", createdAt: Date.now() - 60000 * 18 },
  { id: 4, author: "James W.", avatar: "JW", text: "How do you handle hallucination in customer-facing deployments?", votes: 21, upvoted: true, status: "pending", starred: false, answer: null, createdAt: Date.now() - 60000 * 2 }
];

export default function EventEngagement({ userRole }: { userRole: UserRole }) {
  const [joinedEventId, setJoinedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("polling");
  const [isModerator, setIsModerator] = useState(false);
  const [polls, setPolls] = useState(SEED_POLLS);
  const [questions, setQuestions] = useState(SEED_QA);
  const [newQ, setNewQ] = useState("");
  const [reminders, setReminders] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  
  // Poll creation state
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [pollFormQuestion, setPollFormQuestion] = useState("");
  const [pollFormOptions, setPollFormOptions] = useState(["", ""]);

  // Force attendee view if role is Attendee
  useEffect(() => {
    if (userRole === UserRole.ATTENDEE) {
      setIsModerator(false);
    }
  }, [userRole]);

  useEffect(() => {
    let cancelled = false;

    const loadEvents = async () => {
      try {
        setEventsLoading(true);
        const incoming = await api.getEvents();
        if (cancelled) return;
        if (incoming.length) {
          setEvents(incoming);
          setSyncError(null);
        } else {
          setEvents(MOCK_EVENTS);
          setSyncError("No backend events yet — showing sample schedule.");
        }
      } catch (error) {
        if (cancelled) return;
        console.warn("Failed to reach FastAPI backend, falling back to mocks.", error);
        setEvents(MOCK_EVENTS);
        setSyncError("API unreachable — showing mock schedule.");
      } finally {
        if (!cancelled) {
          setEventsLoading(false);
        }
      }
    };

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!joinedEventId) return;
    const updated = events.find(event => event.id === joinedEventId);
    if (updated) {
      setActiveEvent(updated);
    }
  }, [events, joinedEventId]);

  // Simulated live trickle
  useEffect(() => {
    const t = setInterval(() => {
      setPolls(prev => prev.map(p => {
        if (!p.active) return p;
        const idx = Math.floor(Math.random() * p.options.length);
        return {
          ...p,
          options: p.options.map((o, i) => i === idx ? { ...o, votes: o.votes + 1 } : o),
        };
      }));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const handleVote = (pollId: number, optId: string) => {
    setPolls(prev => prev.map(p => p.id !== pollId ? p : {
      ...p, voted: optId,
      options: p.options.map(o => o.id === optId ? { ...o, votes: o.votes + 1 } : o),
    }));
  };

  const handleUpvote = (id: number) => {
    setQuestions(prev => prev.map(q => q.id !== id ? q : {
      ...q, upvoted: !q.upvoted,
      votes: q.upvoted ? q.votes - 1 : q.votes + 1,
    }));
  };

  const handleSubmitQ = () => {
    if (!newQ.trim()) return;
    setQuestions(prev => [{
      id: Date.now(), author: "You", avatar: "ME", text: newQ,
      votes: 0, upvoted: false, status: isModerator ? "approved" : "pending",
      starred: false, answer: null, createdAt: Date.now()
    }, ...prev]);
    setNewQ("");
  };

  const handleCreatePoll = () => {
    const validOptions = pollFormOptions.filter(o => o.trim() !== "");
    if (!pollFormQuestion.trim() || validOptions.length < 2) return;

    const newPoll = {
      id: Date.now(),
      question: pollFormQuestion,
      active: true,
      voted: null,
      options: validOptions.map((label, idx) => ({
        id: String.fromCharCode(97 + idx),
        label,
        votes: 0
      }))
    };

    setPolls(prev => [newPoll, ...prev]);
    setPollFormQuestion("");
    setPollFormOptions(["", ""]);
    setIsCreatingPoll(false);
  };

  const handleAddReminder = (eventId: string) => {
    if (reminders.includes(eventId)) {
      setReminders(prev => prev.filter(id => id !== eventId));
    } else {
      setReminders(prev => [...prev, eventId]);
    }
  };

  const handleJoinEvent = (event: Event) => {
    setJoinedEventId(event.id);
    setActiveEvent(event);
  };

  const updateOption = (idx: number, value: string) => {
    const next = [...pollFormOptions];
    next[idx] = value;
    setPollFormOptions(next);
  };

  const addOption = () => setPollFormOptions([...pollFormOptions, ""]);
  const removeOption = (idx: number) => setPollFormOptions(pollFormOptions.filter((_, i) => i !== idx));

  // If no event joined, show selection screen
  if (!activeEvent) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-theme-text tracking-tight flex items-center gap-3">
              Event Hub
              <Play className="text-indigo-500 fill-indigo-500" size={24} />
            </h2>
            <p className="text-theme-sub mt-1">Explore live interactions or set reminders for upcoming sessions.</p>
            {syncError && (
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1.5">
                <AlertCircle size={14} />
                <span>{syncError}</span>
              </div>
            )}
          </div>
          {reminders.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl animate-in zoom-in-95">
              <BellRing size={16} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-500">{reminders.length} Reminders Set</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {eventsLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-64 rounded-3xl bg-theme-surface border border-theme-border animate-pulse" />
            ))
          ) : events.length === 0 ? (
            <div className="col-span-full text-center text-theme-sub text-sm bg-theme-surface border border-theme-border rounded-3xl py-12">
              No events available yet. Create one from the Dashboard to get started.
            </div>
          ) : (
            events.map(event => {
              const isLive = event.status === 'published';
              const hasReminder = reminders.includes(event.id);
              const formattedDate = new Date(event.startDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              
              return (
                <div 
                  key={event.id}
                  className={`bg-theme-surface rounded-3xl border transition-all group flex flex-col ${
                    isLive 
                      ? 'border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                      : 'border-theme-border opacity-90'
                  }`}
                >
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-2xl ${isLive ? 'bg-emerald-600/10 text-emerald-500' : 'bg-indigo-600/10 text-indigo-500'}`}>
                        {isLive ? <Play size={20} className="fill-emerald-500" /> : <Calendar size={20} />}
                      </div>
                      <Pill color={isLive ? C.green : C.orange}>
                        {isLive ? 'Live Now' : 'Upcoming'}
                      </Pill>
                    </div>
                    
                    <div>
                      <h3 className={`text-xl font-black transition-colors ${isLive ? 'text-theme-text group-hover:text-emerald-500' : 'text-theme-text group-hover:text-indigo-500'}`}>
                        {event.name}
                      </h3>
                      <p className="text-theme-sub text-sm mt-2 line-clamp-2">{event.description}</p>
                    </div>

                    <div className="pt-4 border-t border-theme-border space-y-3">
                      <div className="flex items-center gap-3 text-xs text-theme-sub">
                        <Clock size={14} className={isLive ? "text-emerald-400" : "text-indigo-400"} />
                        <span className="font-bold">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-theme-sub">
                        <MapPin size={14} className={isLive ? "text-emerald-400" : "text-indigo-400"} />
                        <span className="font-bold">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-theme-bg/50 border-t border-theme-border">
                    {isLive ? (
                      <button 
                        onClick={() => handleJoinEvent(event)}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                      >
                        <span>Join Live Session</span>
                        <ArrowRight size={18} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAddReminder(event.id)}
                        className={`w-full flex items-center justify-center gap-2 border font-black py-3 rounded-2xl transition-all active:scale-95 ${
                          hasReminder 
                            ? 'bg-amber-500/10 border-amber-500 text-amber-600' 
                            : 'bg-theme-surface border-theme-border text-theme-text hover:bg-theme-card'
                        }`}
                      >
                        {hasReminder ? <BellRing size={18} /> : <Bell size={18} />}
                        <span>{hasReminder ? 'Reminder Set' : 'Add Reminder'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => {
              setJoinedEventId(null);
              setActiveEvent(null);
            }}
            className="mt-1 p-2 bg-theme-surface border border-theme-border text-theme-sub hover:text-indigo-500 hover:border-indigo-500 rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-theme-text tracking-tight">{activeEvent?.name}</h2>
              <Pill color={C.green}>Live Interaction</Pill>
            </div>
            <p className="text-theme-sub font-medium text-sm">{activeEvent?.location} · Real-time Participation</p>
            {syncError && (
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1.5">
                <AlertCircle size={14} />
                <span>{syncError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Role toggle only allowed for Organizers */}
        {userRole === UserRole.ORGANIZER && (
          <div className="flex items-center gap-4 bg-theme-surface border border-theme-border p-1.5 rounded-2xl shadow-sm">
            <button 
              onClick={() => setIsModerator(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!isModerator ? 'bg-indigo-600 text-white shadow-lg' : 'text-theme-sub hover:text-theme-text'}`}
            >
              Attendee
            </button>
            <button 
              onClick={() => setIsModerator(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isModerator ? 'bg-indigo-600 text-white shadow-lg' : 'text-theme-sub hover:text-theme-text'}`}
            >
              Moderator
            </button>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-theme-border flex justify-between items-center">
        <div className="flex gap-10">
          <Tab 
            label="Live Polling" 
            active={activeTab === "polling"} 
            onClick={() => setActiveTab("polling")} 
            icon={BarChart3}
          />
          <Tab 
            label="Q&A Session" 
            active={activeTab === "qa"} 
            onClick={() => setActiveTab("qa")} 
            icon={MessageSquare}
            badge={isModerator ? questions.filter(q => q.status === "pending").length : undefined}
          />
        </div>
        
        {isModerator && activeTab === "polling" && (
          <button 
            onClick={() => setIsCreatingPoll(!isCreatingPoll)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all mb-3 shadow-md"
          >
            {isCreatingPoll ? <X size={14} /> : <Plus size={14} />}
            {isCreatingPoll ? "Cancel" : "New Poll"}
          </button>
        )}
      </div>

      {/* ── Content Area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "polling" ? (
            <div className="grid grid-cols-1 gap-6">
              {/* Poll Creation Form (Moderator Only) */}
              {isModerator && isCreatingPoll && (
                <div className="bg-theme-surface border border-indigo-500/30 rounded-3xl p-6 shadow-xl animate-in slide-in-from-top-4 duration-300">
                  <h3 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                    <Plus className="text-indigo-500" size={20} />
                    Create New Poll
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest mb-1.5 block">Question</label>
                      <input 
                        type="text"
                        value={pollFormQuestion}
                        onChange={e => setPollFormQuestion(e.target.value)}
                        placeholder="e.g., How often do you use LLMs?"
                        className="w-full bg-theme-bg border border-theme-border rounded-xl p-3 text-sm text-theme-text focus:border-indigo-500 outline-none"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest block">Options</label>
                      {pollFormOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input 
                            type="text"
                            value={opt}
                            onChange={e => updateOption(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1 bg-theme-bg border border-theme-border rounded-xl p-3 text-sm text-theme-text focus:border-indigo-500 outline-none"
                          />
                          {pollFormOptions.length > 2 && (
                            <button onClick={() => removeOption(idx)} className="p-3 text-theme-sub hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button 
                        onClick={addOption}
                        className="w-full py-2.5 border-2 border-dashed border-theme-border rounded-xl text-[10px] font-bold text-theme-sub uppercase tracking-widest hover:border-indigo-500/50 hover:text-indigo-500 transition-all"
                      >
                        + Add Another Option
                      </button>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button 
                        onClick={handleCreatePoll}
                        disabled={!pollFormQuestion.trim() || pollFormOptions.filter(o => o.trim()).length < 2}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                      >
                        Launch Poll
                      </button>
                      <button 
                        onClick={() => setIsCreatingPoll(false)}
                        className="px-6 py-3 border border-theme-border text-theme-sub rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-theme-bg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {polls.map(p => (
                <PollCard 
                  key={p.id} 
                  poll={p} 
                  onVote={handleVote} 
                  isModerator={isModerator}
                  onToggle={(id: number) => setPolls(prev => prev.map(pl => pl.id === id ? {...pl, active: !pl.active} : pl))}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Question Input */}
              <div className="bg-theme-surface border border-theme-border rounded-3xl p-6 shadow-sm">
                <textarea 
                  value={newQ}
                  onChange={e => setNewQ(e.target.value)}
                  placeholder="What would you like to ask the panel?"
                  className="w-full bg-theme-bg border border-theme-border rounded-2xl p-4 text-theme-text focus:border-indigo-500 outline-none resize-none mb-4 min-h-[100px]"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-theme-sub uppercase tracking-widest">Questions are reviewed before being published</p>
                  <button 
                    onClick={handleSubmitQ}
                    disabled={!newQ.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Submit
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions
                  .filter(q => isModerator || q.status === "approved" || q.author === "You")
                  .sort((a, b) => b.votes - a.votes)
                  .map(q => (
                    <QACard 
                      key={q.id} q={q} 
                      onUpvote={handleUpvote}
                      onApprove={(id: number) => setQuestions(qs => qs.map(x => x.id === id ? {...x, status: 'approved'} : x))}
                      onReject={(id: number) => setQuestions(qs => qs.map(x => x.id === id ? {...x, status: 'rejected'} : x))}
                      onStar={(id: number) => setQuestions(qs => qs.map(x => x.id === id ? {...x, starred: !x.starred} : x))}
                      onAnswer={(id: number, text: string) => setQuestions(qs => qs.map(x => x.id === id ? {...x, answer: text} : x))}
                      isModerator={isModerator}
                    />
                  ))
                }
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-theme-surface border border-theme-border rounded-3xl p-6 overflow-hidden relative shadow-sm">
            <div className="absolute -top-10 -right-10 opacity-5 text-theme-sub">
              <ShieldCheck size={160} />
            </div>
            <h3 className="font-bold text-lg text-theme-text mb-4">Engagement Stats</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center p-4 bg-theme-card rounded-2xl border border-theme-border">
                <div className="text-[10px] font-bold text-theme-sub uppercase tracking-widest">Active Voters</div>
                <div className="text-xl font-black text-indigo-500">1,248</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-theme-card rounded-2xl border border-theme-border">
                <div className="text-[10px] font-bold text-theme-sub uppercase tracking-widest">Q&A Queue</div>
                <div className="text-xl font-black text-emerald-500">{questions.length}</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-theme-card rounded-2xl border border-theme-border">
                <div className="text-[10px] font-bold text-theme-sub uppercase tracking-widest">Response Rate</div>
                <div className="text-xl font-black text-amber-500">88%</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl text-white shadow-2xl">
            <h3 className="font-black text-xl mb-4">Moderator Tip</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              Use "Star" to highlight critical technical questions for the speaker's final wrap-up segment. 
            </p>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-indigo-200" />
                <span className="text-xs font-bold uppercase tracking-widest">Privileged Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
