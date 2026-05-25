import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AIOrb from '../components/AIOrb';
import VoiceButton from '../components/VoiceButton';
import voiceService from '../services/voiceService';

const VoiceAssistant = () => {
  const [state, setState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    return () => {
      voiceService.stopListening();
    };
  }, []);

  const toggleListening = () => {
    if (state === 'listening') {
      voiceService.stopListening();
      setState('thinking');
      setTimeout(() => {
        setState('speaking');
        setResponse("Processing your request...");
        setTimeout(() => setState('idle'), 2000);
      }, 1000);
    } else {
      setTranscript('');
      setResponse('');
      setState('listening');
      voiceService.startListening({
        onResult: (text) => setTranscript(text),
        onListening: (isListening) => {
          if (!isListening && state === 'listening') {
            setState('thinking');
            setTimeout(() => {
              setState('speaking');
              setResponse(`I heard: ${transcript || "nothing"}`);
              setTimeout(() => setState('idle'), 2000);
            }, 1000);
          }
        }
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] relative">
      <div className="absolute top-10 w-full max-w-lg text-center space-y-2">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: transcript ? 1 : 0 }}
          className="glass px-6 py-3 rounded-full inline-block border-nova-purple/50 text-gray-300"
        >
          "{transcript}"
        </motion.div>
      </div>

      <AIOrb state={state} size={280} onClick={toggleListening} />

      <div className="absolute bottom-32 w-full max-w-lg text-center space-y-2">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: response ? 1 : 0 }}
          className="text-nova-blue text-lg font-medium glow-text h-8"
        >
          {response}
        </motion.div>
      </div>

      <div className="absolute bottom-10">
        <VoiceButton isListening={state === 'listening'} onClick={toggleListening} />
      </div>

      {state === 'idle' && (
        <div className="absolute left-10 bottom-20 flex flex-col gap-3 hidden md:flex">
          {["Open YouTube", "Tell me the time", "Search for React docs"].map((cmd, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass px-4 py-2 rounded-lg text-sm text-gray-400 cursor-pointer hover:text-nova-blue hover:border-nova-blue transition-colors"
            >
              "{cmd}"
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
