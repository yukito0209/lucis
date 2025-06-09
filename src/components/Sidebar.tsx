import React from 'react';
import { WatermarkConfig } from '../types';

interface SidebarProps {
  config: WatermarkConfig;
  onConfigChange: (config: Partial<WatermarkConfig>) => void;
  onSelectOutputDir: () => void;
}

// Helper component for labels with tooltips
const LabelWithTooltip = ({ label, tooltipText }: { label: string, tooltipText: string }) => (
  <div className="form-label-wrapper">
    <label className="form-label">{label}</label>
    <div className="tooltip-container">
      <span className="tooltip-icon">?</span>
      <span className="tooltip-text">{tooltipText}</span>
    </div>
  </div>
);

// A helper component for the new switch style
const Switch = ({ checked, onChange }: { checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <label className="switch">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="slider"></span>
  </label>
);

const Sidebar: React.FC<SidebarProps> = ({ config, onConfigChange, onSelectOutputDir }) => {
  const handleRangeChange = (key: keyof WatermarkConfig, value: number) => {
    onConfigChange({ [key]: value });
  };

  const handleCheckboxChange = (key: keyof WatermarkConfig, checked: boolean) => {
    onConfigChange({ [key]: checked });
  };

  const handleInputChange = (key: keyof WatermarkConfig, value: string | number) => {
    onConfigChange({ [key]: value });
  };

  return (
    <div className="sidebar">
      <h2 style={{ marginBottom: '30px', fontSize: '18px', fontWeight: '600', textAlign: 'center' }}>水印设置</h2>
      
      {/* 输出目录 */}
      <div className="form-group">
        <LabelWithTooltip label="输出目录" tooltipText="选择生成后图片的保存位置。" />
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="form-control"
            value={config.outputDir}
            placeholder="选择输出目录"
            readOnly
            style={{ cursor: 'pointer' }}
            onClick={onSelectOutputDir}
          />
          <button
            type="button"
            className="button"
            onClick={onSelectOutputDir}
            style={{ minWidth: '60px' }}
          >
            📁
          </button>
        </div>
      </div>

      {/* 主图占比 */}
      <div className="form-group">
        <LabelWithTooltip label="主图占比" tooltipText="照片在整个画框中所占的比例。值越大，照片越大。" />
        <div className="range-group">
          <input
            type="range"
            className="range-input"
            min="50"
            max="100"
            value={config.mainImageRatio}
            onChange={(e) => handleRangeChange('mainImageRatio', Number(e.target.value))}
          />
          <span className="range-value">{config.mainImageRatio}%</span>
        </div>
      </div>

      {/* 圆角大小 */}
      <div className="form-group">
        <LabelWithTooltip label="圆角大小" tooltipText="照片边缘的圆角弧度。值越大，圆角越明显。" />
        <div className="range-group">
          <input
            type="range"
            className="range-input"
            min="0"
            max="200"
            step="1"
            value={config.cornerRadius}
            onChange={(e) => handleRangeChange('cornerRadius', Number(e.target.value))}
          />
          <span className="range-value">{config.cornerRadius}</span>
        </div>
      </div>

      {/* 阴影大小 */}
      <div className="form-group">
        <LabelWithTooltip label="阴影大小" tooltipText="照片下方的阴影效果强度。值越大，阴影越弥散。" />
        <div className="range-group">
          <input
            type="range"
            className="range-input"
            min="0"
            max="20"
            value={config.shadowSize}
            onChange={(e) => handleRangeChange('shadowSize', Number(e.target.value))}
          />
          <span className="range-value">{config.shadowSize}</span>
        </div>
      </div>

      {/* 输出质量 */}
      <div className="form-group">
        <LabelWithTooltip label="输出质量" tooltipText="生成JPG图片的压缩质量。100为最高质量，文件也最大。" />
        <div className="range-group">
          <input
            type="range"
            className="range-input"
            min="50"
            max="100"
            value={config.outputQuality}
            onChange={(e) => handleRangeChange('outputQuality', Number(e.target.value))}
          />
          <span className="range-value">{config.outputQuality}</span>
        </div>
      </div>

      {/* 输出宽高比 */}
      <div className="checkbox-group">
        <LabelWithTooltip label="启用自定义尺寸" tooltipText="开启后可手动设定输出图片的分辨率（宽度和高度）。" />
        <Switch 
          checked={config.useCustomOutputSize}
          onChange={(e) => handleCheckboxChange('useCustomOutputSize', e.target.checked)}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px' }}>
        <input
          type="number"
          className="form-control"
          value={config.outputWidth || ''}
          placeholder="宽"
          onChange={(e) => handleInputChange('outputWidth', Number(e.target.value) || 0)}
          style={{ flex: 1, textAlign: 'center' }}
          disabled={!config.useCustomOutputSize}
        />
        <span>×</span>
        <input
          type="number"
          className="form-control"
          value={config.outputHeight || ''}
          placeholder="高"
          onChange={(e) => handleInputChange('outputHeight', Number(e.target.value) || 0)}
          style={{ flex: 1, textAlign: 'center' }}
          disabled={!config.useCustomOutputSize}
        />
      </div>

      {/* 字体选择 */}
      <div className="form-group" style={{ marginTop: '20px' }}>
        <LabelWithTooltip label="字体选择" tooltipText="选择水印文字所使用的字体。" />
        <select
          className="form-control"
          value={config.fontFamily}
          onChange={(e) => handleInputChange('fontFamily', e.target.value)}
        >
          <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">系统默认</option>
          <option value="Arial, 'Helvetica Neue', Helvetica, sans-serif">Arial</option>
          <option value="'Times New Roman', Times, serif">Times New Roman</option>
          <option value="'Courier New', Courier, monospace">Courier New</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Verdana, Geneva, sans-serif">Verdana</option>
          <option value="'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', sans-serif">思源黑体/微软雅黑</option>
          <option value="'Songti SC', 'STSong', 'SimSun', '宋体', serif">宋体</option>
          <option value="'Kaiti SC', 'STKaiti', 'KaiTi', '楷体', serif">楷体</option>
        </select>
      </div>

      {/* 字体大小 */}
      <div className="form-group">
        <LabelWithTooltip label="字体大小" tooltipText="调整水印文字的相对大小。" />
        <div className="range-group">
          <input
            type="range"
            className="range-input"
            min="50"
            max="200"
            value={config.fontSizeRatio}
            onChange={(e) => handleRangeChange('fontSizeRatio', Number(e.target.value))}
          />
          <span className="range-value">{config.fontSizeRatio}%</span>
        </div>
      </div>

      {/* 其他开关 */}
      <div className="form-group" style={{ marginTop: '20px' }}>
        <div className="checkbox-group">
            <LabelWithTooltip label="纯色背景" tooltipText="使用从图片主色调提取的纯色作为背景，替代默认的毛玻璃效果。" />
            <Switch
              checked={config.pureBackground}
              onChange={(e) => handleCheckboxChange('pureBackground', e.target.checked)}
            />
        </div>
      </div>
      <div className="form-group">
        <div className="checkbox-group">
            <LabelWithTooltip label="横屏输出" tooltipText="强制将竖构图的照片也输出为横向画框，以保持所有图片布局统一。" />
            <Switch
              checked={config.landscapeOutput}
              onChange={(e) => handleCheckboxChange('landscapeOutput', e.target.checked)}
            />
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 