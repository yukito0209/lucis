import { PhotoData, WatermarkConfig } from '../types';
import { generateWatermarkText } from './exifUtils';

export interface GenerationProgress {
  current: number;
  total: number;
  currentFileName: string;
  status: 'processing' | 'completed' | 'error';
  message?: string;
}

export interface GenerationResult {
  success: boolean;
  processedCount: number;
  totalCount: number;
  errors: string[];
  outputPaths: string[];
}

/**
 * 生成单张照片的水印
 */
export async function generateSingleWatermark(
  photo: PhotoData,
  config: WatermarkConfig,
  outputPath: string
): Promise<{ success: boolean; error?: string; outputPath?: string }> {
  return new Promise((resolve) => {
    // 首先检查图片URL是否可用
    if (!photo.url) {
      console.error('图片URL为空:', photo.name);
      resolve({ success: false, error: '图片URL为空，可能需要重新加载' });
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
    
    if (!ctx) {
      resolve({ success: false, error: '无法创建Canvas上下文' });
      return;
    }

    const img = new Image();
    img.onload = async () => {
      try {
        // 计算输出尺寸
        const { width, height } = calculateOutputDimensions(img, config);
        canvas.width = width;
        canvas.height = height;

        // 绘制水印
        await drawWatermark(ctx, img, photo, config, width, height);

        // 转换为Blob并保存
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve({ success: false, error: '无法生成图片数据' });
            return;
          }

          try {
            const arrayBuffer = await blob.arrayBuffer();
            const fileName = generateOutputFileName(photo.name, config);
            // 使用正确的路径分隔符
            const fullOutputPath = outputPath.endsWith('\\') || outputPath.endsWith('/') 
              ? `${outputPath}${fileName}` 
              : `${outputPath}\\${fileName}`;

            console.log(`准备保存文件: ${fullOutputPath}, 大小: ${arrayBuffer.byteLength} bytes`);

            // 通过Electron API保存文件
            if (window.electronAPI) {
              await window.electronAPI.writeFile(fullOutputPath, arrayBuffer);
              console.log(`文件保存成功: ${fullOutputPath}`);
              resolve({ success: true, outputPath: fullOutputPath });
            } else {
              resolve({ success: false, error: 'Electron API不可用' });
            }
          } catch (error) {
            console.error(`保存文件失败:`, error);
            resolve({ success: false, error: `保存文件失败: ${error}` });
          }
        }, 'image/jpeg', config.outputQuality / 100);

      } catch (error) {
        resolve({ success: false, error: `处理图片失败: ${error}` });
      }
    };

    img.onerror = (event) => {
      console.error('图片加载失败:', photo.name, photo.url, event);
      resolve({ success: false, error: `加载图片失败: ${photo.url}` });
    };

    console.log('正在加载图片:', photo.name, photo.url);
    img.src = photo.url;
  });
}

/**
 * 批量生成水印
 */
export async function generateBatchWatermarks(
  photos: PhotoData[],
  config: WatermarkConfig,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GenerationResult> {
  const result: GenerationResult = {
    success: true,
    processedCount: 0,
    totalCount: photos.length,
    errors: [],
    outputPaths: []
  };

  if (!config.outputDir) {
    result.success = false;
    result.errors.push('未选择输出目录');
    return result;
  }

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    
    // 更新进度
    onProgress?.({
      current: i + 1,
      total: photos.length,
      currentFileName: photo.name,
      status: 'processing'
    });

    try {
      const generateResult = await generateSingleWatermark(photo, config, config.outputDir);
      
      if (generateResult.success) {
        result.processedCount++;
        if (generateResult.outputPath) {
          result.outputPaths.push(generateResult.outputPath);
        }
      } else {
        result.errors.push(`${photo.name}: ${generateResult.error}`);
      }
    } catch (error) {
      result.errors.push(`${photo.name}: ${error}`);
    }

    // 添加小延迟以避免阻塞UI
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // 最终进度更新
  onProgress?.({
    current: photos.length,
    total: photos.length,
    currentFileName: '',
    status: result.errors.length === 0 ? 'completed' : 'error',
    message: result.errors.length === 0 
      ? `成功生成 ${result.processedCount} 张图片` 
      : `生成完成，${result.errors.length} 个错误`
  });

  return result;
}

/**
 * 在Canvas上绘制水印 (现在导出以供预览使用)
 */
export async function drawWatermark(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  photo: PhotoData,
  config: WatermarkConfig,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> {
  // 确保Canvas处于干净状态
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换矩阵
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 1. 绘制背景
  if (config.pureBackground) {
    // 智能提取主题色并作为背景
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (tempCtx) {
      tempCanvas.width = 1;
      tempCanvas.height = 1;
      tempCtx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = tempCtx.getImageData(0, 0, 1, 1).data;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    } else {
      ctx.fillStyle = '#cccccc'; // 备用颜色
    }
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else {
    // 绘制毛玻璃背景 (原图模糊)
    const bgScale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
    const bgWidth = img.width * bgScale;
    const bgHeight = img.height * bgScale;
    const bgX = (canvasWidth - bgWidth) / 2;
    const bgY = (canvasHeight - bgHeight) / 2;

    ctx.save();
    // 使用相对于Canvas尺寸的模糊值，确保在不同尺寸下效果一致
    const blurAmount = Math.min(canvasWidth, canvasHeight) * 0.015; // 约为较短边的1.5%
    ctx.filter = `blur(${blurAmount}px) brightness(0.7)`;
    ctx.drawImage(img, bgX, bgY, bgWidth, bgHeight);
    ctx.restore();

    // 在模糊背景上叠加一层半透明深色，增强对比
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // 2. 计算照片布局
  const photoAreaHeight = canvasHeight * 0.90; // 为照片分配顶部78%的垂直空间，为文字留出更多空间
  const photoAreaWidth = canvasWidth * 0.9;
  const basePhotoScale = Math.min(photoAreaWidth / img.width, photoAreaHeight / img.height);
  const photoScale = basePhotoScale * (config.mainImageRatio / 100);

  const photoWidth = img.width * photoScale;
  const photoHeight = img.height * photoScale;

  // 将圆角值与照片的缩放比例关联，以确保在不同尺寸下视觉效果一致
  const photoCornerRadius = config.cornerRadius * photoScale;

  const photoX = (canvasWidth - photoWidth) / 2;
  const photoY = (photoAreaHeight - photoHeight) / 2; // 在其专属区域内垂直居中

  // 3. 绘制照片阴影
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  const shadowFactor = config.shadowSize / 100;
  ctx.shadowBlur = photoHeight * shadowFactor * 0.5;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = photoHeight * shadowFactor * 0.25;
  drawRoundedRect(ctx, photoX, photoY, photoWidth, photoHeight, photoCornerRadius);
  ctx.fillStyle = 'black';
  ctx.fill();
  ctx.restore();

  // 4. 绘制照片本体
  ctx.save();
  drawRoundedRect(ctx, photoX, photoY, photoWidth, photoHeight, photoCornerRadius);
  ctx.clip();
  ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
  ctx.restore();

  // 5. 绘制文字
  const { cameraText, paramsText } = generateWatermarkText(photo.exif || {});
  const baseFontSize = canvasWidth / 45; 
  const cameraFontSize = baseFontSize * (config.fontSizeRatio / 100);
  const paramsFontSize = cameraFontSize * 0.8;

  // 将文字块整体定位于照片与画布底边之间的区域
  const photoBottom = photoY + photoHeight;
  const textZoneStartY = photoBottom;
  const textZoneHeight = canvasHeight - textZoneStartY;
  
  // 计算文字块的整体高度
  const lineSpacing = cameraFontSize * 0.4;
  const totalTextBlockHeight = paramsFontSize + lineSpacing + cameraFontSize;

  // 计算每行文字的基线Y坐标，使其在文字区域内垂直居中
  const blockStartY = textZoneStartY + (textZoneHeight - totalTextBlockHeight) / 2;
  const paramsY = blockStartY + paramsFontSize;
  const cameraY = paramsY + lineSpacing + cameraFontSize;

  // 设置文字绘制状态
  ctx.save();
  ctx.fillStyle = '#fafafa';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.textAlign = 'center';

  // 绘制参数文字 (顶行，较小)
  ctx.font = `${paramsFontSize}px ${config.fontFamily}`;
  ctx.fillText(paramsText, canvasWidth / 2, paramsY);

  // 绘制相机文字 (底行，较大，加粗)
  ctx.font = `bold ${cameraFontSize}px ${config.fontFamily}`;
  ctx.fillText(cameraText, canvasWidth / 2, cameraY);
  
  ctx.restore(); // 恢复状态，清除shadow效果
}

/**
 * 绘制圆角矩形
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    // 手动绘制圆角矩形
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
  }
}

/**
 * 计算输出尺寸
 */
export function calculateOutputDimensions(
  img: HTMLImageElement,
  config: WatermarkConfig
): { width: number; height: number } {
  // 如果输出质量为100，则以原图尺寸为基础进行计算
  if (config.outputQuality === 100) {
    let width = img.width;
    let height = img.height;
    // 如果是竖图且勾选了"横屏输出"，则交换宽高
    if (config.landscapeOutput && height > width) {
        [width, height] = [height, width];
    }
    return { width, height };
  }

  // 如果启用了自定义尺寸，则直接使用
  if (config.useCustomOutputSize && config.outputWidth > 0 && config.outputHeight > 0) {
    return {
      width: config.outputWidth,
      height: config.outputHeight,
    };
  }

  // 自动尺寸计算：基于黄金比例创建具有美感的画框
  const isVertical = img.height > img.width;
  // 如果强制横屏输出，则使用横屏比例，否则根据图片方向自适应
  const targetAspectRatio = config.landscapeOutput ? 5 / 4 : (isVertical ? 4 / 5 : 5 / 4);

  const longestImgSide = Math.max(img.width, img.height);
  // 让图片最长边约等于最终画布最长边的75%
  const longestCanvasSide = longestImgSide / 0.75; 

  let width, height;
  // 根据目标长宽比计算最终尺寸
  if (config.landscapeOutput || !isVertical) {
    // 横屏逻辑
    width = longestCanvasSide;
    height = width / targetAspectRatio;
  } else {
    // 竖屏逻辑
    height = longestCanvasSide;
    width = height * targetAspectRatio;
  }

  // 确保画框有足够的空间容纳原图
  if (isVertical && width < img.width * 1.1) {
    width = img.width * 1.1;
  } else if (!isVertical && height < img.height * 1.1) {
    height = img.height * 1.1;
  }

  // 限制最大尺寸
  const maxDim = 4000;
  if (width > maxDim || height > maxDim) {
    const scaleDown = Math.min(maxDim / width, maxDim / height);
    width *= scaleDown;
    height *= scaleDown;
  }

  // 确保尺寸是偶数
  width = Math.round(width / 2) * 2;
  height = Math.round(height / 2) * 2;

  return { width, height };
}

/**
 * 生成输出文件名
 */
function generateOutputFileName(originalName: string, config: WatermarkConfig): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const timestamp = `_${Date.now()}`;
  return `${nameWithoutExt}_watermark${timestamp}.jpg`;
}

/**
 * 为图片创建一个小尺寸的缩略图
 * @param imageUrl 图片的URL (可以是blob URL)
 * @param targetSize 缩略图的目标尺寸（最长边）
 * @returns 包含缩略图的Data URL
 */
export function createThumbnail(
  imageUrl: string,
  targetSize: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('无法创建Canvas上下文'));
      }

      const aspectRatio = img.width / img.height;
      let width, height;

      if (img.width > img.height) {
        width = targetSize;
        height = targetSize / aspectRatio;
      } else {
        height = targetSize;
        width = targetSize * aspectRatio;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      reject(new Error('加载图片以生成缩略图失败'));
    };
    img.src = imageUrl;
  });
} 