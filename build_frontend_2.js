import os

frontend_dir = "d:/Nova -AI/frontend/src"

files = {
    "components/Sidebar.jsx": """import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bot, LayoutDashboard, MessageSquare, Mic, Zap, History, Settings, LogOut } from 'lucide-react';
import { logout } from '../services/auth';

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
        <button onClick={logout} className="flex items-center gap-3 w-full p-3 text-nova-pink hover:bg-nova-pink/10 rounded-lg transition-all">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}
""",
    "components/Navbar.jsx": """import React from 'react';
import { Bell, User } from 'lucide-react';

export default function Navbar({ title }) {
  return (
    <div className="h-16 glass flex items-center justify-between px-8 border-b border-nova-border sticky top-0 z-40">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-6">
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
""",
    "components/AIOrb.jsx": """import React from 'react';
import { motion } from 'framer-motion';

export default function AIOrb({ state = 'idle', onClick }) {
  // states: idle, listening, thinking, speaking
  const isListening = state === 'listening';
  
  return (
    <div className="relative w-48 h-48 mx-auto cursor-pointer flex items-center justify-center" onClick={onClick}>
      {/* Outer rings */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: isListening ? 2 : 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-nova-blue/30 border-dashed"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: isListening ? 3 : 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-4 rounded-full border border-nova-purple/40"
      />
      
      {/* Core Orb */}
      <motion.div 
        animate={{ scale: isListening ? [1, 1.1, 1] : [1, 1.05, 1] }}
        transition={{ duration: isListening ? 0.5 : 2, repeat: Infinity }}
        className="w-32 h-32 rounded-full bg-gradient-to-br from-nova-blue to-nova-purple shadow-glow-lg flex items-center justify-center"
      >
        <div className="w-24 h-24 rounded-full bg-black/20 blur-sm"></div>
      </motion.div>
    </div>
  );
}
""",
    "components/ParticleBackground.jsx": """import React, { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    // Init particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 - dist/1500})`;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[-1]" />;
}
""",
    "layouts/MainLayout.jsx": """import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';
import { useLocation } from 'react-router-dom';

export default function MainLayout({ children }) {
  const location = useLocation();
  const title = location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(2);

  return (
    <div className="flex min-h-screen">
      <ParticleBackground />
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar title={title} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
""",
    "pages/Login.jsx": """import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import { login } from '../services/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <ParticleBackground />
      <div className="w-full max-w-md p-8 glass rounded-2xl shadow-glow">
        <div className="flex flex-col items-center mb-8 text-nova-blue">
          <Bot size={48} className="mb-2" />
          <h1 className="text-2xl font-bold glow-text">NOVA AI</h1>
          <p className="text-sm text-gray-400">Intelligent Assistant Access</p>
        </div>
        
        {error && <div className="p-3 mb-4 bg-nova-pink/20 border border-nova-pink rounded text-nova-pink text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-nova-darker border border-nova-border focus:border-nova-blue focus:shadow-glow outline-none text-white transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-nova-darker border border-nova-border focus:border-nova-blue focus:shadow-glow outline-none text-white transition-all"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full p-3 mt-4 bg-gradient-to-r from-nova-blue to-nova-purple text-white font-bold rounded shadow-glow hover:shadow-glow-lg transition-all"
          >
            {loading ? 'Authenticating...' : 'ACCESS SYSTEM'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          No access credentials? <Link to="/register" className="text-nova-blue hover:underline">Request Access</Link>
        </p>
      </div>
    </div>
  );
}
"""
}

for path, content in files.items():
    full_path = os.path.join(frontend_dir, path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Generated frontend components, layouts, and login page.")
