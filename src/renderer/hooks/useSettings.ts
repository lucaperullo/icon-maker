// src/renderer/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';

interface Settings {
  theme: 'light' | 'dark';
  defaultExportPath: string;
  autoSave: boolean;
}

interface UpdateInfo {
  updateAvailable: boolean;
  currentVersion: string;
  newVersion?: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.settings.get();
      if (result.success) {
        setSettings(result.settings);
      } else {
        setError(result.error || 'Failed to load settings');
      }
    } catch (err) {
      setError('Failed to load settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.settings.update(newSettings);
      if (result.success) {
        setSettings(prev => prev ? { ...prev, ...newSettings } : null);
        return true;
      } else {
        setError(result.error || 'Failed to update settings');
        return false;
      }
    } catch (err) {
      setError('Failed to update settings');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.data.export();
      if (result.success) {
        return result.filePath;
      } else {
        setError(result.error || 'Failed to export data');
        return null;
      }
    } catch (err) {
      setError('Failed to export data');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const importData = useCallback(async (filePath: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.data.import(filePath);
      if (result.success) {
        await loadSettings(); // Reload settings after import
        return true;
      } else {
        setError(result.error || 'Failed to import data');
        return false;
      }
    } catch (err) {
      setError('Failed to import data');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadSettings]);

  const clearAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.data.clear();
      if (result.success) {
        await loadSettings(); // Reload settings after clear
        return true;
      } else {
        setError(result.error || 'Failed to clear data');
        return false;
      }
    } catch (err) {
      setError('Failed to clear data');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadSettings]);

  const checkForUpdates = useCallback(async (): Promise<UpdateInfo | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.update.check();
      if (result.success) {
        return {
          updateAvailable: result.updateAvailable ?? false,
          currentVersion: result.currentVersion ?? 'unknown',
          newVersion: result.newVersion
        };
      } else {
        setError(result.error || 'Failed to check for updates');
        return null;
      }
    } catch (err) {
      setError('Failed to check for updates');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadUpdate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.update.download();
      if (result.success) {
        return true;
      } else {
        setError(result.error || 'Failed to download update');
        return false;
      }
    } catch (err) {
      setError('Failed to download update');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const installUpdate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electron.update.install();
      // App will quit and install, so this might not return
      return result.success ?? false;
    } catch (err) {
      setError('Failed to install update');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    refresh: loadSettings,
  }
}
