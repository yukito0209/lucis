import React from 'react';

interface FooterProps {
  photoCount: number;
  completedCount: number;
  isGenerating: boolean;
  onAddPhotos: () => void;
  onGenerate: () => void;
  onClear: () => void;
}

const Footer: React.FC<FooterProps> = ({ photoCount, completedCount, isGenerating, onAddPhotos, onGenerate, onClear }) => {
  return (
    <div className="footer">
      <div className="footer-stats">
        <span>图片数量: {photoCount}</span>
        <span>完成数量: {completedCount}</span>
        {isGenerating && (
          <span style={{ color: 'var(--primary-color)' }}>正在生成...</span>
        )}
      </div>

      <div className="footer-actions">
        <button className="button" onClick={onClear} disabled={photoCount === 0 || isGenerating}>
          清空
        </button>
        <button className="button" onClick={onAddPhotos} disabled={isGenerating}>
          添加图片
        </button>
        <button 
          className="button primary" 
          onClick={onGenerate} 
          disabled={photoCount === 0 || isGenerating}
        >
          {isGenerating ? '正在生成...' : '生成印框'}
        </button>
      </div>
    </div>
  );
};

export default Footer; 