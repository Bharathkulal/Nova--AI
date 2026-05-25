import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bot, LayoutDashboard, MessageSquare, Mic, Zap, History, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Voice', path: '/voice', icon: Mic },
    { name: 'Automation', path: '/automation', icon: Zap },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 glass flex flex-col border-r border-nova-border">
      <div className="p-6 flex items-center gap-3 text-nova-blue font-bold text-xl">
        <Bot size={28} /> NOVA AI
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map(link => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) => 
              `flex items-center gap-3 p-3 rounded-lg transition-all ${
                isActive ? 'bg-nova-blue/10 text-nova-blue border-l-2 border-nova-blue' : 'hover:bg-nova-blue/5 hover:text-nova-blue'
              }`
            }
          >
            <link.icon size={20} /> {link.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-nova-border">
        <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} className="flex items-center gap-3 w-full p-3 text-nova-pink hover:bg-nova-pink/10 rounded-lg transition-all">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}
