# Lucis 拾光 - 现代化照片水印工具

> 这是一个基于 Electron + React + TypeScript 构建的现代化照片水印工具，采用了最新的 Glassmorphism（玻璃拟态）设计风格。

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-lightpink.svg)
![Version](https://img.shields.io/badge/Version-v1.0.0-green.svg)

## 🌟 开发初衷

在使用照片水印工具 [yiyin](https://github.com/ggchivalrous/yiyin) 时，我发现它缺少一个重要功能：**无法实时预览水印效果**。每次调整参数都需要重新生成图片才能看到效果，导致效率不高。

为了解决这一问题，本人作为非专业开发者，决定使用 **Cursor** 作为开发助手，从零开始构建一个具有实时预览功能的照片水印工具。这个项目不仅解决了预览问题，还融入了现代化的 Glassmorphism 设计风格，提供更优雅的用户体验。当然，目前的功能还不完善，诸如自定义参数等功能将在后续版本陆续添加。

## 📸 界面预览

### 主界面截图
![image](https://github.com/user-attachments/assets/1fa001f8-1fe5-4699-bad5-f7574840b71d)
*现代化的 Glassmorphism 设计风格，左侧参数面板，中央实时预览区域*

### 实时预览截图
![image](https://github.com/user-attachments/assets/1d84f96b-a29a-48fc-8bfa-ba596ee1bd82)
*参数调整时的实时预览效果，无需重新生成即可看到变化*

## 🎨 生成效果展示

### 横图效果
![image](public/assets/samples/DSC01943_watermark_1749587643628.jpg)
*横构图照片的水印效果展示*

### 竖图效果  
![image](public/assets/samples/DSC02021_watermark_1749587644485.jpg)
*竖构图照片的水印效果展示*

## ✨ 核心特性

### 🎯 实时预览 - 主要创新
- **即时参数调整**: 任何设置变更都能立即在预览区域看到效果
- **无需重复生成**: 告别传统的"调整→生成→查看→重调"循环
- **缩放和拖拽**: 支持 Ctrl+滚轮缩放，鼠标拖拽查看细节
- **EXIF信息显示**: 可切换显示详细的拍摄参数信息

### 🎨 现代化设计
- **Glassmorphism 风格**: 采用最新的玻璃拟态设计语言
- **毛玻璃效果**: 真实的 backdrop-filter 模糊效果
- **动态交互**: 丰富的悬停动画和状态反馈
- **响应式布局**: 适配不同屏幕尺寸

### 🚀 强大功能
- **批量处理**: 一次性处理多张照片
- **智能布局**: 自动识别横竖图并优化布局
- **多种字体**: 丰富的中英文字体选择
- **自定义输出**: 灵活的尺寸和质量设置
- **快捷操作**: 键盘导航和鼠标手势支持

## 🛠️ 技术栈

- **桌面框架**: Electron 28
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **图像处理**: Canvas API + Sharp
- **EXIF 读取**: exifr
- **UI 优化**: react-window (虚拟滚动)
- **开发辅助**: Cursor AI

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn
- Windows 10+ / macOS 10.14+ / Linux

### 安装运行
```bash
# 克隆项目
git clone https://github.com/yukito0209/lucis.git
cd lucis

# 安装依赖
npm install

# 启动开发环境
npm run dev
```

### 构建发布
```bash
# 构建应用
npm run build

# 打包成安装程序
npm run dist
```

## 📋 功能详解

### 🎛️ 水印参数设置

| 参数 | 范围 | 说明 |
|------|------|------|
| 主图占比 | 50-100% | 控制照片在画框中的大小 |
| 圆角大小 | 0-200px | 设置照片的圆角程度 |
| 阴影大小 | 0-20 | 调整照片投影效果强度 |
| 输出质量 | 50-100 | 控制最终JPEG图片质量 |
| 背景模糊度 | 0-100 | 毛玻璃背景的模糊程度 |

### 🎨 布局选项
- **纯色背景**: 使用主题色替代毛玻璃背景
- **横屏输出**: 强制竖图也输出为横向布局
- **自定义尺寸**: 手动设置输出图片尺寸
- **等效焦距**: 35mm等效焦距显示

### ⌨️ 快捷操作
- `←/→` 箭头键：切换照片
- `Ctrl + 滚轮`：缩放预览
- `鼠标拖拽`：平移预览
- `滚轮` (在缩略图上)：快速切换

## 📁 项目结构

```
lucis/
├── electron/                 # Electron 主进程
│   ├── main.ts              # 窗口管理、文件操作
│   ├── preload.ts           # 渲染进程通信接口
│   └── tsconfig.json
├── src/                     # React 渲染进程
│   ├── components/          # UI 组件
│   │   ├── TitleBar.tsx     # 自定义标题栏
│   │   ├── Sidebar.tsx      # 参数设置面板
│   │   ├── PreviewArea.tsx  # 实时预览区域
│   │   ├── PhotoList.tsx    # 照片列表
│   │   ├── ExifInfo.tsx     # EXIF信息显示
│   │   ├── ProgressModal.tsx # 生成进度弹窗
│   │   ├── AboutModal.tsx   # 关于应用弹窗
│   │   └── Footer.tsx       # 底部操作区
│   ├── utils/              # 工具函数
│   │   ├── watermarkGenerator.ts # 水印生成核心
│   │   └── exifUtils.ts    # EXIF信息处理
│   ├── types/              # TypeScript 类型
│   ├── App.tsx             # 主应用组件
│   └── index.css           # Glassmorphism 样式
├── public/                 # 静态资源
│   └── assets/            # 图标、图片等
├── package.json
└── README.md
```

## 🎯 开发状态

**当前版本**: v1.0.0  
**开发状态**: 稳定版本  
**维护状态**: 活跃开发中

### ✅ 已实现功能

- ✅ **实时预览** - 核心创新功能
- ✅ **批量处理** - 一键生成所有照片
- ✅ **EXIF提取** - 自动读取拍摄参数
- ✅ **多种布局** - 横竖图自适应
- ✅ **参数调节** - 丰富的自定义选项
- ✅ **现代界面** - Glassmorphism 设计
- ✅ **快捷操作** - 键盘鼠标支持
- ✅ **进度显示** - 批量处理进度条

### 🚧 计划功能

- 🔄 **配置保存** - 用户设置持久化
- 🔄 **多种模板** - 不同风格的水印模板
- 🔄 **自定义参数** - 用户自定义水印参数信息
<!-- - 🔄 **RAW支持** - 更多原始格式支持 -->
<!-- - 🔄 **批量设置** - 不同照片使用不同参数 -->
<!-- - 🔄 **导出预设** - 保存和分享参数配置 -->

## ⚠️ 使用注意

1. **备份原图**: 建议先备份原始照片
2. **文件大小**: 超大图片可能处理较慢
3. **内存使用**: 批量处理时注意内存占用
4. **格式支持**: 主要支持 JPEG 格式
5. **存储空间**: 确保输出目录有足够空间

## 💖 支持作者

如果这个项目对您有帮助，欢迎请作者喝杯咖啡 ☕

<table>
  <tr>
    <td align="center">
      <strong>微信</strong><br/>
      <img src="public/assets/pay/wechat-pay.jpg" alt="微信收款码" width="200"/>
    </td>
    <td align="center">
      <strong>支付宝</strong><br/>
      <img src="public/assets/pay/alipay.jpg" alt="支付宝收款码" width="200"/>
    </td>
  </tr>
</table>

## 🙏 致谢

- **[yiyin](https://github.com/ggchivalrous/yiyin)**: 提供了项目灵感和参考

## 📄 许可证

[MIT LICENSE](LICENSE)


