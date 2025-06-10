import React, { useState } from 'react';
import './TitleBar.css';
import { VscChromeMinimize, VscChromeClose, VscInfo } from 'react-icons/vsc';
import { FaGithub } from 'react-icons/fa';
import AboutModal from './AboutModal';

const TitleBar: React.FC = () => {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };
  
  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  const handleAboutClick = () => {
    setIsAboutModalOpen(true);
  };

  const handleCloseAbout = () => {
    setIsAboutModalOpen(false);
  };

  const handleGithubClick = () => {
    window.electronAPI.openExternal('https://github.com/yukito0209/lucis');
  };

  return (
    <>
      <div className="title-bar">
        <div className="title-bar-drag-region">
          <div className="title-bar-left-buttons">
            <button className="title-bar-info-button" onClick={handleAboutClick} aria-label="About">
              <VscInfo />
            </button>
            <button className="title-bar-github-button" onClick={handleGithubClick} aria-label="GitHub">
              <FaGithub />
            </button>
          </div>
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
      
      <AboutModal 
        isOpen={isAboutModalOpen} 
        onClose={handleCloseAbout} 
      />
    </>
  );
};

export default TitleBar; 