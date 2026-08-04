import React, { useEffect, useRef, useState } from 'react';
import { FiMail, FiSend, FiSearch } from 'react-icons/fi';
import { Card, SectionHeader, EmptyState, Avatar, SearchInput, formatDateTime, timeAgo } from './ui';
import Button from '../../../components/common/Button';

export default function MessagesView({
  conversations,
  getThread,
  sendMessage,
  openCandidate,
  clearOpenCandidate,
  loading
}) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!openCandidate) return;
    const sel = {
      userId: openCandidate.userId,
      candidateName: openCandidate.name,
      candidateEmail: openCandidate.email
    };
    setSelected(sel);
    openThread(sel.userId);
    clearOpenCandidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCandidate]);

  useEffect(() => {
    if (!selected) return;
    openThread(selected.userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.userId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const openThread = async (userId) => {
    setThreadLoading(true);
    const res = await getThread(userId);
    setMessages(res?.messages || []);
    setThreadLoading(false);
  };

  const filtered = conversations.filter(c => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return `${c.candidateName} ${c.candidateEmail} ${c.lastMessage}`.toLowerCase().includes(q);
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !selected) return;
    setSending(true);
    await sendMessage(selected.userId, draft.trim());
    const res = await getThread(selected.userId);
    setMessages(res?.messages || []);
    setDraft('');
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <SectionHeader icon={FiMail} title="Candidate Messages" subtitle="Stay in touch with applicants directly" />

      <Card padded={false} className="h-[calc(100vh-240px)] min-h-[420px] flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <SearchInput value={query} onChange={setQuery} placeholder="Search conversations..." />
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <p className="text-center text-xs text-slate-400 font-semibold py-8">Loading...</p>
              ) : filtered.length === 0 ? (
                <p className="text-center text-xs text-slate-400 font-medium py-8">
                  {conversations.length === 0 ? 'No conversations yet' : 'No matches'}
                </p>
              ) : (
                filtered.map(c => (
                  <button
                    key={c.userId}
                    onClick={() => setSelected({ userId: c.userId, candidateName: c.candidateName, candidateEmail: c.candidateEmail })}
                    className={`w-full text-left px-3 py-3 flex items-center gap-2.5 border-b border-slate-50 dark:border-slate-800/60 transition-colors cursor-pointer ${
                      selected?.userId === c.userId
                        ? 'bg-brand-50/60 dark:bg-brand-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="relative">
                      <Avatar name={c.candidateName} size="sm" />
                      {c.unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{c.candidateName}</p>
                        <span className="text-[9px] text-slate-400 font-semibold shrink-0">{timeAgo(c.lastMessageAt)}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{c.lastMessage || 'Start the conversation'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-slate-300 dark:text-slate-600">
                  <FiMail className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Select a conversation</p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <Avatar name={selected.candidateName} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">{selected.candidateName}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{selected.candidateEmail}</p>
                  </div>
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
                  {threadLoading ? (
                    <p className="text-center text-xs text-slate-400 font-semibold py-6">Loading thread...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 font-medium py-6">No messages yet — say hello!</p>
                  ) : (
                    messages.map(m => (
                      <div key={m.id} className={`flex ${m.sender === 'employer' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                            m.sender === 'employer'
                              ? 'bg-brand-600 text-white rounded-br-sm'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          <p className={`text-[9px] mt-1 font-semibold ${m.sender === 'employer' ? 'text-brand-200' : 'text-slate-400'}`}>
                            {formatDateTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={submit} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Type a message..."
                    rows={2}
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium resize-none"
                  />
                  <Button type="submit" variant="primary" size="sm" className="self-end" loading={sending} disabled={!draft.trim()}>
                    <FiSend className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
