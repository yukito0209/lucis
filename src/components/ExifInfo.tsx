import React from 'react';
import { PhotoExif } from '../types';
import { formatFocalLength, getNormalizedCameraMake } from '../utils/exifUtils';

interface ExifInfoProps {
  exif: PhotoExif | null;
  isVisible: boolean;
}

const ExifInfo: React.FC<ExifInfoProps> = ({ exif, isVisible }) => {
  if (!isVisible || !exif) {
    return null;
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '未知';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '12px',
      minWidth: '200px',
      maxWidth: '300px',
      zIndex: 10
    }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>📷 EXIF 信息</h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        <div><strong>相机品牌:</strong></div>
        <div>{getNormalizedCameraMake(exif.make) || '未知'}</div>
        
        <div><strong>相机型号:</strong></div>
        <div>{exif.model || '未知'}</div>
        
        {exif.lens && (
          <>
            <div><strong>镜头:</strong></div>
            <div>{exif.lens}</div>
          </>
        )}
        
        <div><strong>焦距:</strong></div>
        <div>{formatFocalLength(exif.focalLength) || '未知'}</div>
        
        <div><strong>光圈:</strong></div>
        <div>{exif.aperture || '未知'}</div>
        
        <div><strong>快门:</strong></div>
        <div>{exif.shutterSpeed || '未知'}</div>
        
        <div><strong>ISO:</strong></div>
        <div>{exif.iso || '未知'}</div>
        
        {exif.dateTimeOriginal && (
          <>
            <div><strong>拍摄时间:</strong></div>
            <div>{formatDate(exif.dateTimeOriginal)}</div>
          </>
        )}
        
        {(exif.imageWidth && exif.imageHeight) && (
          <>
            <div><strong>图像尺寸:</strong></div>
            <div>{exif.imageWidth} × {exif.imageHeight}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExifInfo; 