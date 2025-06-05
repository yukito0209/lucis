import React from 'react';
import './TitleBar.css';
import { VscChromeMinimize, VscChromeClose } from 'react-icons/vsc';

const TitleBar: React.FC = () => {
  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };
  
  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  return (
    <div className="title-bar">
      <div className="title-bar-drag-region">
        <div className="title-text">📷 照片水印工具</div>
      </div>
      <div className="title-bar-controls">
        <button className="title-bar-button" onClick={handleMinimize} aria-label="Minimize">
          <VscChromeMinimize />
        </button>
        <button className="title-bar-button close" onClick={handleClose} aria-label="Close">
          <VscChromeClose />
        </button>
      </div>
    </div>
  );
};

export default TitleBar; 