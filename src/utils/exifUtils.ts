import { PhotoExif, WatermarkConfig } from '../types';

/**
 * 格式化快门速度
 */
function formatShutterSpeed(exposureTime?: number): string | undefined {
  if (!exposureTime) return undefined;
  
  if (exposureTime >= 1) {
    // 大于等于1秒的快门速度
    return `${exposureTime}s`;
  } else {
    // 小于1秒的快门速度，转换为分数形式
    const fraction = 1 / exposureTime;
    if (fraction > 1) {
      return `1/${Math.round(fraction)}s`;
    }
  }
  
  return `${exposureTime}s`;
}

/**
 * 格式化焦距显示
 */
export function formatFocalLength(focalLength?: number): string | undefined {
  if (!focalLength) return undefined;
  return `${Math.round(focalLength)}mm`;
}

/**
 * 获取相机品牌的标准化名称
 * @returns 返回一个小写的、标准化的品牌名称，用于匹配logo文件名，例如 'sony', 'canon'
 */
export function getNormalizedCameraMake(make?: string): string | undefined {
  if (!make) return undefined;
  
  const normalizedMake = make.toLowerCase().trim();
  
  // 标准化相机品牌名称
  const brandMapping: { [key: string]: string } = {
    'canon': 'canon',
    'nikon': 'nikon', 
    'sony': 'sony',
    'fujifilm': 'fujifilm',
    'olympus': 'olympus',
    'panasonic': 'panasonic',
    'leica': 'leica',
    'pentax': 'pentax',
    'ricoh': 'ricoh',
    'hasselblad': 'hasselblad',
    'phase one': 'phase one'
  };

  for (const [key, value] of Object.entries(brandMapping)) {
    if (normalizedMake.includes(key)) {
      return value;
    }
  }

  // 如果没有匹配到，直接返回小写的原始值
  return normalizedMake;
}

/**
 * 生成水印显示文本
 */
export function generateWatermarkText(exif: PhotoExif, config: WatermarkConfig): {
  brandName: string | undefined;
  modelText: string;
  paramsText: string;
} {
  // 相机和镜头信息
  const brandName = getNormalizedCameraMake(exif.make);
  let modelText = exif.model || '';

  // 增加处理逻辑：如果相机型号本身已经包含了品牌名，则移除品牌名，避免重复显示
  if (brandName && modelText.toLowerCase().startsWith(brandName.toLowerCase())) {
    modelText = modelText.slice(brandName.length).trim();
  }

  // 根据配置决定使用哪个焦距
  const focalLengthValue = config.use35mmEquivalent && exif.focalLengthIn35mmFormat 
    ? exif.focalLengthIn35mmFormat 
    : exif.focalLength;

  // 拍摄参数信息
  const focalLength = formatFocalLength(focalLengthValue) || '';
  const aperture = exif.aperture || '';
  const shutterSpeed = exif.shutterSpeed || '';
  const iso = exif.iso ? `ISO${exif.iso}` : '';

  const paramsText = [focalLength, aperture, shutterSpeed, iso]
    .filter(Boolean)
    .join(' ');

  return {
    brandName,
    modelText,
    paramsText
  };
} 