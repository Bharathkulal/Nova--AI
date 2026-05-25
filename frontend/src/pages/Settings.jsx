import React from 'react';
import SettingsPanel from '../components/SettingsPanel';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white glow-text mb-1">System Settings</h2>
        <p className="text-gray-400 text-sm">Configure your Nova AI experience</p>
      </div>

      <SettingsPanel />
    </div>
  );
};

export default Settings;
