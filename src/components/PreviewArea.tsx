import React, { useRef, useEffect, useState } from 'react';
import { PhotoData, WatermarkConfig } from '../types';
import { drawWatermark, calculateOutputDimensions } from '../utils/watermarkGenerator';
import ExifInfo from './ExifInfo';

interface PreviewAreaProps {
  photo: PhotoData | null;
  config: WatermarkConfig;
  photos: PhotoData[];
  currentIndex: number;
  onPhotoChange: (index: number) => void;
}

const PreviewArea: React.FC<PreviewAreaProps> = ({ 
  photo, 
  config, 
  photos, 
  currentIndex, 
  onPhotoChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null); // Ref for the canvas container
  const [showExifInfo, setShowExifInfo] = useState<boolean>(false);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });
  const prevPhotoId = useRef<number | null>(null);

  // Re-generate preview when photo, config, or container size changes
  useEffect(() => {
    if (photo?.id !== prevPhotoId.current) {
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
      prevPhotoId.current = photo?.id || null;
    }

    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;

    const draw = () => {
      if (!photo) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

          const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
    if (!ctx) return;

      const img = new Image();
              img.onload = async () => {
          // Correctly use calculateOutputDimensions to get the final aspect ratio
          const finalDimensions = calculateOutputDimensions(img, config);
          const targetAspectRatio = finalDimensions.width / finalDimensions.height;

          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;

          let previewWidth = containerWidth;
          let previewHeight = containerWidth / targetAspectRatio;
          if (previewHeight > containerHeight) {
            previewHeight = containerHeight;
            previewWidth = containerHeight * targetAspectRatio;
          }

          canvas.width = previewWidth;
          canvas.height = previewHeight;

          // Call the unified drawing function
          await drawWatermark(ctx, img, photo, config, canvas.width, canvas.height);
        };

      if (photo.url) {
        img.src = photo.url;
      } else {
        // Handle case where full res URL isn't loaded yet, maybe show placeholder?
      }
    };
    
    // Use ResizeObserver for more reliable & performant resizing.
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(container);

    draw(); // Initial draw

    return () => {
      resizeObserver.unobserve(container);
    };

  }, [photo, config, isPanning]); // Rerun when photo or config changes. `isPanning` is added to prevent re-draws while panning.

  const handlePrevPhoto = () => {
    if (currentIndex > 0) {
      onPhotoChange(currentIndex - 1);
    }
  };

  const handleNextPhoto = () => {
    if (currentIndex < photos.length - 1) {
      onPhotoChange(currentIndex + 1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomFactor = 0.1;
      const newZoom = e.deltaY < 0 ? zoom + zoomFactor : zoom - zoomFactor;
      const clampedZoom = Math.max(0.2, Math.min(newZoom, 5));
      setZoom(clampedZoom);
      if (clampedZoom <= 1) {
        setPanOffset({ x: 0, y: 0 });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    setStartPanPoint({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    setPanOffset({
      x: e.clientX - startPanPoint.x,
      y: e.clientY - startPanPoint.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  return (
    <div
      className="preview-area"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      style={{ cursor: isPanning ? 'grabbing' : (zoom > 1 ? 'grab' : 'default') }}
    >
      {photo ? (
        <>
          <ExifInfo exif={photo.exif} isVisible={showExifInfo} />
          <div style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 11
          }}>
             <button className="button" onClick={() => setShowExifInfo(!showExifInfo)} style={{
                fontSize: '12px', padding: '4px 8px',
                backgroundColor: showExifInfo ? 'var(--primary-color)' : 'var(--bg-color)',
                color: showExifInfo ? 'white' : 'var(--text-color)'
              }}>
              {showExifInfo ? '隐藏EXIF' : '显示EXIF'}
            </button>
          </div>

          {/* This div contains only the zoomable/pannable content */}
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transition: isPanning ? 'none' : 'transform 0.1s ease-out',
              width: '100%',
              height: '100%',
            }}
          >
            <div className="zoomable-content-wrapper">
              <div className="preview-canvas-container" ref={canvasContainerRef}>
                <div className="preview-container">
                  <canvas ref={canvasRef} className="preview-canvas" />
                </div>
              </div>
              <div className="preview-photo-name">
                <div>{photo.name}</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="no-image">
          <div className="no-image-icon">📷</div>
          <div>请添加图片以开始预览</div>
        </div>
      )}
    </div>
  );
};

export default PreviewArea; 