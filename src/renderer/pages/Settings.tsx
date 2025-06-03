import React, { useState } from 'react';
import { FiMoon, FiSun, FiDownload, FiUpload, FiTrash2, FiInfo, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../hooks/useSettings';
import { useIcons } from '../hooks/useIcons';

const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { settings, exportData, importData, clearAllData, checkForUpdates, downloadUpdate, installUpdate } = useSettings();
  const { icons } = useIcons();
  const [updateInfo, setUpdateInfo] = useState<{ available: boolean; version?: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleExportData = async () => {
    try {
      const filePath = await exportData();
      if (filePath) {
        window.electron.utils.showItemInFolder(filePath);
      }
    } catch (error: any) {
      console.error('Failed to export data:', error);
      // You might want to show an error notification to the user here
    }
  };

  const handleImportData = async () => {
    try {
      // For now, we'll use a hardcoded path for testing
      // In a real app, you would implement a proper file picker
      const filePath = 'C:/Users/lucap/Documents/icon-maker/data/backup.json';
      const success = await importData(filePath);
      if (success) {
        window.location.reload(); // Reload to reflect imported data
      }
    } catch (error: any) {
      console.error('Failed to import data:', error);
      // You might want to show an error notification to the user here
    }
  };

  const handleClearData = async () => {
    try {
      const success = await clearAllData();
      if (success) {
        window.location.reload(); // Reload to reflect cleared data
      }
    } catch (error: any) {
      console.error('Failed to clear data:', error);
      // You might want to show an error notification to the user here
    }
  };

  const handleCheckUpdates = async () => {
    try {
      const info = await checkForUpdates();
      if (info) {
        setUpdateInfo({
          available: info.updateAvailable,
          version: info.newVersion
        });
      }
    } catch (error: any) {
      console.error('Failed to check for updates:', error);
      // You might want to show an error notification to the user here
    }
  };

  const handleUpdateApp = async () => {
    if (!updateInfo?.available) return;
    
    try {
      setIsUpdating(true);
      const downloaded = await downloadUpdate();
      if (downloaded) {
        await installUpdate(); // This will quit and install
      }
    } catch (error: any) {
      console.error('Failed to update app:', error);
      // You might want to show an error notification to the user here
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenGitHub = () => {
    try {
      window.electron.utils.openExternal('https://github.com/yourusername/icon-maker');
    } catch (error: any) {
      console.error('Failed to open GitHub:', error);
      // You might want to show an error notification to the user here
    }
  };

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
                <p className="text-sm text-[var(--text-secondary)]">
                  Currently using {isDarkMode ? 'dark' : 'light'} mode
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
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
                <p className="text-sm text-[var(--text-secondary)]">
                  Download all your icons and settings ({icons.length} icons)
                </p>
              </div>
              <button 
                onClick={handleExportData}
                className="btn-secondary flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">Import Data</h3>
                <p className="text-sm text-[var(--text-secondary)]">Restore from a backup file</p>
              </div>
              <button 
                onClick={handleImportData}
                className="btn-secondary flex items-center gap-2"
              >
                <FiUpload className="w-4 h-4" />
                <span>Import</span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">Clear Data</h3>
                <p className="text-sm text-[var(--text-secondary)]">Delete all your icons and settings</p>
              </div>
              <button 
                onClick={handleClearData}
                className="btn-danger flex items-center gap-2"
              >
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
                <p className="text-sm text-[var(--text-secondary)]">
                  {settings?.theme ? '1.0.0' : 'Loading...'}
                  {updateInfo && updateInfo.available && (
                    <span className="ml-2 text-green-500">
                      (Update available: v{updateInfo.version})
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {updateInfo?.available ? (
                  <button 
                    onClick={handleUpdateApp}
                    disabled={isUpdating}
                    className="btn-primary flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <FiDownload className="w-4 h-4" />
                        <span>Update Now</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button 
                    onClick={handleCheckUpdates}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FiInfo className="w-4 h-4" />
                    <span>Check for Updates</span>
                  </button>
                )}
              </div>
            </div>
            
            {updateInfo && !updateInfo.available && (
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <FiCheckCircle className="w-4 h-4" />
                <span>You're using the latest version</span>
              </div>
            )}
          </div>
        </div>

        {/* Resources */}
        <div className="card">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Resources</h2>
          <div className="space-y-4">
            <button
              onClick={handleOpenGitHub}
              className="w-full text-left px-4 py-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <h3 className="font-medium text-[var(--text-primary)]">GitHub Repository</h3>
              <p className="text-sm text-[var(--text-secondary)]">View source code and contribute</p>
            </button>
            <button
              onClick={() => window.electron.utils.openExternal('https://github.com/yourusername/icon-maker/issues')}
              className="w-full text-left px-4 py-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <h3 className="font-medium text-[var(--text-primary)]">Report Issues</h3>
              <p className="text-sm text-[var(--text-secondary)]">Found a bug? Let us know</p>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">{icons.length}</div>
            <div className="text-sm text-[var(--text-secondary)]">Total Icons</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">
              {icons.reduce((acc, icon) => acc + icon.sizes.length, 0)}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Total Files</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">
              {[...new Set(icons.map(icon => icon.style))].length}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Unique Styles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">
              {icons.length > 0 ? Math.round(icons.reduce((acc, icon) => acc + icon.sizes.length, 0) / icons.length) : 0}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Avg Sizes/Icon</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;