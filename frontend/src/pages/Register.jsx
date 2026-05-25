import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Loader } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import { register } from '../services/auth';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nova-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass p-8 rounded-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <Bot className="w-12 h-12 text-nova-blue mb-2 drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
          <h2 className="text-2xl font-bold text-white tracking-wider glow-text">INITIALIZE USER</h2>
        </div>

        {error && (
          <div className="bg-nova-pink/20 border border-nova-pink text-nova-pink p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 p-3 rounded-lg mb-4 text-sm text-center shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input 
              type="text" name="username" required value={formData.username} onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-black/30 border border-nova-border focus:border-nova-blue outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input 
              type="email" name="email" required value={formData.email} onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-black/30 border border-nova-border focus:border-nova-blue outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              type="password" name="password" required value={formData.password} onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-black/30 border border-nova-border focus:border-nova-blue outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <input 
              type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-black/30 border border-nova-border focus:border-nova-blue outline-none transition-all"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-nova-purple to-nova-blue text-white font-bold py-3 px-4 rounded-lg shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center disabled:opacity-70 mt-4"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'REGISTER'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-nova-blue hover:text-white transition-colors hover:glow-text">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
