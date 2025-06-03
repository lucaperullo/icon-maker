// src/main/services/updateService.ts
import { app, dialog, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import axios from 'axios';
import semver from 'semver';
import Store from 'electron-store';

interface UpdateInfo {
  version: string;
  releaseDate: string;
  changelog: string;
  downloadUrl: string;
  mandatory: boolean;
}

interface UpdateSettings {
  autoCheck: boolean;
  lastCheckTime: number;
  checkInterval: number; // in hours
  skipVersion?: string;
  beta: boolean;
}

class UpdateService {
  private store: Store<{ updateSettings: UpdateSettings }>;
  private checkTimer?: NodeJS.Timeout;
  private mainWindow?: BrowserWindow;
  private readonly GITHUB_REPO = 'lucaperullo/icon-maker';
  private readonly CHECK_INTERVAL_HOURS = 6; // Check every 6 hours

  constructor() {
    // Debug logging
    log.info('UpdateService initialized');
    log.info('GitHub Repo:', this.GITHUB_REPO);
    
    this.store = new Store<{ updateSettings: UpdateSettings }>({
      name: 'update-settings',
      defaults: {
        updateSettings: {
          autoCheck: true,
          lastCheckTime: 0,
          checkInterval: this.CHECK_INTERVAL_HOURS,
          beta: false,
          skipVersion: undefined
        }
      }
    });

    this.setupAutoUpdater();
    this.startPeriodicCheck();
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  private setupAutoUpdater() {
    // Configure auto-updater
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: this.GITHUB_REPO.split('/')[0],
      repo: this.GITHUB_REPO.split('/')[1],
      private: false,
      releaseType: this.store.get('updateSettings.beta') ? 'prerelease' : 'release'
    });

    // Configure logging
    autoUpdater.logger = log;
    (autoUpdater.logger as any).transports.file.level = 'info';

    // Auto-updater events
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
      this.notifyRenderer('update-checking');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info);
      this.notifyRenderer('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        changelog: info.releaseNotes || 'No changelog available'
      });
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available:', info);
      this.notifyRenderer('update-not-available', {
        currentVersion: app.getVersion()
      });
    });

    autoUpdater.on('error', (err) => {
      log.error('Error in auto-updater:', err);
      this.notifyRenderer('update-error', { error: err.message });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      log.info(logMessage);
      
      this.notifyRenderer('update-download-progress', {
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info);
      this.notifyRenderer('update-downloaded', {
        version: info.version,
        releaseDate: info.releaseDate
      });
      
      // Show update ready dialog
      this.showUpdateReadyDialog(info);
    });
  }

  private startPeriodicCheck() {
    const settings = this.store.get('updateSettings');
    
    if (!settings.autoCheck) return;

    // Check immediately if it's been more than the interval since last check
    const now = Date.now();
    const timeSinceLastCheck = now - settings.lastCheckTime;
    const intervalMs = settings.checkInterval * 60 * 60 * 1000; // Convert hours to ms

    if (timeSinceLastCheck >= intervalMs) {
      this.checkForUpdates(true); // Silent check
    }

    // Set up periodic checking
    this.checkTimer = setInterval(() => {
      this.checkForUpdates(true); // Silent check
    }, intervalMs);
  }

  async checkForUpdates(silent: boolean = false): Promise<{
    available: boolean;
    currentVersion: string;
    latestVersion?: string;
    changelog?: string;
    error?: string;
  }> {
    try {
      // Update last check time
      const settings = this.store.get('updateSettings');
      this.store.set('updateSettings', {
        ...settings,
        lastCheckTime: Date.now()
      });

      if (!silent) {
        this.notifyRenderer('update-checking');
      }

      // Check GitHub releases
      const latestRelease = await this.getLatestGitHubRelease();
      const currentVersion = app.getVersion();

      if (latestRelease && semver.gt(latestRelease.version, currentVersion)) {
        // Skip if user chose to skip this version
        if (settings.skipVersion === latestRelease.version) {
          return {
            available: false,
            currentVersion,
            latestVersion: latestRelease.version
          };
        }

        if (!silent) {
          this.notifyRenderer('update-available', {
            version: latestRelease.version,
            changelog: latestRelease.changelog,
            mandatory: latestRelease.mandatory
          });
        } else {
          // For silent checks, show a non-intrusive notification
          this.showSilentUpdateNotification(latestRelease);
        }

        return {
          available: true,
          currentVersion,
          latestVersion: latestRelease.version,
          changelog: latestRelease.changelog
        };
      } else {
        if (!silent) {
          this.notifyRenderer('update-not-available', {
            currentVersion
          });
        }

        return {
          available: false,
          currentVersion
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      log.error('Error checking for updates:', error);
      
      if (!silent) {
        this.notifyRenderer('update-error', { error: errorMessage });
      }

      return {
        available: false,
        currentVersion: app.getVersion(),
        error: errorMessage
      };
    }
  }

  private async getLatestGitHubRelease(): Promise<UpdateInfo | null> {
    try {
      log.info('Fetching releases from:', `https://api.github.com/repos/${this.GITHUB_REPO}/releases`);
      
      const response = await axios.get(`https://api.github.com/repos/${this.GITHUB_REPO}/releases`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'icon-maker/' + app.getVersion()
        }
      });

      const releases = response.data;
      if (!releases || releases.length === 0) {
        log.info('No releases found');
        return null;
      }

      // Get the latest non-draft, non-prerelease release
      const latestRelease = releases.find((release: any) => !release.draft && !release.prerelease);
      if (!latestRelease) {
        log.info('No stable releases found');
        return null;
      }

      log.info('Latest release found:', latestRelease.tag_name);
      return {
        version: latestRelease.tag_name.replace('v', ''),
        releaseDate: latestRelease.published_at,
        changelog: latestRelease.body || 'No changelog available',
        downloadUrl: latestRelease.html_url,
        mandatory: false
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        log.error('Failed to fetch GitHub releases:', error.response?.data || error.message);
      } else {
        log.error('Failed to fetch GitHub releases:', error);
      }
      return null;
    }
  }

  async downloadAndInstallUpdate(): Promise<{ success: boolean; error?: string }> {
    try {
      this.notifyRenderer('update-downloading');
      
      // Start download using electron-updater
      await autoUpdater.downloadUpdate();
      
      return { success: true };
    } catch (error: any) {
      log.error('Failed to download update:', error);
      this.notifyRenderer('update-error', { error: error.message });
      
      return { success: false, error: error.message };
    }
  }

  quitAndInstall() {
    try {
      autoUpdater.quitAndInstall(false, true);
    } catch (error: any) {
      log.error('Failed to quit and install:', error);
      this.notifyRenderer('update-error', { error: error.message });
    }
  }

  private showSilentUpdateNotification(updateInfo: UpdateInfo) {
    if (!this.mainWindow) return;

    // Send a non-intrusive notification to the renderer
    this.notifyRenderer('update-available-silent', {
      version: updateInfo.version,
      changelog: updateInfo.changelog,
      mandatory: updateInfo.mandatory
    });
  }

  private async showUpdateReadyDialog(info: any) {
    if (!this.mainWindow) return;

    const { response } = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `Update ${info.version} has been downloaded`,
      detail: 'The update will be installed when you restart the application. Would you like to restart now?',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    });

    if (response === 0) {
      this.quitAndInstall();
    }
  }

  skipVersion(version: string) {
    const settings = this.store.get('updateSettings');
    this.store.set('updateSettings', {
      ...settings,
      skipVersion: version
    });
  }

  updateSettings(newSettings: Partial<UpdateSettings>) {
    const currentSettings = this.store.get('updateSettings');
    const updatedSettings = { ...currentSettings, ...newSettings };
    this.store.set('updateSettings', updatedSettings);

    // Restart periodic checking if settings changed
    if (newSettings.autoCheck !== undefined || newSettings.checkInterval !== undefined) {
      if (this.checkTimer) {
        clearInterval(this.checkTimer);
      }
      this.startPeriodicCheck();
    }
  }

  getSettings(): UpdateSettings {
    return this.store.get('updateSettings');
  }

  private notifyRenderer(event: string, data?: any) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('update-event', { event, data });
    }
  }

  destroy() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }
  }
}

export default new UpdateService();