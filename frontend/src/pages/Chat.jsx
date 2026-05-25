import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, Trash2, Menu } from 'lucide-react';
import ChatBox from '../components/ChatBox';

const Chat = () => {
  const [sessions, setSessions] = useState([
    { id: 1, title: 'React Optimization' },
    { id: 2, title: 'General Chat' }
  ]);
  const [activeSession, setActiveSession] = useState(1);
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hello! I am Nova AI. How can I assist you today?', created_at: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { id: Date.now(), role: 'user', content: input, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I received your message: "${newMsg.content}". This is a simulated response.`,
        created_at: new Date().toISOString()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const createNewSession = () => {
    const newSession = { id: Date.now(), title: 'New Chat' };
    setSessions([newSession, ...sessions]);
    setActiveSession(newSession.id);
    setMessages([{ id: 1, role: 'assistant', content: 'How can I help you in this new session?', created_at: new Date().toISOString() }]);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 relative">
      <div className={`
        absolute md:relative z-20 md:z-0 h-full w-64 glass rounded-xl flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-[110%] md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-nova-border/50">
          <button 
            onClick={createNewSession}
            className="w-full bg-nova-blue/20 hover:bg-nova-blue/30 text-nova-blue border border-nova-blue/50 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium shadow-glow"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(session => (
            <div 
              key={session.id}
              onClick={() => { setActiveSession(session.id); setSidebarOpen(false); }}
              className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group transition-colors ${
                activeSession === session.id ? 'bg-nova-blue/20 border border-nova-blue/50' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="text-sm truncate pr-2">{session.title}</span>
              <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-nova-pink transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 glass rounded-xl flex flex-col relative overflow-hidden">
        <button 
          className="md:hidden absolute top-4 left-4 z-10 p-2 glass rounded-md text-nova-blue"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-hidden relative">
          <ChatBox messages={messages} isTyping={isTyping} />
        </div>

        <div className="p-4 border-t border-nova-border/50 bg-black/20">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Nova AI..."
              className="w-full bg-black/40 border border-nova-border rounded-full py-3 pl-6 pr-14 focus:outline-none focus:border-nova-blue focus:ring-1 focus:ring-nova-blue text-white shadow-inner"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 p-2 bg-nova-blue text-black rounded-full hover:bg-white transition-colors disabled:opacity-50 disabled:hover:bg-nova-blue"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
