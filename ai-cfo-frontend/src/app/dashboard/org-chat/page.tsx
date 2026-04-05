'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { useWorkspace } from '@/context/WorkspaceContext';
import { MessageSquare, Send, Hash, Users, Loader2 } from 'lucide-react';
import { getAuthHeaders } from '@/lib/api';
import { toast } from 'sonner';

type ChatMessage = {
  id: number;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
};

export default function OrgChatPage() {
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const { activeWorkspaceId } = useWorkspace();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const orgId = organization?.id || user?.id;

  // Poll for messages
  useEffect(() => {
    if (!orgId) return;

    const fetchMessages = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org-chat/?org_id=${orgId}&limit=100`, { headers });
        if (res.ok) {
          const data = await res.json();
          // API returns descending by date, so reverse it for chat order
          setMessages(data.reverse());
        }
      } catch (err) {
        // silent
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [orgId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !orgId) return;

    setIsSending(true);
    const newMsgContent = inputValue.trim();
    setInputValue('');

    // Optimistic update
    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      user_id: user?.id || '',
      user_name: user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Unknown',
      user_avatar: user?.imageUrl || '',
      content: newMsgContent,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/org-chat/`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: orgId,
          workspace_id: activeWorkspaceId || '',
          user_id: optimisticMsg.user_id,
          user_name: optimisticMsg.user_name,
          user_avatar: optimisticMsg.user_avatar,
          content: optimisticMsg.content,
        })
      });

      if (!res.ok) {
        throw new Error('Failed to send');
      }
    } catch (err) {
      toast.error("Message failed to send");
      // Could roll back optimistic update here ideally
    } finally {
      setIsSending(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0d14]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2637] flex-shrink-0 bg-[#0c0f17]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Hash className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">General Discussion</h2>
            <p className="text-xs text-slate-500 mt-0.5">Organization-wide chat for {organization?.name || "your team"}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-[#0c0f17] flex items-center justify-center text-[8px] font-bold text-white">
                <Users size={10} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-sm font-medium text-white mb-1">Welcome to Org Chat</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              This is the beginning of the discussion history for your organization. Say hello to the team!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.user_id === user?.id;
            const showHeader = idx === 0 || messages[idx - 1].user_id !== msg.user_id || 
              (new Date(msg.created_at).getTime() - new Date(messages[idx - 1].created_at).getTime() > 60000);

            return (
              <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar (only show on sequence start) */}
                  <div className="flex-shrink-0 w-8">
                    {showHeader ? (
                      msg.user_avatar ? (
                        <img src={msg.user_avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-[#1e2637]" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {msg.user_name?.[0] || '?'}
                        </div>
                      )
                    ) : null}
                  </div>

                  {/* Message Body */}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {showHeader && (
                      <div className="flex items-baseline gap-2 mb-1 mx-1">
                        <span className="text-xs font-medium text-slate-300">{isMe ? 'You' : msg.user_name}</span>
                        <span className="text-[9px] text-slate-500">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    
                    <div 
                      className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-tr-sm' 
                          : 'bg-[#1e2637] text-slate-200 rounded-tl-sm border border-[#2a3441]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0c0f17] border-t border-[#1e2637]">
        <div className="max-w-4xl mx-auto relative">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message your organization..."
              className="flex-1 bg-[#121622] border border-[#2a3441] rounded-full pl-5 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className={`absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-full transition-all ${
                inputValue.trim() ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer' : 'bg-[#1e2637] text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -ml-0.5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
