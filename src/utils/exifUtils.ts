import * as exifr from 'exifr';
import { PhotoExif } from '../types';

/**
 * 从照片文件中提取EXIF信息
 */
export async function extractExifFromFile(file: File): Promise<PhotoExif | null> {
  try {
    const exifData = await exifr.parse(file, {
      // 指定要提取的EXIF字段
      pick: [
        'Make', 'Model', 'LensModel', 'LensInfo',
        'FNumber', 'ExposureTime', 'ISO', 'FocalLength', 'FocalLengthIn35mmFormat',
        'DateTime', 'DateTimeOriginal', 
        'Flash', 'WhiteBalance', 'MeteringMode', 'ExposureMode',
        'ImageWidth', 'ImageHeight', 'Orientation'
      ],
      // 包含厂商特定的字段
      tiff: true,
      ifd1: true,
      exif: true,
      gps: false, // 不需要GPS信息
      interop: false
    });

    if (!exifData) {
      return null;
    }

    // 格式化EXIF数据
    const formattedExif: PhotoExif = {
      // 相机信息
      make: exifData.Make,
      model: exifData.Model,
      
      // 镜头信息
      lens: exifData.LensModel || exifData.LensInfo,
      lensModel: exifData.LensModel,
      
      // 拍摄参数
      fNumber: exifData.FNumber,
      aperture: exifData.FNumber ? `f/${exifData.FNumber}` : undefined,
      exposureTime: exifData.ExposureTime,
      shutterSpeed: formatShutterSpeed(exifData.ExposureTime),
      iso: exifData.ISO,
      focalLength: exifData.FocalLength,
      focalLengthIn35mmFormat: exifData.FocalLengthIn35mmFormat,
      
      // 时间信息
      dateTime: exifData.DateTime,
      dateTimeOriginal: exifData.DateTimeOriginal,
      
      // 其他信息
      flash: exifData.Flash,
      whiteBalance: exifData.WhiteBalance,
      meteringMode: exifData.MeteringMode,
      exposureMode: exifData.ExposureMode,
      
      // 图像信息
      imageWidth: exifData.ImageWidth,
      imageHeight: exifData.ImageHeight,
      orientation: exifData.Orientation
    };

    return formattedExif;
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    return null;
  }
}

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