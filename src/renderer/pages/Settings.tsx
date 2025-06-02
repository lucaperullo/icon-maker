import React from 'react';
import { FiMoon, FiSun, FiDownload, FiUpload, FiTrash2, FiInfo } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="card">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">Theme</h3>
                <p className="text-sm text-[var(--text-secondary)]">Choose between light and dark mode</p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              >
                {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Data Management</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">Export Data</h3>
                <p className="text-sm text-[var(--text-secondary)]">Download all your icons and settings</p>
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <FiDownload className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">Import Data</h3>
                <p className="text-sm text-[var(--text-secondary)]">Restore from a backup file</p>
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <FiUpload className="w-4 h-4" />
                <span>Import</span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">Clear Data</h3>
                <p className="text-sm text-[var(--text-secondary)]">Delete all your icons and settings</p>
              </div>
              <button className="btn-danger flex items-center gap-2">
                <FiTrash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">About</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">Version</h3>
                <p className="text-sm text-[var(--text-secondary)]">1.0.0</p>
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <FiInfo className="w-4 h-4" />
                <span>Check for Updates</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 