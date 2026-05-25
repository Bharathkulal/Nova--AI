import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    "[OK] Neural Core",
    "[OK] Voice Module",
    "[OK] Database Connected",
    "[OK] AI Engine Ready"
  ];

  useEffect(() => {
    const startTime = Date.now();
    const duration = 3500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 25 && statusIndex < 1) setStatusIndex(1);
      if (newProgress >= 50 && statusIndex < 2) setStatusIndex(2);
      if (newProgress >= 75 && statusIndex < 3) setStatusIndex(3);
      if (newProgress >= 90 && statusIndex < 4) setStatusIndex(4);

      if (newProgress === 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 500); 
      }
    }, 50);

    return () => clearInterval(interval);
  }, [statusIndex, onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-nova-dark z-50 flex flex-col items-center justify-center p-8"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md flex flex-col items-center">
        <motion.h1 
          className="text-5xl font-bold text-nova-blue glow-text tracking-widest mb-2 overflow-hidden whitespace-nowrap"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "linear" }}
        >
          NOVA AI
        </motion.h1>
        <motion.p 
          className="text-nova-purple mb-12 text-sm tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Initializing Systems...
        </motion.p>

        <div className="w-full bg-nova-darker border border-nova-border rounded-full h-2 mb-8 overflow-hidden relative glass">
          <motion.div 
            className="h-full bg-nova-blue shadow-glow"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="w-full flex flex-col gap-2 text-xs font-mono text-nova-blue">
          {statuses.slice(0, statusIndex).map((status, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-left"
            >
              {status}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
