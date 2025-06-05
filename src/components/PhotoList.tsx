import React, { useEffect, useRef, useState } from 'react';
import { PhotoData } from '../types';
import { FixedSizeList as List } from 'react-window';

// 导入一个新的样式文件用于加载动画
import './PhotoList.css';

interface PhotoListProps {
  photos: PhotoData[];
  currentIndex: number;
  onSelectPhoto: (index: number) => void;
}

const THUMBNAIL_WIDTH = 80; // 缩略图宽度
const THUMBNAIL_GAP = 10;   // 缩略图间距

const PhotoList: React.FC<PhotoListProps> = ({ photos, currentIndex, onSelectPhoto }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const [listWidth, setListWidth] = useState(0);

  // 1. 动态获取容器宽度，并在照片数量变化时重新观察
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setListWidth(entry.contentRect.width);
        }
      });
      resizeObserver.observe(container);
      // 组件卸载或依赖变化时，断开观察
      return () => resizeObserver.disconnect();
    }
  }, [photos.length]); // 依赖项改为photos.length

  // 2. 手动添加滚轮事件监听器以解决passive listener问题
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newIndex = currentIndex + (e.deltaY > 0 ? 1 : -1);
      if (newIndex >= 0 && newIndex < photos.length) {
        onSelectPhoto(newIndex);
      }
    };
    // 添加事件监听，并明确设置passive为false
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, photos.length, onSelectPhoto]);

  // 3. 自动滚动到当前选中的缩略图
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(currentIndex, 'center');
    }
  }, [currentIndex]);


  if (photos.length <= 1) {
    return null;
  }

  // 4. 定义单个缩略图的渲染组件
  const Column = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const photo = photos[index];
    // 外层div由react-window控制大小和位置，我们用flex居中内部的缩略图
    return (
      <div style={style} className="thumbnail-item-container">
        <div
          className={`thumbnail-item ${index === currentIndex ? 'active' : ''}`}
          onClick={() => onSelectPhoto(index)}
        >
          {photo.status === 'loaded' && photo.thumbnailUrl ? (
            <img src={photo.thumbnailUrl} alt={photo.name} className="thumbnail-image" />
          ) : (
            <div className="thumbnail-placeholder">
              {photo.status === 'loading' && <div className="spinner"></div>}
              {photo.status === 'error' && <span className="error-icon">!</span>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="photo-list-container" ref={containerRef}>
      {listWidth > 0 && (
        <List
          ref={listRef}
          height={80} // 修正：列表高度应为80px以适应容器的内边距
          width={listWidth} // 动态容器宽度
          itemCount={photos.length}
          itemSize={THUMBNAIL_WIDTH + THUMBNAIL_GAP} // 每个项目的宽度
          layout="horizontal"
          className="photo-list"
        >
          {Column}
        </List>
      )}
    </div>
  );
};

export default PhotoList; 