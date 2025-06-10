import { PhotoExif } from '../types';

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
 */
export function getNormalizedCameraMake(make?: string): string | undefined {
  if (!make) return undefined;
  
  const normalizedMake = make.toLowerCase().trim();
  
  // 标准化相机品牌名称
  const brandMapping: { [key: string]: string } = {
    'canon': 'Canon',
    'nikon': 'Nikon', 
    'sony': 'Sony',
    'fujifilm': 'Fujifilm',
    'olympus': 'Olympus',
    'panasonic': 'Panasonic',
    'leica': 'Leica',
    'pentax': 'Pentax',
    'ricoh': 'Ricoh',
    'hasselblad': 'Hasselblad',
    'phase one': 'Phase One'
  };

  for (const [key, value] of Object.entries(brandMapping)) {
    if (normalizedMake.includes(key)) {
      return value;
    }
  }

  // 如果没有匹配到，返回首字母大写的原始值
  return make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
}

/**
 * 生成水印显示文本
 */
export function generateWatermarkText(exif: PhotoExif): {
  cameraText: string;
  paramsText: string;
} {
  // 相机和镜头信息
  const make = getNormalizedCameraMake(exif.make) || '';
  const model = exif.model || '';
  const cameraText = `${make} ${model}`.trim();

  // 拍摄参数信息
  const focalLength = formatFocalLength(exif.focalLength) || '';
  const aperture = exif.aperture || '';
  const shutterSpeed = exif.shutterSpeed || '';
  const iso = exif.iso ? `ISO${exif.iso}` : '';

  const paramsText = [focalLength, aperture, shutterSpeed, iso]
    .filter(Boolean)
    .join(' ');

  return {
    cameraText,
    paramsText
  };
} 