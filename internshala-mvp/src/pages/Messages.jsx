import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { FiMail, FiSend, FiMessageSquare, FiClock } from 'react-icons/fi';
import { messageService } from '../services/mockApi';

const formatTime = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const formatDay = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const Spinner = ({ className = '' }) => (
  <div className={`inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} />
);

const dedupe = (msgs) =>
  Array.from(new Map(msgs.map(m => [m.id, m])).values());

const Messages = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeEmployerId, setActiveEmployerId] = useState(location.state?.employerId || null);
  const [thread, setThread] = useState([]);
  const [threadMeta, setThreadMeta] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const threadEndRef = useRef(null);

  // Change-detection refs so polling only re-renders when data actually moves.
  const threadJsonRef = useRef('');
  const threadLenRef = useRef(0);
  const activeRef = useRef(null);
  activeRef.current = activeEmployerId;

  const applyThread = (nextMsgs, forceScroll = false) => {
    const clean = dedupe(nextMsgs || []);
    const json = JSON.stringify(clean);
    if (json === threadJsonRef.current && !forceScroll) return;
    const prevLen = threadLenRef.current;
    threadLenRef.current = clean.length;
    threadJsonRef.current = json;
    setThread(clean);
    if (forceScroll || clean.length > prevLen) {
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 60);
    }
  };

  // Handle navigation redirect state changes
  useEffect(() => {
    if (location.state?.employerId) {
      setActiveEmployerId(location.state.employerId);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Initial conversation list load
  useEffect(() => {
    messageService.getConversations()
      .then(res => setConversations(res.data.conversations || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  // Load thread when switching conversations
  useEffect(() => {
    if (!activeEmployerId) return;
    setThreadLoading(true);
    setThread([]);
    threadJsonRef.current = '';
    threadLenRef.current = 0;
    messageService.getThread(activeEmployerId)
      .then(res => {
        setThreadMeta(res.data.employer || null);
        applyThread(res.data.messages || [], true);
      })
      .catch(() => setThread([]))
      .finally(() => setThreadLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEmployerId]);

  // Light polling: only refetch thread when the tab is visible, and only
  // re-render when the message list actually changed.
  useEffect(() => {
    if (!activeEmployerId) return;
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      messageService.getThread(activeEmployerId)
        .then(res => {
          applyThread(res.data.messages || []);
          if (res.data.employer) setThreadMeta(res.data.employer);
        })
        .catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEmployerId]);

  // Gentle conversation-list poll (unread badges / previews)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      messageService.getConversations()
        .then(res => setConversations(prev => {
          const fresh = res.data.conversations || [];
          if (JSON.stringify(prev) === JSON.stringify(fresh)) return prev;
          return fresh;
        }))
        .catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const refreshConversations = () => {
    messageService.getConversations()
      .then(res => setConversations(res.data.conversations || []))
      .catch(() => {});
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || !activeEmployerId) return;
    const optimistic = {
      id: `tmp-${Date.now()}`,
      sender: 'user',
      content,
      createdAt: new Date().toISOString(),
      is_read: true,
    };
    setSending(true);
    setText('');
    applyThread([...thread, optimistic], true);
    try {
      await messageService.sendMessage(activeEmployerId, content);
      const res = await messageService.getThread(activeEmployerId);
      applyThread(res.data.messages || [], true);
      if (res.data.employer) setThreadMeta(res.data.employer);
      setConversations(prev => prev.map(cv =>
        cv.employerId === activeEmployerId
          ? { ...cv, lastMessage: content, lastMessageAt: new Date().toISOString(), unread: 0 }
          : cv
      ));
    } catch {
      applyThread([...thread], true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">Messages</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
          Chat with recruiters who shortlisted you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Conversation List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col lg:h-[calc(100vh-215px)]">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <FiMail className="w-4 h-4 text-brand-600" />
            <h2 className="font-extrabold text-slate-800 dark:text-white text-sm">Recruiters</h2>
            {conversations.some(cv => cv.unread > 0) && (
              <span className="ml-auto text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">
                {conversations.reduce((a, cv) => a + cv.unread, 0)} new
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-800/60 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-xs font-bold text-slate-500">
                <Spinner className="text-brand-500" /> Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-6">
                <FiMessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">No conversations yet.</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  Recruiters will appear here when they message you.
                </p>
              </div>
            ) : (
              conversations.map(cv => (
                <button
                  key={cv.employerId}
                  onClick={() => {
                    setActiveEmployerId(cv.employerId);
                    refreshConversations();
                  }}
                  className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-colors cursor-pointer border-none ${
                    activeEmployerId === cv.employerId
                      ? 'bg-brand-50/60 dark:bg-brand-900/15'
                      : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                    {(cv.companyName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${cv.unread > 0 ? 'font-black text-slate-900 dark:text-white' : 'font-extrabold text-slate-800 dark:text-slate-100'}`}>
                        {cv.companyName}
                      </span>
                      {cv.unread > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none shrink-0">
                          {cv.unread}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${cv.unread > 0 ? 'font-bold text-slate-700 dark:text-slate-300' : 'font-medium text-slate-500 dark:text-slate-400'}`}>
                      {cv.lastMessage || 'No messages yet'}
                    </p>
                    {cv.lastMessageAt && (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5 block">
                        {formatTime(cv.lastMessageAt)}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Active Thread */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[360px] lg:h-[calc(100vh-215px)]">
          {!activeEmployerId ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                <FiMail className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-white">Select a conversation</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Choose a recruiter on the left to start chatting.</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  {(threadMeta?.companyName || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-800 dark:text-white text-sm leading-none">
                    {threadMeta?.companyName || 'Recruiter'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {threadMeta?.recruiterName || 'Recruiter'}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 min-h-[160px] space-y-2.5">
                {threadLoading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-xs font-bold text-slate-500">
                    <Spinner className="text-brand-500" /> Loading conversation...
                  </div>
                ) : thread.length === 0 ? (
                  <div className="text-center py-12">
                    <FiClock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">No messages in this conversation yet.</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Say hello to get started.</p>
                  </div>
                ) : (
                  (() => {
                    let lastDay = '';
                    return thread.map((msg, idx) => {
                      const day = msg.createdAt ? new Date(msg.createdAt).toDateString() : '';
                      const showSep = day && day !== lastDay;
                      lastDay = day;
                      const isUser = msg.sender === 'user';
                      return (
                        <Fragment key={msg.id || idx}>
                          {showSep && (
                            <div className="flex justify-center py-2">
                              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                {formatDay(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                            {!isUser && (
                              <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center font-black text-[10px] shrink-0 mb-0.5">
                                {(threadMeta?.companyName || 'C').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs font-semibold shadow-sm ${
                              isUser
                                ? 'bg-brand-600 text-white rounded-br-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm'
                            }`}>
                              {msg.content}
                              <span className={`block text-[8px] mt-1 font-bold ${isUser ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                        </Fragment>
                      );
                    });
                  })()
                )}
                <div ref={threadEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 dark:text-slate-100 font-semibold"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5 border-none transition-colors"
                >
                  {sending ? <Spinner /> : <FiSend className="w-3 h-3" />} Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
