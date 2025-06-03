// src/main/store/iconStore.ts
import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';

export interface Icon {
  id: string;
  name: string;
  prompt: string;
  sizes: string[];
  style: string;
  primaryColor: string;
  secondaryColor: string;
  styleOptions: StyleOptions;
  createdAt: string;
  updatedAt: string;
  svgContent: string;
  formats: {
    svg?: string;
    png?: Record<string, string>; // size -> base64
    ico?: string;
  };
}

export interface StyleOptions {
  style: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundStyle: string;
  iconComplexity: string;
  corners: string;
  effects: string[];
  mood: string;
  theme: string;
}

interface StoreSchema {
  icons: Icon[];
  settings: {
    theme: 'light' | 'dark';
    defaultExportPath: string;
    autoSave: boolean;
  };
}

class IconStore {
  private store: Store<StoreSchema>;
  private iconsPath: string;

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'icon-maker-data',
      defaults: {
        icons: [],
        settings: {
          theme: 'dark',
          defaultExportPath: app.getPath('downloads'),
          autoSave: true
        }
      }
    });

    // Create icons directory in userData
    this.iconsPath = path.join(app.getPath('userData'), 'icons');
    this.ensureIconsDirectory();
  }

  private async ensureIconsDirectory() {
    try {
      await fs.mkdir(this.iconsPath, { recursive: true });
    } catch (error: any) {
      console.error('Failed to create icons directory:', error);
      throw new Error(`Failed to create icons directory: ${error.message}`);
    }
  }

  // Icon CRUD operations
  async createIcon(iconData: Omit<Icon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Icon> {
    const icon: Icon = {
      ...iconData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const icons = this.store.get('icons');
    icons.push(icon);
    this.store.set('icons', icons);

    // Save icon files
    await this.saveIconFiles(icon);

    return icon;
  }

  async updateIcon(id: string, updates: Partial<Icon>): Promise<Icon | null> {
    const icons = this.store.get('icons');
    const index = icons.findIndex(icon => icon.id === id);
    
    if (index === -1) return null;

    icons[index] = {
      ...icons[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.store.set('icons', icons);

    // Update icon files if formats changed
    if (updates.formats) {
      await this.saveIconFiles(icons[index]);
    }

    return icons[index];
  }

  async deleteIcon(id: string): Promise<boolean> {
    const icons = this.store.get('icons');
    const index = icons.findIndex(icon => icon.id === id);
    
    if (index === -1) return false;

    // Delete icon files
    await this.deleteIconFiles(id);

    icons.splice(index, 1);
    this.store.set('icons', icons);

    return true;
  }

  async deleteMultipleIcons(ids: string[]): Promise<number> {
    const icons = this.store.get('icons');
    let deletedCount = 0;

    // Delete files for all icons
    await Promise.all(ids.map(id => this.deleteIconFiles(id)));

    const filteredIcons = icons.filter(icon => {
      if (ids.includes(icon.id)) {
        deletedCount++;
        return false;
      }
      return true;
    });

    this.store.set('icons', filteredIcons);
    return deletedCount;
  }

  getIcon(id: string): Icon | undefined {
    const icons = this.store.get('icons');
    return icons.find(icon => icon.id === id);
  }

  getAllIcons(): Icon[] {
    return this.store.get('icons');
  }

  searchIcons(query: string): Icon[] {
    const icons = this.store.get('icons');
    const lowercaseQuery = query.toLowerCase();
    
    return icons.filter(icon => 
      icon.name.toLowerCase().includes(lowercaseQuery) ||
      icon.prompt.toLowerCase().includes(lowercaseQuery) ||
      icon.style.toLowerCase().includes(lowercaseQuery)
    );
  }

  // File operations
  private async saveIconFiles(icon: Icon): Promise<void> {
    const iconDir = path.join(this.iconsPath, icon.id);
    await fs.mkdir(iconDir, { recursive: true });

    // Save SVG
    if (icon.formats.svg) {
      await fs.writeFile(
        path.join(iconDir, 'icon.svg'),
        icon.formats.svg,
        'utf-8'
      );
    }

    // Save PNGs
    if (icon.formats.png) {
      for (const [size, base64] of Object.entries(icon.formats.png)) {
        const buffer = Buffer.from(base64, 'base64');
        await fs.writeFile(
          path.join(iconDir, `icon-${size}.png`),
          buffer
        );
      }
    }

    // Save ICO
    if (icon.formats.ico) {
      const buffer = Buffer.from(icon.formats.ico, 'base64');
      await fs.writeFile(
        path.join(iconDir, 'icon.ico'),
        buffer
      );
    }
  }

  private async deleteIconFiles(id: string): Promise<void> {
    const iconDir = path.join(this.iconsPath, id);
    try {
      await fs.rm(iconDir, { recursive: true, force: true });
    } catch (error: any) {
      console.error('Failed to delete icon files:', error);
      throw new Error(`Failed to delete icon files: ${error.message}`);
    }
  }

  async getIconFilePath(id: string, format: string, size?: string): Promise<string | null> {
    const iconDir = path.join(this.iconsPath, id);
    
    let filename: string;
    switch (format) {
      case 'svg':
        filename = 'icon.svg';
        break;
      case 'png':
        if (!size) return null;
        filename = `icon-${size}.png`;
        break;
      case 'ico':
        filename = 'icon.ico';
        break;
      default:
        return null;
    }

    const filePath = path.join(iconDir, filename);
    
    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      return null;
    }
  }

  // Settings operations
  getSettings() {
    return this.store.get('settings');
  }

  updateSettings(settings: Partial<StoreSchema['settings']>) {
    const currentSettings = this.store.get('settings');
    this.store.set('settings', { ...currentSettings, ...settings });
  }

  // Export/Import operations
  async exportData(): Promise<string> {
    const data = {
      icons: this.store.get('icons'),
      settings: this.store.get('settings'),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.icons || !Array.isArray(data.icons)) {
        throw new Error('Invalid data format: missing or invalid icons array');
      }

      // Clear existing data
      await this.clearAllData();

      // Import icons
      for (const icon of data.icons) {
        await this.createIcon(icon);
      }

      // Import settings if available
      if (data.settings) {
        this.updateSettings(data.settings);
      }

      return true;
    } catch (error: any) {
      console.error('Failed to import data:', error);
      throw new Error(`Failed to import data: ${error.message}`);
    }
  }

  async clearAllData(): Promise<void> {
    // Delete all icon files
    const icons = this.store.get('icons');
    await Promise.all(icons.map(icon => this.deleteIconFiles(icon.id)));

    // Clear store
    this.store.clear();
    
    // Reset defaults
    this.store.set('icons', []);
    this.store.set('settings', {
      theme: 'dark',
      defaultExportPath: app.getPath('downloads'),
      autoSave: true
    });
  }
}

export default new IconStore();