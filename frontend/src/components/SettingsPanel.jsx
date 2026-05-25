import React, { useState } from 'react';
import { Save, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPanel = ({ initialSettings = {}, onSave }) => {
  const [settings, setSettings] = useState({
    theme: initialSettings.theme || 'cyberpunk',
    assistantName: initialSettings.assistantName || 'Nova',
    voice: initialSettings.voice || 'Google US English',
    aiProvider: initialSettings.aiProvider || 'openai',
    apiKey: initialSettings.apiKey || '',
    notifications: initialSettings.notifications !== false,
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      if (onSave) onSave(settings);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-nova-blue mb-4 border-b border-nova-border/50 pb-2">Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
            <input type="text" readOnly value="Administrator" className="w-full px-4 py-2 rounded-lg bg-black/20 border border-nova-border/50 text-gray-400 cursor-not-allowed focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input type="email" readOnly value="admin@nova.ai" className="w-full px-4 py-2 rounded-lg bg-black/20 border border-nova-border/50 text-gray-400 cursor-not-allowed focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-nova-blue mb-4 border-b border-nova-border/50 pb-2">Appearance</h3>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Theme</label>
          <div className="grid grid-cols-3 gap-4">
            {['dark', 'midnight', 'cyberpunk'].map((t) => (
              <label key={t} className={`
                cursor-pointer p-4 rounded-lg border text-center capitalize transition-all
                ${settings.theme === t ? 'border-nova-blue bg-nova-blue/10 shadow-glow' : 'border-nova-border bg-white/5 hover:bg-white/10'}
              `}>
                <input 
                  type="radio" 
                  name="theme" 
                  value={t} 
                  checked={settings.theme === t} 
                  onChange={handleChange}
                  className="hidden" 
                />
                <span className={settings.theme === t ? 'text-white font-medium' : 'text-gray-400'}>{t}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-nova-blue mb-4 border-b border-nova-border/50 pb-2">Assistant Config</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Assistant Name</label>
            <input 
              type="text" 
              name="assistantName" 
              value={settings.assistantName} 
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Voice Profile</label>
            <select 
              name="voice" 
              value={settings.voice} 
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg appearance-none"
            >
              <option value="Google US English">Google US English</option>
              <option value="Microsoft Zira">Microsoft Zira</option>
              <option value="Microsoft David">Microsoft David</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-bold text-nova-blue mb-4 border-b border-nova-border/50 pb-2">AI Engine</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Provider</label>
            <select 
              name="aiProvider" 
              value={settings.aiProvider} 
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg appearance-none max-w-xs"
            >
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="gemini">Google Gemini</option>
              <option value="anthropic">Anthropic Claude</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">API Key</label>
            <input 
              type="password" 
              name="apiKey" 
              value={settings.apiKey} 
              onChange={handleChange}
              placeholder="Enter your API key..."
              className="w-full px-4 py-2 rounded-lg max-w-md"
            />
            <p className="text-xs text-gray-500 mt-2">Your key is encrypted and stored locally.</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">System Notifications</h3>
          <p className="text-sm text-gray-400">Receive alerts for completed tasks and messages.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            name="notifications"
            checked={settings.notifications}
            onChange={handleChange}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nova-blue shadow-[0_0_10px_rgba(0,212,255,0.3)]"></div>
        </label>
      </div>

      <div className="flex justify-end pt-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          disabled={saving}
          className="bg-gradient-to-r from-nova-blue to-nova-purple text-white px-8 py-3 rounded-lg font-bold tracking-wide flex items-center gap-2 shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-70"
        >
          {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Configuration'}
        </motion.button>
      </div>

      {saved && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 bg-green-500/20 border border-green-500 text-green-400 px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] glass z-50"
        >
          Settings updated successfully!
        </motion.div>
      )}
    </form>
  );
};

export default SettingsPanel;
