import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  source?: string | null;
  score?: number;
};

const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: uid(),
      role: 'assistant',
      text: 'Ask me anything about your events, attendees, or logistics.',
      source: null,
      score: 0,
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const canSend = useMemo(() => !isSending && input.trim().length > 0, [isSending, input]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    setError(null);
    setIsSending(true);
    setInput('');

    const userMsg: ChatMessage = { id: uid(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await api.ragChat(text);
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        text: response.answer,
        source: response.source ?? null,
        score: response.score,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err?.message || 'Failed to reach AI backend.');
      setMessages(prev => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          text: 'AI backend is unreachable right now. Please try again.',
          source: null,
          score: 0,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-theme-text tracking-tight">AI Assistant</h2>
          <p className="text-theme-sub mt-1">RAG-powered answers from your live event data.</p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-1.5">
          <Sparkles size={14} />
          <span>RAG Chat</span>
        </div>
      </div>

      <div className="bg-theme-surface rounded-3xl border border-theme-border shadow-sm overflow-hidden flex flex-col h-[560px]">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[85%] rounded-2xl px-4 py-3 bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                    : 'max-w-[85%] rounded-2xl px-4 py-3 bg-theme-bg border border-theme-border text-theme-text'
                }
              >
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.text}</p>
                {m.role === 'assistant' && (m.source || (m.score ?? 0) > 0) && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-theme-sub">
                    {m.source && (
                      <span className="px-2 py-1 rounded-lg bg-theme-border border border-theme-border">Source: {m.source}</span>
                    )}
                    {(m.score ?? 0) > 0 && (
                      <span className="px-2 py-1 rounded-lg bg-theme-border border border-theme-border">Score: {m.score}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-theme-bg border border-theme-border text-theme-sub">
                <p className="text-sm font-bold">Thinking…</p>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {error && (
          <div className="px-5 pb-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-400">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="p-5 border-t border-theme-border bg-theme-surface">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-theme-sub uppercase tracking-widest">Message</label>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="e.g. Where is the next event and how many registrations do we have?"
                className="mt-2 w-full bg-theme-bg border border-theme-border rounded-2xl px-4 py-3 text-sm text-theme-text focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-theme-sub resize-none"
                rows={2}
              />
            </div>

            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-black transition-all shadow-lg shadow-indigo-900/20 active:scale-95 disabled:opacity-60 disabled:hover:bg-indigo-600"
            >
              <Send size={18} />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
