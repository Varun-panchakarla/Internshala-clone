import React, { useState, useEffect, useRef } from 'react';
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

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeEmployerId, setActiveEmployerId] = useState(null);
  const [thread, setThread] = useState([]);
  const [threadMeta, setThreadMeta] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const threadEndRef = useRef(null);

  useEffect(() => {
    messageService.getConversations()
      .then(res => setConversations(res.data.conversations || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeEmployerId) return;
    setThreadLoading(true);
    messageService.getThread(activeEmployerId)
      .then(res => {
        setThread(res.data.messages || []);
        setThreadMeta(res.data.employer || null);
      })
      .catch(() => setThread([]))
      .finally(() => setThreadLoading(false));
  }, [activeEmployerId]);

  useEffect(() => {
    if (!activeEmployerId) return;
    const interval = setInterval(() => {
      messageService.getThread(activeEmployerId)
        .then(res => setThread(res.data.messages || []))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [activeEmployerId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || !activeEmployerId) return;
    setSending(true);
    try {
      const res = await messageService.sendMessage(activeEmployerId, content);
      setThread(prev => [...prev, res.data.message]);
      setText('');
    } catch {
      setText('');
    } finally {
      setSending(false);
    }
  };

  const refreshConversations = () => {
    messageService.getConversations()
      .then(res => setConversations(res.data.conversations || []))
      .catch(() => {});
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">Messages</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
          Chat with recruiters who shortlisted you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <FiMail className="w-4 h-4 text-brand-600" />
            <h2 className="font-extrabold text-slate-800 dark:text-white text-sm">Recruiters</h2>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-800/60 max-h-[520px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-12 text-xs font-bold text-slate-500">Loading conversations...</div>
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
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">
                        {cv.companyName}
                      </span>
                      {cv.unread > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none shrink-0">
                          {cv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[520px]">
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

              <div className="flex-1 overflow-y-auto space-y-2.5 px-5 py-4 max-h-[400px]">
                {threadLoading ? (
                  <div className="text-center py-12 text-xs font-bold text-slate-500">Loading conversation...</div>
                ) : thread.length === 0 ? (
                  <div className="text-center py-12">
                    <FiClock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">No messages in this conversation yet.</p>
                  </div>
                ) : (
                  thread.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs font-semibold ${
                        msg.sender === 'user'
                          ? 'bg-brand-600 text-white rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm'
                      }`}>
                        {msg.content}
                        <span className="block text-[8px] mt-1 opacity-70 font-bold">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={threadEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 dark:text-slate-100 font-semibold"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5 border-none"
                >
                  <FiSend className="w-3 h-3" /> Send
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
