export interface WatermarkConfig {
  outputDir: string;
  mainImageRatio: number;
  cornerRadius: number;
  shadowSize: number;
  outputQuality: number;
  outputWidth: number;
  outputHeight: number;
  pureBackground: boolean;
  landscapeOutput: boolean;
  useCustomOutputSize: boolean;
  fontFamily: string;
  fontSizeRatio: number;
}

export interface PhotoExif {
  // 相机信息
  make?: string;              // 相机品牌 (如: Canon, Nikon, Sony)
  model?: string;             // 相机型号 (如: EOS R5, Z fc)
  
  // 镜头信息
  lens?: string;              // 镜头型号
  lensModel?: string;         // 镜头型号的另一种字段
  
  // 拍摄参数
  fNumber?: number;           // 光圈值 (如: 2.8)
  aperture?: string;          // 格式化的光圈值 (如: f/2.8)
  exposureTime?: number;      // 快门速度秒数 (如: 0.00025 = 1/4000s)
  shutterSpeed?: string;      // 格式化的快门速度 (如: 1/4000s)
  iso?: number;               // ISO值 (如: 100)
  focalLength?: number;       // 焦距毫米数 (如: 85)
  focalLengthIn35mmFormat?: number; // 35mm等效焦距
  
  // 时间信息
  dateTime?: string;          // 拍摄时间
  dateTimeOriginal?: string;  // 原始拍摄时间
  
  // 其他信息
  flash?: number;             // 闪光灯信息
  whiteBalance?: number;      // 白平衡
  meteringMode?: number;      // 测光模式
  exposureMode?: number;      // 曝光模式
  
  // 图像信息
  imageWidth?: number;        // 图像宽度
  imageHeight?: number;       // 图像高度
  orientation?: number;       // 图像方向
}

export interface PhotoData {
  id: number;
  path: string;
  name: string;
  url: string;
  exif: PhotoExif | null;
  thumbnailUrl?: string;
  status: 'pending' | 'loading' | 'loaded' | 'error';
} 