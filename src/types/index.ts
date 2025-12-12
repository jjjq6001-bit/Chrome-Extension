// 视频信息
export interface VideoInfo {
  id: string;
  url: string;
  title: string;
  duration: number;
  qualities: Quality[];
  thumbnail?: string;
  type: 'video' | 'blob' | 'hls' | 'm3u8';
  size?: number;
}

// 清晰度选项
export interface Quality {
  label: string;
  resolution: string;
  bitrate?: number;
  url: string;
  size?: number;
}

// 下载任务
export interface DownloadTask {
  id: string;
  videoId: string;
  url: string;
  filename: string;
  totalSize: number;
  downloadedSize: number;
  status: DownloadStatus;
  chunks: Chunk[];
  speed: number;
  progress: number;
  createdAt: number;
  completedAt?: number;
}

export type DownloadStatus = 'pending' | 'downloading' | 'paused' | 'completed' | 'error';

// 分片信息
export interface Chunk {
  index: number;
  start: number;
  end: number;
  downloaded: number;
  status: 'pending' | 'downloading' | 'completed';
}

// 消息类型
export type MessageType = 
  | { type: 'GET_VIDEOS' }
  | { type: 'VIDEOS_DETECTED'; videos: VideoInfo[] }
  | { type: 'START_DOWNLOAD'; video: VideoInfo; quality: Quality }
  | { type: 'PAUSE_DOWNLOAD'; taskId: string }
  | { type: 'RESUME_DOWNLOAD'; taskId: string }
  | { type: 'PROGRESS_UPDATE'; task: DownloadTask };
