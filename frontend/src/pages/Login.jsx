import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Loader } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import { login } from '../services/auth';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      setAuth(true);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials or network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nova-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass p-8 rounded-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Bot className="w-16 h-16 text-nova-blue mb-4 drop-shadow-[0_0_15px_rgba(0,212,255,0.8)]" />
          <h1 className="text-3xl font-bold text-white tracking-widest glow-text">NOVA AI</h1>
          <p className="text-nova-purple text-sm mt-1 uppercase tracking-widest font-mono">Your Intelligent Assistant</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="bg-nova-pink/20 border border-nova-pink text-nova-pink p-3 rounded-lg mb-6 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-nova-border focus:border-nova-blue focus:ring-1 focus:ring-nova-blue text-white outline-none transition-all"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-nova-border focus:border-nova-blue focus:ring-1 focus:ring-nova-blue text-white outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-nova-blue to-nova-purple text-white font-bold py-3 px-4 rounded-lg shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center disabled:opacity-70 mt-2"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'ACCESS SYSTEM'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Don't have an account? <Link to="/register" className="text-nova-blue hover:text-white transition-colors hover:glow-text">Register</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
