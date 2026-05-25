import React from 'react';
import { Bell, User } from 'lucide-react';

export default function Navbar({ title }) {
  return (
    <div className="h-16 glass flex items-center justify-between px-8 border-b border-nova-border sticky top-0 z-40">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-6 text-white">
        <div className="relative cursor-pointer hover:text-nova-blue transition-colors">
          <Bell size={20} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-nova-pink rounded-full"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Online</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-nova-purple flex items-center justify-center">
          <User size={16} />
        </div>
      </div>
    </div>
  );
}
