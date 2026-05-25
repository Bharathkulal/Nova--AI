import React, { useState, useEffect } from 'react';
import { Cloud, Zap, Wifi, WifiOff, Bot, Calendar, Battery, BatteryCharging } from 'lucide-react';

export const ClockWidget = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center h-full relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-nova-blue/10 rounded-full blur-2xl group-hover:bg-nova-blue/20 transition-colors" />
      <span className="text-4xl font-bold glow-text tracking-wider font-mono">
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </span>
      <div className="flex items-center gap-2 mt-2 text-nova-purple">
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

export const WeatherWidget = () => {
  return (
    <div className="glass rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden group">
      <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-nova-purple/10 rounded-full blur-2xl group-hover:bg-nova-purple/20 transition-colors" />
      <div className="flex justify-between items-start">
        <div>
          <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Weather</span>
          <h3 className="text-xl font-bold mt-1">San Francisco</h3>
        </div>
        <Cloud className="w-8 h-8 text-nova-blue" />
      </div>
      <div className="flex items-end gap-2 mt-4">
        <span className="text-4xl font-bold text-white glow-text">72°</span>
        <span className="text-nova-blue mb-1 font-medium">Clear Sky</span>
      </div>
    </div>
  );
};

export const BatteryWidget = () => {
  const [level, setLevel] = useState(100);
  const [charging, setCharging] = useState(false);

  useEffect(() => {
    let active = true;
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        if(!active) return;
        setLevel(Math.round(battery.level * 100));
        setCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setCharging(battery.charging);
        });
      });
    }
    return () => { active = false; };
  }, []);

  return (
    <div className="glass rounded-2xl p-6 flex flex-col justify-between h-full group">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Power</span>
        {charging ? <BatteryCharging className="w-6 h-6 text-green-400" /> : <Battery className="w-6 h-6 text-nova-blue" />}
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold">{level}%</span>
        <span className="text-xs text-gray-400 mb-1">{charging ? 'Charging' : 'On Battery'}</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${level > 20 ? (charging ? 'bg-green-400' : 'bg-nova-blue shadow-glow') : 'bg-nova-pink shadow-[0_0_10px_#ff2d95]'}`} 
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
};

export const NetworkWidget = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="glass rounded-2xl p-6 flex items-center gap-4 h-full group hover:border-nova-blue/30 transition-colors">
      <div className={`p-4 rounded-xl ${isOnline ? 'bg-green-400/10 text-green-400' : 'bg-nova-pink/10 text-nova-pink'}`}>
        {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
      </div>
      <div>
        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1">Network</span>
        <span className="text-lg font-bold">{isOnline ? 'Connected' : 'Disconnected'}</span>
      </div>
    </div>
  );
};

export const AIStatusWidget = () => {
  return (
    <div className="glass rounded-2xl p-6 flex items-center justify-between h-full group hover:bg-white/5 transition-all">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-nova-blue to-nova-purple flex items-center justify-center shadow-glow">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-nova-card rounded-full animate-pulse shadow-[0_0_8px_#4ade80]"></span>
        </div>
        <div>
          <h3 className="text-lg font-bold glow-text">Nova Core</h3>
          <span className="text-xs text-nova-blue uppercase tracking-widest font-mono">Systems Nominal</span>
        </div>
      </div>
      <Zap className="w-6 h-6 text-nova-purple opacity-50" />
    </div>
  );
};

export const ProfileCard = () => {
  return (
    <div className="glass rounded-2xl p-6 flex items-center gap-4 h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-nova-blue/20 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border-2 border-nova-blue shadow-glow z-10 shrink-0">
        <span className="text-xl font-bold">U</span>
      </div>
      <div className="z-10">
        <h3 className="text-lg font-bold">Administrator</h3>
        <span className="text-sm text-gray-400">admin@nova.ai</span>
      </div>
    </div>
  );
};
