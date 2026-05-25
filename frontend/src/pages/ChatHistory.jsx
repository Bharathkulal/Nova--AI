import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, Trash2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([
    { id: 1, title: 'React Performance Optimization', date: '2023-10-25', count: 12, preview: 'How can I optimize large lists in React?' },
    { id: 2, title: 'Tailwind Animation Config', date: '2023-10-24', count: 8, preview: 'Help me set up keyframes in tailwind.config.js' },
    { id: 3, title: 'API Integration Error', date: '2023-10-22', count: 5, preview: 'I am getting a 401 Unauthorized error.' }
  ]);
  const [search, setSearch] = useState('');

  const filteredHistory = history.filter(h => h.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setHistory(history.filter(h => h.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white glow-text mb-1">Chat History</h2>
          <p className="text-gray-400 text-sm">Review your past conversations with Nova</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search history..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass pl-10 pr-4 py-2 rounded-full w-full md:w-64 focus:border-nova-blue focus:shadow-glow outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-12">
        {filteredHistory.length === 0 ? (
          <div className="glass p-12 rounded-xl flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p>No chat history found.</p>
          </div>
        ) : (
          filteredHistory.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={item.id}
              onClick={() => navigate('/chat')}
              className="glass p-5 rounded-xl cursor-pointer hover:bg-white/5 hover:border-nova-blue/30 transition-all group flex flex-col sm:flex-row justify-between sm:items-center gap-4"
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white group-hover:text-nova-blue transition-colors flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> {item.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{item.preview}</p>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{item.date}</span>
                </div>
                <div className="bg-white/10 px-2 py-1 rounded text-xs font-mono">
                  {item.count} msgs
                </div>
                <button 
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-2 rounded-md hover:bg-nova-pink/20 text-gray-500 hover:text-nova-pink transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
