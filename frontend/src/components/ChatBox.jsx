import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

const ChatBox = ({ messages = [], isTyping = false }) => {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full w-full">
      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user';
        return (
          <motion.div
            key={msg.id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-glow ${isUser ? 'bg-gradient-to-tr from-nova-purple to-nova-pink' : 'bg-gradient-to-tr from-nova-blue to-nova-purple'}`}>
                {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-4 rounded-xl ${isUser ? 'bg-nova-purple/20 border border-nova-purple/30 text-white rounded-tr-none' : 'glass border-l-2 border-l-nova-blue rounded-tl-none'}`}>
                <p className="whitespace-pre-wrap leading-relaxed text-sm">
                  {msg.content}
                </p>
                {msg.created_at && (
                  <span className="text-[10px] text-gray-500 mt-2 block text-right">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full justify-start"
        >
          <div className="flex gap-3 max-w-[80%] flex-row">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-nova-blue to-nova-purple flex items-center justify-center shrink-0 shadow-glow">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="p-4 rounded-xl glass border-l-2 border-l-nova-blue rounded-tl-none flex items-center gap-1">
              <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-nova-blue rounded-full" />
              <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-nova-blue rounded-full" />
              <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-nova-blue rounded-full" />
            </div>
          </div>
        </motion.div>
      )}

      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatBox;
