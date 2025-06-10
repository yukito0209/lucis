import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import PreviewArea from './components/PreviewArea';
import Footer from './components/Footer';
import ProgressModal from './components/ProgressModal';
import PhotoList from './components/PhotoList';
import TitleBar from './components/TitleBar';
import { WatermarkConfig, PhotoData } from './types';
import { generateBatchWatermarks, GenerationProgress } from './utils/watermarkGenerator';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const [config, setConfig] = useState<WatermarkConfig>({
    outputDir: '',
    mainImageRatio: 90,
    cornerRadius: 200,
    shadowSize: 20,
    outputQuality: 100,
    outputWidth: 0,
    outputHeight: 0,
    pureBackground: false,
    landscapeOutput: false,
    useCustomOutputSize: false,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSizeRatio: 100,
    use35mmEquivalent: false,
    backgroundBlur: 30,
  });

  const handleResizerMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizerMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleResizerMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      window.addEventListener('mousemove', handleResizerMouseMove);
      window.addEventListener('mouseup', handleResizerMouseUp);
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      window.removeEventListener('mousemove', handleResizerMouseMove);
      window.removeEventListener('mouseup', handleResizerMouseUp);
    };
  }, [isResizing, handleResizerMouseMove, handleResizerMouseUp]);

  // Set default output directory to desktop on startup
  useEffect(() => {
    const setDefaultOutputDir = async () => {
      if (window.electronAPI) {
        const desktopPath = await window.electronAPI.getDesktopPath();
        handleConfigChange({ outputDir: desktopPath });
      }
    };
    setDefaultOutputDir();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentPhotoIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPhotoIndex(prev => Math.min(photos.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [photos.length]);

  // Effect to load full-resolution image for the currently selected photo
  useEffect(() => {
    const currentPhoto = photos[currentPhotoIndex];
    if (currentPhoto && !currentPhoto.url && currentPhoto.status === 'loaded') {
      const loadFullRes = async () => {
        try {
          const buffer = await window.electronAPI.readFile(currentPhoto.path);
          const blob = new Blob([buffer]);
          const fullUrl = URL.createObjectURL(blob);
          setPhotos(prev => prev.map(p => 
            p.id === currentPhoto.id ? { ...p, url: fullUrl } : p
          ));
        } catch (error) {
          console.error(`Failed to load full resolution image for ${currentPhoto.name}`, error);
          setPhotos(prev => prev.map(p => 
            p.id === currentPhoto.id ? { ...p, status: 'error' } : p
          ));
        }
      };
      loadFullRes();
    }
    // This effect should ONLY run when the selected photo changes.
  }, [currentPhotoIndex, photos]);

  const handleConfigChange = (newConfig: Partial<WatermarkConfig>) => {
    setConfig((prev: WatermarkConfig) => ({ ...prev, ...newConfig }));
  };

  const handlePhotosAdd = async () => {
    if (window.electronAPI) {
      try {
        const filePaths = await window.electronAPI.openFiles();
        if (filePaths.length === 0) return;

        // 1. Immediately create photos with 'loading' status for instant UI feedback
        const newPhotos: PhotoData[] = filePaths.map(filePath => ({
          id: Date.now() + Math.random(),
          path: filePath,
          name: filePath.split(/[\\/]/).pop() || '未知文件',
          url: '',
          thumbnailUrl: '',
          exif: null,
          status: 'loading'
        }));
        setPhotos(prev => [...prev, ...newPhotos]);

        // 2. Offload heavy processing to the main process
        const processedResults = await window.electronAPI.processPhotos(filePaths);

        // 3. Update photos with results from the main process
        setPhotos(prevPhotos => {
          const updatedPhotos = prevPhotos.map(p => {
            const result = processedResults.find(r => r.path === p.path);
            if (result) {
              if (result.error) {
                return { ...p, status: 'error' as const };
              }
              return {
                ...p,
                status: 'loaded' as const,
                thumbnailUrl: result.thumbnailUrl || '',
                exif: result.exif
              };
            }
            return p;
          });
          return updatedPhotos;
        });
        
      } catch (error) {
        console.error('Error loading photos:', error);
        // You might want to update the status of the 'loading' photos to 'error' here
      }
    }
  };

  const handleClearPhotos = () => {
    // 清理已创建的Blob URL对象，防止内存泄漏
    photos.forEach(photo => {
      // 缩略图是Data URL，不需要清理。只清理用于大图预览的Blob URL。
      if (photo.url && photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url);
      }
    });
    setPhotos([]);
    setCurrentPhotoIndex(0);
    setCompletedCount(0); // 清空时也重置完成计数
  };

  const handleSelectOutputDir = async () => {
    if (window.electronAPI) {
      try {
        const dir = await window.electronAPI.saveDirectory();
        if (dir) {
          setConfig((prev: WatermarkConfig) => ({ ...prev, outputDir: dir }));
        }
      } catch (error) {
        console.error('Error selecting directory:', error);
      }
    }
  };

  const handleGenerate = async () => {
    if (photos.length === 0) {
      alert('请先添加照片');
      return;
    }

    if (!config.outputDir) {
      alert('请先选择输出目录');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(null);
    setCompletedCount(0);

    try {
      console.log('开始生成水印图片...', {
        photoCount: photos.length,
        outputDir: config.outputDir,
        quality: config.outputQuality
      });

      // 确保所有照片都有全分辨率URL
      console.log('正在预加载所有照片的全分辨率图片...');
      const photosWithUrls = await Promise.all(photos.map(async (photo) => {
        if (photo.url) {
          return photo; // 已经有URL了，直接返回
        }
        
        try {
          const buffer = await window.electronAPI.readFile(photo.path);
          const blob = new Blob([buffer]);
          const fullUrl = URL.createObjectURL(blob);
          console.log(`已加载全分辨率图片: ${photo.name}`);
          return { ...photo, url: fullUrl };
        } catch (error) {
          console.error(`加载全分辨率图片失败: ${photo.name}`, error);
          return { ...photo, status: 'error' as const };
        }
      }));

      // 更新照片状态
      setPhotos(photosWithUrls);

      // 过滤出可以正常生成的照片
      const validPhotos = photosWithUrls.filter(photo => photo.url && photo.status !== 'error');
      
      if (validPhotos.length === 0) {
        alert('没有可用的照片进行生成');
        setIsGenerating(false);
        return;
      }

      if (validPhotos.length < photos.length) {
        const failedCount = photos.length - validPhotos.length;
        console.warn(`有 ${failedCount} 张照片加载失败，将跳过生成`);
      }
      
      const result = await generateBatchWatermarks(
        validPhotos, // 使用预加载完成的有效照片
        config,
        (progress) => {
          console.log('进度更新:', progress);
          setGenerationProgress(progress);
          if (progress.status === 'completed') {
            setCompletedCount(progress.current);
          }
        }
      );

      console.log('生成结果:', result);

      if (result.success) {
        setCompletedCount(result.processedCount);
        if (result.errors.length > 0) {
          console.warn('部分文件生成失败:', result.errors);
        }
      } else {
        console.error('生成失败:', result.errors);
      }

    } catch (error) {
      console.error('生成过程中发生错误:', error);
      setGenerationProgress({
        current: 0,
        total: photos.length,
        currentFileName: '',
        status: 'error',
        message: `生成失败: ${error}`
      });
    }
  };

  const handleCloseProgress = () => {
    setIsGenerating(false);
    setGenerationProgress(null);
  };

  const currentPhoto = photos[currentPhotoIndex] || null;

  return (
    <div className="app-container">
      <TitleBar />
      <div className="app">
        <div style={{ width: `${sidebarWidth}px`, display: 'flex', flexShrink: 0 }}>
          <Sidebar
            config={config}
            onConfigChange={handleConfigChange}
            onSelectOutputDir={handleSelectOutputDir}
          />
        </div>
        <div 
          className={`resizer ${isResizing ? 'is-resizing' : ''}`}
          onMouseDown={handleResizerMouseDown}
        />
        <div className="main-content">
          <PreviewArea
            photo={currentPhoto}
            config={config}
            photos={photos}
            currentIndex={currentPhotoIndex}
            onPhotoChange={setCurrentPhotoIndex}
          />
          <PhotoList
            photos={photos}
            currentIndex={currentPhotoIndex}
            onSelectPhoto={setCurrentPhotoIndex}
          />
          <Footer
            photoCount={photos.length}
            completedCount={completedCount}
            isGenerating={isGenerating}
            onAddPhotos={handlePhotosAdd}
            onGenerate={handleGenerate}
            onClear={handleClearPhotos}
          />
        </div>

        {/* 进度显示模态框 */}
        <ProgressModal
          isVisible={isGenerating}
          progress={generationProgress}
          onClose={handleCloseProgress}
        />
      </div>
    </div>
  );
};

export default App; 