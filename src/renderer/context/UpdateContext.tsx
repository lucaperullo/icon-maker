// src/renderer/context/UpdateContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion?: string;
  changelog?: string;
  mandatory?: boolean;
  downloadProgress?: {
    percent: number;
    transferred: number;
    total: number;
    bytesPerSecond: number;
  };
}

interface UpdateSettings {
  autoCheck: boolean;
  lastCheckTime: number;
  checkInterval: number;
  skipVersion?: string;
  beta: boolean;
}

interface UpdateContextType {
  updateInfo: UpdateInfo | null;
  isChecking: boolean;
  isDownloading: boolean;
  isUpdateReady: boolean;
  error: string | null;
  settings: UpdateSettings | null;
  checkForUpdates: (silent?: boolean) => Promise<void>;
  downloadUpdate: () => Promise<void>;
  installUpdate: () => Promise<void>;
  skipVersion: (version: string) => Promise<void>;
  updateSettings: (settings: Partial<UpdateSettings>) => Promise<void>;
  dismissError: () => void;
  showUpdateNotification: boolean;
  setShowUpdateNotification: (show: boolean) => void;
}

const UpdateContext = createContext<UpdateContextType | undefined>(undefined);

export const UpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpdateReady, setIsUpdateReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UpdateSettings | null>(null);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const eventListenerRef = useRef<(() => void) | null>(null);

  // Load update settings on mount
  useEffect(() => {
    loadUpdateSettings();
  }, []);

  // Setup update event listener
  useEffect(() => {
    if (window.electron?.update?.onEvent) {
      const removeListener = window.electron.update.onEvent((event: string, data?: any) => {
        handleUpdateEvent(event, data);
      });
      
      eventListenerRef.current = removeListener;
      
      return () => {
        if (eventListenerRef.current) {
          eventListenerRef.current();
        }
      };
    }
  }, []);

  const loadUpdateSettings = useCallback(async () => {
    try {
      const result = await window.electron.update.settings.get();
      if (result.success && result.settings) {
        setSettings(result.settings);
      }
    } catch (err) {
      console.error('Failed to load update settings:', err);
    }
  }, []);

  const handleUpdateEvent = useCallback((event: string, data?: any) => {
    console.log('Update event:', event, data);
    
    switch (event) {
      case 'update-checking':
        setIsChecking(true);
        setError(null);
        break;
        
      case 'update-available':
        setIsChecking(false);
        setUpdateInfo({
          available: true,
          currentVersion: data?.currentVersion || '',
          latestVersion: data?.version,
          changelog: data?.changelog,
          mandatory: data?.mandatory || false
        });
        if (!data?.silent) {
          setShowUpdateNotification(true);
        }
        break;
        
      case 'update-available-silent':
        // Silent update notification - show non-intrusive notification
        setUpdateInfo({
          available: true,
          currentVersion: data?.currentVersion || '',
          latestVersion: data?.version,
          changelog: data?.changelog,
          mandatory: data?.mandatory || false
        });
        setShowUpdateNotification(true);
        break;
        
      case 'update-not-available':
        setIsChecking(false);
        setUpdateInfo({
          available: false,
          currentVersion: data?.currentVersion || ''
        });
        break;
        
      case 'update-downloading':
        setIsDownloading(true);
        setError(null);
        break;
        
      case 'update-download-progress':
        setUpdateInfo(prev => prev ? {
          ...prev,
          downloadProgress: {
            percent: data?.percent || 0,
            transferred: data?.transferred || 0,
            total: data?.total || 0,
            bytesPerSecond: data?.bytesPerSecond || 0
          }
        } : null);
        break;
        
      case 'update-downloaded':
        setIsDownloading(false);
        setIsUpdateReady(true);
        setUpdateInfo(prev => prev ? {
          ...prev,
          downloadProgress: undefined
        } : null);
        break;
        
      case 'update-error':
        setIsChecking(false);
        setIsDownloading(false);
        setError(data?.error || 'Unknown update error');
        break;
        
      default:
        console.log('Unknown update event:', event, data);
    }
  }, []);

  const checkForUpdates = useCallback(async (silent: boolean = false) => {
    try {
      setIsChecking(true);
      setError(null);
      
      const result = await window.electron.update.check(silent);
      
      if (!result.success) {
        setError(result.error || 'Failed to check for updates');
        setIsChecking(false);
      }
      // Note: The actual update info will be set via events
    } catch (err: any) {
      setError(err.message || 'Failed to check for updates');
      setIsChecking(false);
    }
  }, []);

  const downloadUpdate = useCallback(async () => {
    try {
      setIsDownloading(true);
      setError(null);
      
      const result = await window.electron.update.download();
      
      if (!result.success) {
        setError(result.error || 'Failed to download update');
        setIsDownloading(false);
      }
      // Note: Download progress will be updated via events
    } catch (err: any) {
      setError(err.message || 'Failed to download update');
      setIsDownloading(false);
    }
  }, []);

  const installUpdate = useCallback(async () => {
    try {
      await window.electron.update.install();
      // App will quit and restart, so this might not return
    } catch (err: any) {
      setError(err.message || 'Failed to install update');
    }
  }, []);

  const skipVersion = useCallback(async (version: string) => {
    try {
      const result = await window.electron.update.skipVersion(version);
      
      if (result.success) {
        setUpdateInfo(null);
        setShowUpdateNotification(false);
        await loadUpdateSettings(); // Reload settings to reflect the skip
      } else {
        setError(result.error || 'Failed to skip version');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to skip version');
    }
  }, [loadUpdateSettings]);

  const updateSettings = useCallback(async (newSettings: Partial<UpdateSettings>) => {
    try {
      const result = await window.electron.update.settings.update(newSettings);
      
      if (result.success) {
        setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      } else {
        setError(result.error || 'Failed to update settings');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    }
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const value: UpdateContextType = {
    updateInfo,
    isChecking,
    isDownloading,
    isUpdateReady,
    error,
    settings,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    skipVersion,
    updateSettings,
    dismissError,
    showUpdateNotification,
    setShowUpdateNotification
  };

  return (
    <UpdateContext.Provider value={value}>
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdate = () => {
  const context = useContext(UpdateContext);
  if (context === undefined) {
    throw new Error('useUpdate must be used within an UpdateProvider');
  }
  return context;
};