import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as exifr from 'exifr';
import sharp from 'sharp';

let mainWindow: BrowserWindow;

// Helper functions (copied from frontend to avoid restructuring)
function formatShutterSpeed(exposureTime?: number): string | undefined {
  if (!exposureTime) return undefined;
  
  if (exposureTime >= 1) {
    return `${exposureTime}s`;
  } else {
    const fraction = 1 / exposureTime;
    if (fraction > 1) {
      return `1/${Math.round(fraction)}s`;
    }
  }
  
  return `${exposureTime}s`;
}

function getNormalizedCameraMake(make?: string): string | undefined {
  if (!make) return undefined;
  
  const normalizedMake = make.toLowerCase().trim();
  
  const brandMapping: { [key: string]: string } = {
    'canon': 'Canon', 'nikon': 'Nikon', 'sony': 'Sony', 'fujifilm': 'Fujifilm',
    'olympus': 'Olympus', 'panasonic': 'Panasonic', 'leica': 'Leica',
    'pentax': 'Pentax', 'ricoh': 'Ricoh', 'hasselblad': 'Hasselblad', 'phase one': 'Phase One'
  };

  for (const [key, value] of Object.entries(brandMapping)) {
    if (normalizedMake.includes(key)) {
      return value;
    }
  }

  return make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    frame: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // 开发模式下禁用web安全检查
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
    console.log('Loading dev server from:', devServerUrl);
    
    mainWindow.loadURL(devServerUrl);
    
    // 等待页面加载完成后打开开发者工具
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.openDevTools();
    });
    
    // 处理加载错误
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorCode, errorDescription);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null as any;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 自定义窗口控制
ipcMain.on('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('get-desktop-path', () => {
  return app.getPath('desktop');
});

// IPC handler for batch processing photos
ipcMain.handle('photos:processBatch', async (_, filePaths: string[]) => {
  const processFile = async (filePath: string) => {
    try {
      const buffer = await fs.promises.readFile(filePath);
      
      const exifData = await exifr.parse(buffer, {
        pick: [
          'Make', 'Model', 'LensModel', 'LensInfo',
          'FNumber', 'ExposureTime', 'ISO', 'FocalLength', 'FocalLengthIn35mmFormat',
          'DateTimeOriginal', 'ImageWidth', 'ImageHeight', 'Orientation'
        ],
        tiff: true, ifd1: true, exif: true, gps: false, interop: false
      });
      
      const formattedExif = exifData ? {
        make: getNormalizedCameraMake(exifData.Make),
        model: exifData.Model,
        lens: exifData.LensModel || exifData.LensInfo,
        aperture: exifData.FNumber ? `f/${exifData.FNumber}` : undefined,
        shutterSpeed: formatShutterSpeed(exifData.ExposureTime),
        iso: exifData.ISO,
        focalLength: exifData.FocalLength,
        dateTimeOriginal: exifData.DateTimeOriginal,
        imageWidth: exifData.ImageWidth,
        imageHeight: exifData.ImageHeight,
        orientation: exifData.Orientation
      } : null;

      const thumbnailBuffer = await sharp(buffer)
        .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      const thumbnailUrl = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;

      return { path: filePath, exif: formattedExif, thumbnailUrl, error: null };
    } catch (error) {
      const err = error as Error;
      console.error(`Error processing file ${filePath}:`, err);
      return { path: filePath, exif: null, thumbnailUrl: null, error: err.message };
    }
  };

  // Process files in parallel for performance
  const results = await Promise.all(filePaths.map(processFile));
  return results;
});

// IPC处理程序
ipcMain.handle('dialog:openFiles', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择图片文件',
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: '图片文件',
        extensions: [
          // Common image formats (lowercase)
          'jpg', 'jpeg', 'png', 'bmp', 'tiff', 'tif', 'webp', 'gif',
          // Common image formats (uppercase)
          'JPG', 'JPEG', 'PNG', 'BMP', 'TIFF', 'TIF', 'WEBP', 'GIF',
          // HEIC formats
          'heic', 'heif', 'HEIC', 'HEIF',
          // Common RAW formats
          'raw', 'cr2', 'nef', 'arw', 'orf', 'dng',
          'RAW', 'CR2', 'NEF', 'ARW', 'ORF', 'DNG'
        ]
      },
      {
        name: 'JPEG 图片',
        extensions: ['jpg', 'jpeg', 'JPG', 'JPEG']
      },
      {
        name: 'PNG 图片',
        extensions: ['png', 'PNG']
      },
      {
        name: '所有文件',
        extensions: ['*']
      }
    ]
  });

  console.log('文件选择结果:', result);

  if (!result.canceled) {
    return result.filePaths;
  }
  return [];
});

ipcMain.handle('dialog:saveDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (!result.canceled) {
    return result.filePaths[0];
  }
  return '';
});

ipcMain.handle('fs:readFile', async (_, filePath: string) => {
  try {
    const buffer = await fs.promises.readFile(filePath);
    return buffer;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

ipcMain.handle('fs:writeFile', async (_, filePath: string, data: ArrayBuffer) => {
  try {
    // 将ArrayBuffer转换为Buffer
    const buffer = Buffer.from(data);
    await fs.promises.writeFile(filePath, buffer);
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
}); 