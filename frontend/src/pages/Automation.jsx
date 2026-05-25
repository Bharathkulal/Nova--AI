import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Play, Code, MessageSquare, User, Calculator, FileText, Cloud, Clock, Search, Link2 } from 'lucide-react';

const Automation = () => {
  const categories = [
    {
      title: "Websites",
      items: [
        { name: "YouTube", icon: Play, color: "text-red-500", url: "https://youtube.com" },
        { name: "Google", icon: Globe, color: "text-blue-400", url: "https://google.com" },
        { name: "GitHub", icon: Code, color: "text-white", url: "https://github.com" },
        { name: "Twitter", icon: MessageSquare, color: "text-blue-400", url: "https://twitter.com" },
        { name: "LinkedIn", icon: User, color: "text-blue-600", url: "https://linkedin.com" },
        { name: "Reddit", icon: Link2, color: "text-orange-500", url: "https://reddit.com" }
      ]
    },
    {
      title: "Tools",
      items: [
        { name: "Calculator", icon: Calculator, color: "text-nova-blue", action: () => window.open('https://google.com/search?q=calculator') },
        { name: "Notepad", icon: FileText, color: "text-nova-purple", action: () => alert('Opening Notepad') },
        { name: "Weather", icon: Cloud, color: "text-nova-blue", action: () => window.open('https://weather.com') },
        { name: "Clock", icon: Clock, color: "text-nova-pink", action: () => alert(`Current Time: ${new Date().toLocaleTimeString()}`) }
      ]
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white glow-text mb-1">Automation Hub</h2>
          <p className="text-gray-400 text-sm">Quick access to tools and external services</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search tools..." 
            className="glass pl-10 pr-4 py-2 rounded-full w-full md:w-64 focus:border-nova-blue focus:shadow-glow outline-none text-sm"
          />
        </div>
      </div>

      <div className="space-y-8">
        {categories.map((category, idx) => (
          <div key={idx}>
            <h3 className="text-lg font-bold text-white mb-4 border-b border-nova-border/50 pb-2">{category.title}</h3>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {category.items.map((tool, i) => (
                <motion.div
                  variants={item}
                  key={i}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => tool.url ? window.open(tool.url, '_blank') : tool.action()}
                  className="glass p-6 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer group hover:border-nova-blue/50 transition-colors relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <tool.icon className={`w-10 h-10 ${tool.color} drop-shadow-lg z-10 group-hover:scale-110 transition-transform`} />
                  <span className="text-sm font-medium text-gray-300 z-10 group-hover:text-white transition-colors">{tool.name}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Automation;
