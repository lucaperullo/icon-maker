// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
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
  | 'open:external'
  | 'show:itemInFolder'
  | 'dialog:showOpenDialog';

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
    check(): Promise<{ 
      success: boolean; 
      updateAvailable?: boolean; 
      currentVersion?: string;
      newVersion?: string;
      error?: string 
    }>;
    download(): Promise<{ success: boolean; error?: string }>;
    install(): Promise<{ success: boolean; error?: string }>;
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
    check: () => ipcRenderer.invoke('update:check'),
    download: () => ipcRenderer.invoke('update:download'),
    install: () => ipcRenderer.invoke('update:install'),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
