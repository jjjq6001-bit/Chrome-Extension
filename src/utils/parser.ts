import type { VideoInfo, Quality } from '../types';

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '未知';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// 格式化下载速度
export function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '0 B/s';
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(1024));
  return `${(bytesPerSecond / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// 格式化时长
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 格式化剩余时间
export function formatETA(remainingBytes: number, speed: number): string {
  if (speed === 0) return '计算中...';
  const seconds = remainingBytes / speed;
  if (seconds < 60) return `${Math.ceil(seconds)}秒`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}分钟`;
  return `${Math.floor(seconds / 3600)}小时${Math.ceil((seconds % 3600) / 60)}分钟`;
}

// 清理文件名
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 200);
}

// 从 URL 提取文件扩展名
export function getExtensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match ? match[1].toLowerCase() : 'mp4';
  } catch {
    return 'mp4';
  }
}

// 检测视频类型
export function detectVideoType(url: string): VideoInfo['type'] {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('.m3u8')) return 'hls';
  if (lowerUrl.includes('.mpd')) return 'm3u8';
  if (lowerUrl.startsWith('blob:')) return 'blob';
  return 'video';
}

// 根据分辨率获取质量标签
export function getQualityLabel(height: number): string {
  if (height >= 2160) return '4K';
  if (height >= 1440) return '1440p';
  if (height >= 1080) return '1080p';
  if (height >= 720) return '720p';
  if (height >= 480) return '480p';
  if (height >= 360) return '360p';
  return '240p';
}

// 解析 M3U8 获取不同清晰度
export async function parseM3U8(url: string): Promise<Quality[]> {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const qualities: Quality[] = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXT-X-STREAM-INF:')) {
        const resMatch = line.match(/RESOLUTION=(\d+)x(\d+)/);
        const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
        const nextLine = lines[i + 1]?.trim();

        if (resMatch && nextLine && !nextLine.startsWith('#')) {
          const height = parseInt(resMatch[2]);
          const streamUrl = nextLine.startsWith('http') 
            ? nextLine 
            : new URL(nextLine, url).href;

          qualities.push({
            label: getQualityLabel(height),
            resolution: `${resMatch[1]}x${resMatch[2]}`,
            bitrate: bandwidthMatch ? parseInt(bandwidthMatch[1]) : undefined,
            url: streamUrl,
          });
        }
      }
    }

    // 按分辨率排序（高到低）
    qualities.sort((a, b) => {
      const heightA = parseInt(a.resolution.split('x')[1]) || 0;
      const heightB = parseInt(b.resolution.split('x')[1]) || 0;
      return heightB - heightA;
    });

    return qualities.length > 0 ? qualities : [{ label: 'Original', resolution: 'Unknown', url }];
  } catch {
    return [{ label: 'Original', resolution: 'Unknown', url }];
  }
}

// 生成唯一 ID
export function generateId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + Date.now().toString(36);
}
