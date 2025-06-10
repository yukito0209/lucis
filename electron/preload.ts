import { contextBridge, ipcRenderer } from 'electron';

export interface ProcessedPhotoResult {
  path: string;
  exif: any; // 在这里使用 any，因为EXIF结构复杂，具体类型在前端定义
  thumbnailUrl: string | null;
  error: string | null;
}

export interface ElectronAPI {
  openFiles: () => Promise<string[]>;
  saveDirectory: () => Promise<string>;
  readFile: (filePath: string) => Promise<ArrayBuffer>;
  writeFile: (filePath: string, data: ArrayBuffer) => Promise<boolean>;
  processPhotos: (filePaths: string[]) => Promise<ProcessedPhotoResult[]>;
  getDesktopPath: () => Promise<string>;
  minimizeWindow: () => void;
  closeWindow: () => void;
  openExternal: (url: string) => Promise<void>;
}

const electronAPI: ElectronAPI = {
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  saveDirectory: () => ipcRenderer.invoke('dialog:saveDirectory'),
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath: string, data: ArrayBuffer) => ipcRenderer.invoke('fs:writeFile', filePath, data),
  processPhotos: (filePaths: string[]) => ipcRenderer.invoke('photos:processBatch', filePaths),
  getDesktopPath: () => ipcRenderer.invoke('get-desktop-path'),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI); 