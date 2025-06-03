// src/renderer/components/UpdateNotification.tsx
import React, { useState } from 'react';
import { X, Download, AlertCircle, CheckCircle, SkipForward, RefreshCw } from 'lucide-react';
import { useUpdate } from '../context/UpdateContext';

const UpdateNotification: React.FC = () => {
  const {
    updateInfo,
    isDownloading,
    isUpdateReady,
    error,
    showUpdateNotification,
    setShowUpdateNotification,
    downloadUpdate,
    installUpdate,
    skipVersion,
    dismissError
  } = useUpdate();

  const [showChangelog, setShowChangelog] = useState(false);

  if (!showUpdateNotification || !updateInfo?.available) {
    return null;
  }

  const handleClose = () => {
    setShowUpdateNotification(false);
    if (error) {
      dismissError();
    }
  };

  const handleSkip = () => {
    if (updateInfo.latestVersion) {
      skipVersion(updateInfo.latestVersion);
    }
  };

  const handleDownload = () => {
    downloadUpdate();
  };

  const handleInstall = () => {
    installUpdate();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            {error ? (
              <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
            ) : isUpdateReady ? (
              <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Download className="w-4 h-4 text-blue-500" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                {error ? 'Update Error' : isUpdateReady ? 'Update Ready' : 'Update Available'}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {error ? 'Failed to update' : isUpdateReady ? 'Ready to install' : `Version ${updateInfo.latestVersion}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error ? (
            <div className="space-y-3">
              <p className="text-sm text-red-500">{error}</p>
              <div className="flex gap-2">
                <button
                  onClick={dismissError}
                  className="btn-secondary text-sm flex-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : isUpdateReady ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                The update has been downloaded and is ready to install. The app will restart automatically.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="btn-secondary text-sm flex-1"
                >
                  Later
                </button>
                <button
                  onClick={handleInstall}
                  className="btn-primary text-sm flex-1"
                >
                  Install & Restart
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Download Progress */}
              {isDownloading && updateInfo.downloadProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Downloading...</span>
                    <span className="text-[var(--text-primary)]">
                      {Math.round(updateInfo.downloadProgress.percent)}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${updateInfo.downloadProgress.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                    <span>
                      {formatBytes(updateInfo.downloadProgress.transferred)} / {formatBytes(updateInfo.downloadProgress.total)}
                    </span>
                    <span>{formatSpeed(updateInfo.downloadProgress.bytesPerSecond)}</span>
                  </div>
                </div>
              )}

              {/* Update Info */}
              {!isDownloading && (
                <div className="space-y-2">
                  <p className="text-sm text-[var(--text-secondary)]">
                    A new version of IconForge AI is available.
                  </p>
                  
                  {updateInfo.mandatory && (
                    <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-orange-600 dark:text-orange-400">
                        This is a mandatory update
                      </span>
                    </div>
                  )}

                  {/* Version Info */}
                  <div className="text-sm">
                    <span className="text-[var(--text-secondary)]">Current: </span>
                    <span className="text-[var(--text-primary)]">{updateInfo.currentVersion}</span>
                    <span className="mx-2 text-[var(--text-secondary)]">→</span>
                    <span className="text-blue-500 font-medium">{updateInfo.latestVersion}</span>
                  </div>

                  {/* Changelog */}
                  {updateInfo.changelog && (
                    <div>
                      <button
                        onClick={() => setShowChangelog(!showChangelog)}
                        className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        {showChangelog ? 'Hide' : 'Show'} changelog
                      </button>
                      
                      {showChangelog && (
                        <div className="mt-2 p-3 bg-[var(--bg-secondary)] rounded-lg max-h-32 overflow-y-auto">
                          <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap">
                            {updateInfo.changelog}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {!isDownloading && (
                <div className="flex gap-2">
                  {!updateInfo.mandatory && (
                    <button
                      onClick={handleSkip}
                      className="btn-secondary text-sm flex items-center gap-1"
                      title="Skip this version"
                    >
                      <SkipForward className="w-3 h-3" />
                      Skip
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className="btn-secondary text-sm flex-1"
                  >
                    Later
                  </button>
                  <button
                    onClick={handleDownload}
                    className="btn-primary text-sm flex-1 flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              )}

              {/* Downloading State */}
              {isDownloading && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Downloading update...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;