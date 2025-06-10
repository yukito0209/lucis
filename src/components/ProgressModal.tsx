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
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        padding: '32px',
        borderRadius: '20px',
        minWidth: '450px',
        maxWidth: '550px',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 玻璃效果叠加层 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)',
          pointerEvents: 'none',
          zIndex: -1
        }} />

        {/* 标题 */}
        <h3 style={{ 
          margin: '0 0 20px 0',
          fontSize: '20px',
          color: 'rgba(51, 51, 102, 0.9)',
          fontWeight: '600',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)'
        }}>
          {isCompleted ? '🎉 生成完成' : hasError ? '⚠️ 生成过程中出现错误' : '🎨 正在生成水印...'}
        </h3>

        {/* 进度条容器 */}
        <div style={{
          width: '100%',
          height: '12px',
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '16px',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)'
        }}>
          {/* 进度条 */}
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            background: hasError ? 
              'linear-gradient(90deg, #F87171 0%, #EF4444 100%)' : 
              isCompleted ? 
                'linear-gradient(90deg, #99CCFF 0%, #CCCCFF 100%)' : 
                'linear-gradient(90deg, #99CCFF 0%, #CCCCFF 100%)',
            transition: 'width 0.3s ease',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(153, 204, 255, 0.4)'
          }} />
        </div>

        {/* 进度信息 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '20px',
          fontSize: '14px',
          color: 'rgba(51, 51, 102, 0.8)',
          fontWeight: '500'
        }}>
          <span>{progress.current} / {progress.total}</span>
          <span>{progressPercentage}%</span>
        </div>

        {/* 当前处理文件 */}
        {progress.currentFileName && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '12px',
            fontSize: '14px',
            color: 'rgba(51, 51, 102, 0.9)'
          }}>
            <strong style={{ color: 'rgba(51, 51, 102, 1)' }}>当前处理:</strong> {progress.currentFileName}
          </div>
        )}

        {/* 状态消息 */}
        {progress.message && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            background: hasError ? 
              'rgba(248, 113, 113, 0.2)' : 
              'rgba(153, 204, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: `1px solid ${hasError ? 
              'rgba(248, 113, 113, 0.4)' : 
              'rgba(153, 204, 255, 0.6)'}`,
            borderRadius: '12px',
            fontSize: '14px',
            color: hasError ? 
              'rgba(248, 113, 113, 1)' : 
              'rgba(51, 51, 102, 1)'
          }}>
            {progress.message}
          </div>
        )}

        {/* 操作按钮 */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          {(isCompleted || hasError) && (
            <button
              className="button primary"
              onClick={onClose}
              style={{
                background: 'rgba(153, 204, 255, 0.4)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(153, 204, 255, 0.6)',
                borderRadius: '12px',
                padding: '12px 24px',
                color: 'rgba(51, 51, 102, 1)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px'
              }}
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