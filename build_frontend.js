const fs = require('fs');
const path = require('path');

const frontendDir = 'd:/Nova -AI/frontend/src';
const dirs = ['services', 'components', 'pages', 'layouts'];

dirs.forEach(d => {
  fs.mkdirSync(path.join(frontendDir, d), { recursive: true });
});

const files = {
  'services/api.js': `import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:5000/api' });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});
export default api;`,
  'services/auth.js': `import api from './api';
export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  if (res.data.access_token) localStorage.setItem('token', res.data.access_token);
  return res.data;
};`,
  'components/LoadingScreen.jsx': `import React from 'react';
import { motion } from 'framer-motion';
export default function LoadingScreen({ onComplete }) {
  return (
    <div className="fixed inset-0 bg-nova-dark flex flex-col items-center justify-center z-50">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="text-4xl font-bold text-nova-blue mb-8 glow-text">NOVA AI</motion.div>
      <div className="w-64 h-2 bg-nova-card rounded-full overflow-hidden">
        <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3.5 }} onAnimationComplete={onComplete} className="h-full bg-nova-blue shadow-glow" />
      </div>
    </div>
  );
}`
};

Object.entries(files).forEach(([filePath, content]) => {
  fs.writeFileSync(path.join(frontendDir, filePath), content);
});

console.log('Done');
