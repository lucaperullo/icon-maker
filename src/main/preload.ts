// src/main/preload.ts (Updated)
import { contextBridge, ipcRenderer, IpcRendererEvent, shell } from 'electron';

export type Channels = 
  | 'icon:create'
  | 'icon:update'
  | 'icon:delete'
  | 'icon:deleteMultiple'
  | 'icon:get'
  | 'icon:getAll'
  | 'icon:search'
  | 'export:icon'
  | 'export:single'
  | 'settings:get'
  | 'settings:update'
  | 'data:export'
  | 'data:import'
  | 'data:clear'
  | 'update:check'
  | 'update:download'
  | 'update:install'
  | 'update:skip-version'
  | 'update:settings:get'
  | 'update:settings:update'
  | 'open:external'
  | 'show:itemInFolder'
  | 'dialog:showOpenDialog'
  | 'update-event'; // For receiving update events

export interface UpdateInfo {
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

export interface UpdateSettings {
  autoCheck: boolean;
  lastCheckTime: number;
  checkInterval: number;
  skipVersion?: string;
  beta: boolean;
}

export interface ElectronHandler {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]): void;
    on(channel: Channels, func: (...args: unknown[]) => void): () => void;
    once(channel: Channels, func: (...args: unknown[]) => void): void;
  };
  utils: {
    showItemInFolder(path: string): void;
    openExternal(url: string): void;
  };
  icon: {
    create(data: any): Promise<{ success: boolean; icon?: any; error?: string }>;
    update(id: string, updates: any): Promise<{ success: boolean; icon?: any; error?: string }>;
    delete(id: string): Promise<{ success: boolean; error?: string }>;
    deleteMultiple(ids: string[]): Promise<{ success: boolean; count?: number; error?: string }>;
    get(id: string): Promise<{ success: boolean; icon?: any; error?: string }>;
    getAll(): Promise<{ success: boolean; icons?: any[]; error?: string }>;
    search(query: string): Promise<{ success: boolean; icons?: any[]; error?: string }>;
  };
  export: {
    icon(options: any): Promise<{ success: boolean; filePath?: string; error?: string }>;
    single(iconId: string, format: string, size?: string): Promise<{ success: boolean; filePath?: string; error?: string }>;
  };
  settings: {
    get(): Promise<{ success: boolean; settings?: any; error?: string }>;
    update(settings: any): Promise<{ success: boolean; error?: string }>;
  };
  data: {
    export(): Promise<{ success: boolean; filePath?: string; error?: string }>;
    import(filePath: string): Promise<{ success: boolean; error?: string }>;
    clear(): Promise<{ success: boolean; error?: string }>;
  };
  update: {
    check(silent?: boolean): Promise<{ 
      success: boolean; 
      updateAvailable?: boolean; 
      currentVersion?: string;
      latestVersion?: string;
      changelog?: string;
      error?: string 
    }>;
    download(): Promise<{ success: boolean; error?: string }>;
    install(): Promise<{ success: boolean; error?: string }>;
    skipVersion(version: string): Promise<{ success: boolean; error?: string }>;
    settings: {
      get(): Promise<{ success: boolean; settings?: UpdateSettings; error?: string }>;
      update(settings: Partial<UpdateSettings>): Promise<{ success: boolean; error?: string }>;
    };
    onEvent(callback: (event: string, data?: any) => void): () => void;
  };
}

const electronHandler: ElectronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  utils: {
    showItemInFolder(path: string) {
      shell.showItemInFolder(path);
    },
    openExternal(url: string) {
      shell.openExternal(url);
    },
  },
  icon: {
    create: (data) => ipcRenderer.invoke('icon:create', data),
    update: (id, updates) => ipcRenderer.invoke('icon:update', id, updates),
    delete: (id) => ipcRenderer.invoke('icon:delete', id),
    deleteMultiple: (ids) => ipcRenderer.invoke('icon:deleteMultiple', ids),
    get: (id) => ipcRenderer.invoke('icon:get', id),
    getAll: () => ipcRenderer.invoke('icon:getAll'),
    search: (query) => ipcRenderer.invoke('icon:search', query),
  },
  export: {
    icon: (options) => ipcRenderer.invoke('export:icon', options),
    single: (iconId, format, size) => ipcRenderer.invoke('export:single', iconId, format, size),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (settings) => ipcRenderer.invoke('settings:update', settings),
  },
  data: {
    export: () => ipcRenderer.invoke('data:export'),
    import: (filePath) => ipcRenderer.invoke('data:import', filePath),
    clear: () => ipcRenderer.invoke('data:clear'),
  },
  update: {
    check: (silent = false) => ipcRenderer.invoke('update:check', silent),
    download: () => ipcRenderer.invoke('update:download'),
    install: () => ipcRenderer.invoke('update:install'),
    skipVersion: (version) => ipcRenderer.invoke('update:skip-version', version),
    settings: {
      get: () => ipcRenderer.invoke('update:settings:get'),
      update: (settings) => ipcRenderer.invoke('update:settings:update', settings),
    },
    onEvent: (callback: (event: string, data?: any) => void) => {
      const handler = (_: any, { event, data }: { event: string; data?: any }) => {
        callback(event, data);
      };
      
      ipcRenderer.on('update-event', handler);
      
      return () => {
        ipcRenderer.removeListener('update-event', handler);
      };
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);