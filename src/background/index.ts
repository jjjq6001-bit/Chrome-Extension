import type { VideoInfo, Quality, DownloadTask, Chunk } from '../types';

class DownloadManager {
  private tasks: Map<string, DownloadTask> = new Map();
  private chunkSize = 2 * 1024 * 1024; // 2MB
  private maxConcurrent = 3;

  constructor() {
    this.init();
  }

  private init(): void {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true;
    });
  }

  private async handleMessage(message: any, sendResponse: (response: any) => void): Promise<void> {
    switch (message.type) {
      case 'START_DOWNLOAD':
        const taskId = await this.createTask(message.video, message.quality);
        this.startDownload(taskId);
        sendResponse({ taskId });
        break;
      case 'PAUSE_DOWNLOAD':
        this.pauseDownload(message.taskId);
        sendResponse({ success: true });
        break;
      case 'RESUME_DOWNLOAD':
        this.resumeDownload(message.taskId);
        sendResponse({ success: true });
        break;
      case 'GET_TASKS':
        sendResponse({ tasks: Array.from(this.tasks.values()) });
        break;
    }
  }

  private async createTask(video: VideoInfo, quality: Quality): Promise<string> {
    const taskId = crypto.randomUUID();
    const totalSize = await this.getFileSize(quality.url);
    
    const task: DownloadTask = {
      id: taskId,
      videoId: video.id,
      url: quality.url,
      filename: this.sanitizeFilename(`${video.title}_${quality.label}.mp4`),
      totalSize,
      downloadedSize: 0,
      status: 'pending',
      chunks: this.createChunks(totalSize),
      speed: 0,
      progress: 0,
      createdAt: Date.now(),
    };

    this.tasks.set(taskId, task);
    await this.saveTask(task);
    return taskId;
  }

  private async getFileSize(url: string): Promise<number> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : 0;
    } catch {
      return 0;
    }
  }

  private createChunks(totalSize: number): Chunk[] {
    if (totalSize === 0) {
      return [{ index: 0, start: 0, end: -1, downloaded: 0, status: 'pending' }];
    }

    const chunks: Chunk[] = [];
    let start = 0;
    let index = 0;

    while (start < totalSize) {
      const end = Math.min(start + this.chunkSize - 1, totalSize - 1);
      chunks.push({ index, start, end, downloaded: 0, status: 'pending' });
      start = end + 1;
      index++;
    }

    return chunks;
  }

  private async startDownload(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'downloading';
    
    // 简单下载模式（无分片）
    if (task.totalSize === 0 || task.chunks.length === 1) {
      await this.simpleDownload(task);
      return;
    }

    // 多线程分片下载
    await this.chunkedDownload(task);
  }

  private async simpleDownload(task: DownloadTask): Promise<void> {
    try {
      console.log('Starting download:', task.url);
      
      // 使用 Chrome Downloads API
      const downloadId = await chrome.downloads.download({
        url: task.url,
        filename: task.filename,
        saveAs: true,
      });

      console.log('Download started with ID:', downloadId);

      if (downloadId) {
        // 监听下载进度
        const listener = (delta: chrome.downloads.DownloadDelta) => {
          if (delta.id === downloadId) {
            if (delta.state?.current === 'complete') {
              task.status = 'completed';
              task.progress = 100;
              task.completedAt = Date.now();
              this.notifyProgress(task);
              chrome.downloads.onChanged.removeListener(listener);
            } else if (delta.state?.current === 'interrupted') {
              task.status = 'error';
              this.notifyProgress(task);
              chrome.downloads.onChanged.removeListener(listener);
            }
          }
        };
        
        chrome.downloads.onChanged.addListener(listener);
        
        // 更新状态为下载中
        task.status = 'downloading';
        this.notifyProgress(task);
      }
    } catch (error) {
      task.status = 'error';
      console.error('Download failed:', error);
      this.notifyProgress(task);
    }
  }

  private async chunkedDownload(task: DownloadTask): Promise<void> {
    const pendingChunks = task.chunks.filter(c => c.status !== 'completed');
    const downloadQueue = [...pendingChunks];
    const activeDownloads: Promise<void>[] = [];

    while (downloadQueue.length > 0 || activeDownloads.length > 0) {
      if (task.status === 'paused') break;

      while (activeDownloads.length < this.maxConcurrent && downloadQueue.length > 0) {
        const chunk = downloadQueue.shift()!;
        const downloadPromise = this.downloadChunk(task, chunk)
          .finally(() => {
            const index = activeDownloads.indexOf(downloadPromise);
            if (index > -1) activeDownloads.splice(index, 1);
          });
        activeDownloads.push(downloadPromise);
      }

      if (activeDownloads.length > 0) {
        await Promise.race(activeDownloads);
      }
    }

    if (task.chunks.every(c => c.status === 'completed')) {
      task.status = 'completed';
      task.progress = 100;
      task.completedAt = Date.now();
    }

    this.notifyProgress(task);
  }

  private async downloadChunk(task: DownloadTask, chunk: Chunk): Promise<void> {
    try {
      chunk.status = 'downloading';
      
      const headers: HeadersInit = {};
      if (chunk.end !== -1) {
        headers['Range'] = `bytes=${chunk.start + chunk.downloaded}-${chunk.end}`;
      }

      const response = await fetch(task.url, { headers });
      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunk.downloaded += value.length;
        task.downloadedSize += value.length;
        task.progress = task.totalSize > 0 
          ? (task.downloadedSize / task.totalSize) * 100 
          : 0;

        this.notifyProgress(task);
      }

      chunk.status = 'completed';
    } catch (error) {
      console.error('Chunk download failed:', error);
    }
  }

  private pauseDownload(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'downloading') {
      task.status = 'paused';
      this.saveTask(task);
      this.notifyProgress(task);
    }
  }

  private async resumeDownload(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'paused') {
      await this.startDownload(taskId);
    }
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[<>:"/\\|?*]/g, '_').slice(0, 200);
  }

  private async saveTask(task: DownloadTask): Promise<void> {
    await chrome.storage.local.set({ [`task_${task.id}`]: task });
  }

  private notifyProgress(task: DownloadTask): void {
    chrome.runtime.sendMessage({
      type: 'PROGRESS_UPDATE',
      task,
    }).catch(() => {});
  }
}

// 初始化下载管理器
new DownloadManager();
