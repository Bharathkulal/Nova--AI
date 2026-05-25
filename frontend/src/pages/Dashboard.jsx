import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Mic, Zap, Settings as SettingsIcon } from 'lucide-react';
import AIOrb from '../components/AIOrb';
import { ClockWidget, WeatherWidget, BatteryWidget, NetworkWidget, AIStatusWidget, ProfileCard } from '../components/WidgetCards';
import { getCurrentUser } from '../services/auth';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <section className="flex flex-col items-center justify-center py-8">
        <AIOrb state="idle" size={160} />
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-bold mt-8 mb-2"
        >
          Welcome back, <span className="text-nova-blue glow-text">{user?.username || 'User'}</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-400 font-mono text-sm"
        >
          Nova AI is online and ready
        </motion.p>
      </section>

      <motion.section 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="h-40"><ClockWidget /></motion.div>
        <motion.div variants={item} className="h-40"><WeatherWidget /></motion.div>
        <motion.div variants={item} className="h-40"><BatteryWidget /></motion.div>
        <motion.div variants={item} className="h-40"><NetworkWidget /></motion.div>
        <motion.div variants={item} className="h-40"><AIStatusWidget /></motion.div>
        <motion.div variants={item} className="h-40"><ProfileCard /></motion.div>
      </motion.section>

      <section>
        <h3 className="text-xl font-bold mb-4 text-white">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Start Chat", icon: MessageSquare, path: "/chat", color: "nova-blue" },
            { title: "Voice Assistant", icon: Mic, path: "/voice", color: "nova-pink" },
            { title: "Automations", icon: Zap, path: "/automation", color: "nova-purple" },
            { title: "Settings", icon: SettingsIcon, path: "/settings", color: "gray-400" }
          ].map((action, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="glass p-6 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all group border-b-4 border-transparent hover:border-nova-blue"
            >
              <action.icon className={`w-8 h-8 text-${action.color} group-hover:scale-110 transition-transform`} />
              <span className="font-semibold">{action.title}</span>
            </motion.button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 text-white">Recent Activity</h3>
        <div className="glass rounded-xl overflow-hidden">
          {[
            { title: "System Login", time: "2 mins ago", desc: "Access granted from known device." },
            { title: "Chat Session", time: "1 hour ago", desc: "Discussed React optimizations." },
            { title: "Automation Task", time: "3 hours ago", desc: "Executed daily system check." },
          ].map((log, i) => (
            <div key={i} className="p-4 border-b border-nova-border/30 flex items-start gap-4 hover:bg-white/5 transition-colors">
              <div className="w-2 h-2 rounded-full bg-nova-blue mt-2 shadow-glow"></div>
              <div>
                <div className="flex justify-between items-center w-full">
                  <h4 className="font-semibold text-white">{log.title}</h4>
                  <span className="text-xs text-gray-500 font-mono">{log.time}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{log.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
