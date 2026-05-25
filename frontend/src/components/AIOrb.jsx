import React from 'react';
import { motion } from 'framer-motion';

const AIOrb = ({ state = 'idle', onClick, size = 200 }) => {
  const getOrbStateStyles = () => {
    switch (state) {
      case 'listening':
        return {
          pulseSpeed: 1,
          scale: 1.1,
          glow: '0 0 60px rgba(0, 212, 255, 0.8)',
          ringSpeeds: [2, 3, 4]
        };
      case 'thinking':
        return {
          pulseSpeed: 0.5,
          scale: 1,
          glow: '0 0 40px rgba(123, 47, 247, 0.6)',
          ringSpeeds: [1, 1.5, 2]
        };
      case 'speaking':
        return {
          pulseSpeed: 0.2,
          scale: 1.05,
          glow: '0 0 50px rgba(0, 212, 255, 0.6)',
          ringSpeeds: [3, 4, 5]
        };
      case 'idle':
      default:
        return {
          pulseSpeed: 2,
          scale: 1,
          glow: '0 0 30px rgba(0, 212, 255, 0.4)',
          ringSpeeds: [8, 12, 15]
        };
    }
  };

  const styles = getOrbStateStyles();

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.div 
        className="relative cursor-pointer"
        style={{ width: size, height: size }}
        onClick={onClick}
        animate={{ scale: styles.scale }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-nova-blue to-nova-purple z-10"
          animate={{ boxShadow: styles.glow }}
          transition={{ duration: 0.3 }}
        />
        
        {state === 'speaking' && (
          <motion.div 
            className="absolute inset-0 rounded-full bg-white/20 z-20"
            animate={{ scale: [1, 0.8, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
        )}

        <motion.div 
          className="absolute -inset-4 rounded-full border-2 border-nova-blue border-t-transparent border-b-transparent opacity-50 z-0"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: styles.ringSpeeds[0], ease: "linear" }}
        />
        
        <motion.div 
          className="absolute -inset-8 rounded-full border-2 border-nova-purple border-l-transparent border-r-transparent opacity-30 z-0"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: styles.ringSpeeds[1], ease: "linear" }}
        />

        <motion.div 
          className="absolute -inset-12 rounded-full border border-nova-blue/20 border-dashed z-0"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: styles.ringSpeeds[2], ease: "linear" }}
        />
      </motion.div>

      <div className="text-center font-mono text-sm">
        <span className="text-nova-blue glow-text uppercase tracking-widest">
          {state === 'idle' && "System Online"}
          {state === 'listening' && "Awaiting Audio..."}
          {state === 'thinking' && "Processing Data..."}
          {state === 'speaking' && "Synthesizing..."}
        </span>
      </div>
    </div>
  );
};

export default AIOrb;
