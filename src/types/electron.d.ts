import { PhotoExif } from "./index";

export interface ProcessedPhotoResult {
  path: string;
  exif: PhotoExif | null;
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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 