// src/main/ipc/handlers.ts (Updated with update service integration)
import { ipcMain, dialog, shell, app } from 'electron';
import iconStore from '../store/iconStore';
import iconGenerator from '../services/iconGenerator';
import iconExporter from '../services/iconExporter';
import updateService from '../services/updateService';
import fs from 'fs/promises';
import path from 'path';

export function setupIpcHandlers() {
  // Icon Store handlers
  ipcMain.handle('icon:create', async (_, iconData) => {
    try {
      const generatedIcon = await iconGenerator.generateIcon({
        prompt: iconData.prompt,
        styleOptions: iconData.styleOptions,
        sizes: iconData.sizes
      });

      const icon = await iconStore.createIcon({
        ...generatedIcon,
        name: iconData.name || generatedIcon.name || 'Untitled Icon',
        prompt: iconData.prompt,
        sizes: iconData.sizes,
        style: iconData.styleOptions.style,
        primaryColor: iconData.styleOptions.primaryColor,
        secondaryColor: iconData.styleOptions.secondaryColor,
        styleOptions: iconData.styleOptions,
        svgContent: generatedIcon.svgContent || '',
        formats: generatedIcon.formats || {}
      });

      return { success: true, icon };
    } catch (error: any) {
      console.error('Failed to create icon:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('icon:update', async (_, id, updates) => {
    try {
      const icon = await iconStore.updateIcon(id, updates);
      return { success: true, icon };
    } catch (error: any) {
      console.error('Failed to update icon:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('icon:delete', async (_, id) => {
    try {
      const success = await iconStore.deleteIcon(id);
      return { success };
    } catch (error: any) {
      console.error('Failed to delete icon:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('icon:deleteMultiple', async (_, ids) => {
    try {
      const count = await iconStore.deleteMultipleIcons(ids);
      return { success: true, count };
    } catch (error: any) {
      console.error('Failed to delete icons:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('icon:get', async (_, id) => {
    try {
      const icon = iconStore.getIcon(id);
      return { success: true, icon };
    } catch (error: any) {
      console.error('Failed to get icon:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('icon:getAll', async () => {
    try {
      const icons = iconStore.getAllIcons();
      return { success: true, icons };
    } catch (error: any) {
      console.error('Failed to get icons:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('icon:search', async (_, query) => {
    try {
      const icons = iconStore.searchIcons(query);
      return { success: true, icons };
    } catch (error: any) {
      console.error('Failed to search icons:', error);
      return { success: false, error: error.message };
    }
  });

  // Export handlers
  ipcMain.handle('export:icon', async (_, options) => {
    try {
      const filePath = await iconExporter.exportIcon(options);
      return { success: true, filePath };
    } catch (error: any) {
      console.error('Failed to export icon:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('export:single', async (_, iconId, format, size) => {
    try {
      const filePath = await iconExporter.exportSingleIcon(iconId, format, size);
      return { success: true, filePath };
    } catch (error: any) {
      console.error('Failed to export single icon:', error);
      return { success: false, error: error.message };
    }
  });

  // Updated Update handlers with new service
  ipcMain.handle('update:check', async (_, silent = false) => {
    try {
      const result = await updateService.checkForUpdates(silent);
      return { 
        success: true, 
        updateAvailable: result.available,
        currentVersion: result.currentVersion,
        latestVersion: result.latestVersion,
        changelog: result.changelog,
        error: result.error
      };
    } catch (error: any) {
      console.error('Failed to check for updates:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update:download', async () => {
    try {
      const result = await updateService.downloadAndInstallUpdate();
      return result;
    } catch (error: any) {
      console.error('Failed to download update:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update:install', async () => {
    try {
      updateService.quitAndInstall();
      return { success: true };
    } catch (error: any) {
      console.error('Failed to install update:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update:skip-version', async (_, version) => {
    try {
      updateService.skipVersion(version);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to skip version:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update:settings:get', async () => {
    try {
      const settings = updateService.getSettings();
      return { success: true, settings };
    } catch (error: any) {
      console.error('Failed to get update settings:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update:settings:update', async (_, settings) => {
    try {
      updateService.updateSettings(settings);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      return { success: false, error: error.message };
    }
  });

  // Settings handlers
  ipcMain.handle('settings:get', async () => {
    try {
      const settings = iconStore.getSettings();
      const updateSettings = updateService.getSettings();
      return { 
        success: true, 
        settings: {
          ...settings,
          updateSettings
        }
      };
    } catch (error: any) {
      console.error('Failed to get settings:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('settings:update', async (_, settings) => {
    try {
      // Separate update settings from other settings
      const { updateSettings, ...otherSettings } = settings;
      
      if (updateSettings) {
        updateService.updateSettings(updateSettings);
      }
      
      if (Object.keys(otherSettings).length > 0) {
        iconStore.updateSettings(otherSettings);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      return { success: false, error: error.message };
    }
  });

  // Data management handlers
  ipcMain.handle('data:export', async () => {
    try {
      const data = await iconStore.exportData();
      
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: path.join(app.getPath('downloads'), `icon-maker-backup-${Date.now()}.json`),
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (filePath) {
        await fs.writeFile(filePath, data);
        return { success: true, filePath };
      }
      
      return { success: false, error: 'No file selected' };
    } catch (error: any) {
      console.error('Failed to export data:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('data:import', async () => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
      });

      if (filePaths.length === 0) {
        return { success: false, error: 'No file selected' };
      }

      const data = await fs.readFile(filePaths[0], 'utf-8');
      const success = await iconStore.importData(data);
      
      return { success };
    } catch (error: any) {
      console.error('Failed to import data:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('data:clear', async () => {
    try {
      const { response } = await dialog.showMessageBox({
        type: 'warning',
        title: 'Clear All Data',
        message: 'Are you sure you want to delete all icons and settings?',
        detail: 'This action cannot be undone.',
        buttons: ['Cancel', 'Clear All Data'],
        defaultId: 0,
        cancelId: 0
      });

      if (response === 1) {
        await iconStore.clearAllData();
        return { success: true };
      }
      
      return { success: false, error: 'Cancelled' };
    } catch (error: any) {
      console.error('Failed to clear data:', error);
      return { success: false, error: error.message };
    }
  });

  // Utility handlers
  ipcMain.handle('open:external', async (_, url) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to open external URL:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('show:itemInFolder', async (_, filePath) => {
    try {
      shell.showItemInFolder(filePath);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to show item in folder:', error);
      return { success: false, error: error.message };
    }
  });
}
