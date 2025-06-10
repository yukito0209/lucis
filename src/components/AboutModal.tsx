import React from 'react';
import { VscClose, VscInfo } from 'react-icons/vsc';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={e => e.stopPropagation()}>
        <div className="about-modal-header">
          <h2>关于应用</h2>
          <button className="close-button" onClick={onClose}>
            <VscClose />
          </button>
        </div>
        
        <div className="about-modal-content">
          <div className="about-section">
            <h3>📷 Lucis 拾光 v1.0.0</h3>
            <p>这是一个直接生成图片水印的开源工具</p>
          </div>

          <div className="about-section">
            <h4>🔧 技术栈</h4>
            <ul>
              <li>Electron + React + TypeScript</li>
              <li>Glassmorphism 设计风格</li>
            </ul>
          </div>

          <div className="about-section">
            <h4>💬 交流群</h4>
            {/* <p>QQ交流群: <strong>  </strong></p> */}
            <p>对于任何使用上的问题或建议，欢迎加群讨论（也可以吹水）</p>
          </div>

          <div className="about-section">
            <h4>☕ 支持作者</h4>
            <p>当然如果能不白嫖就更好了(〃'▽'〃)</p>
            <div className="qr-codes">
              <div className="qr-code-item">
                <img 
                  src="/assets/pay/wechat-pay.jpg" 
                  alt="微信收款码" 
                  className="qr-code-image"
                />
                <p>微信</p>
              </div>
              <div className="qr-code-item">
                <img 
                  src="/assets/pay/alipay.jpg" 
                  alt="支付宝收款码" 
                  className="qr-code-image"
                />
                <p>支付宝</p>
              </div>
            </div>

            <div className="about-section">
              <h4>📄 版权信息</h4>
              <p>© 2025 yukito0209</p>
              <p>开源许可: MIT License</p>
              <p>本软件永远开源免费，欢迎贡献代码！</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal; 