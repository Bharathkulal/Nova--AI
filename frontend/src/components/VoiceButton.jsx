import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

const VoiceButton = ({ isListening, onClick }) => {
  return (
    <div className="relative flex items-center justify-center">
      {isListening && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border border-nova-blue"
            animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-nova-purple"
            animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.5 }}
          />
          <div className="absolute -inset-6 flex items-center justify-around pointer-events-none">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-nova-blue rounded-full"
                animate={{ height: ['10%', '60%', '20%', '100%', '10%'] }}
                transition={{
                  repeat: Infinity,
                  duration: 1 + Math.random() * 0.5,
                  delay: Math.random() * 0.5
                }}
              />
            ))}
          </div>
        </>
      )}
      
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-glow transition-colors ${
          isListening ? 'bg-nova-pink text-white shadow-[0_0_15px_#ff2d95]' : 'bg-gradient-to-tr from-nova-blue to-nova-purple text-white'
        }`}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </motion.button>
    </div>
  );
};

export default VoiceButton;
