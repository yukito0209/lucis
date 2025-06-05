import React from 'react';
import { GenerationProgress } from '../utils/watermarkGenerator';

interface ProgressModalProps {
  isVisible: boolean;
  progress: GenerationProgress | null;
  onClose: () => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({ isVisible, progress, onClose }) => {
  if (!isVisible || !progress) {
    return null;
  }

  const progressPercentage = Math.round((progress.current / progress.total) * 100);
  const isCompleted = progress.status === 'completed';
  const hasError = progress.status === 'error';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        minWidth: '400px',
        maxWidth: '500px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        {/* 标题 */}
        <h3 style={{ 
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#24292f'
        }}>
          {isCompleted ? '🎉 生成完成' : hasError ? '⚠️ 生成过程中出现错误' : '🎨 正在生成水印...'}
        </h3>

        {/* 进度条 */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '12px'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: hasError ? '#dc3545' : isCompleted ? '#28a745' : '#0969da',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* 进度信息 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#656d76'
        }}>
          <span>{progress.current} / {progress.total}</span>
          <span>{progressPercentage}%</span>
        </div>

        {/* 当前处理文件 */}
        {progress.currentFileName && (
          <div style={{
            marginBottom: '16px',
            fontSize: '14px',
            color: '#24292f'
          }}>
            <strong>当前处理:</strong> {progress.currentFileName}
          </div>
        )}

        {/* 状态消息 */}
        {progress.message && (
          <div style={{
            marginBottom: '16px',
            padding: '8px 12px',
            backgroundColor: hasError ? '#fff5f5' : '#f0f9ff',
            borderLeft: `4px solid ${hasError ? '#dc3545' : '#0969da'}`,
            fontSize: '14px',
            color: hasError ? '#721c24' : '#0969da'
          }}>
            {progress.message}
          </div>
        )}

        {/* 操作按钮 */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px'
        }}>
          {(isCompleted || hasError) && (
            <button
              className="button primary"
              onClick={onClose}
            >
              关闭
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressModal; 