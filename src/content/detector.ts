import type { VideoInfo, Quality } from '../types';

class VideoDetector {
  private videos: Map<string, VideoInfo> = new Map();
  private observer: MutationObserver | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    this.detectVideoElements();
    this.observeDOM();
    this.interceptMediaRequests();
    this.listenForMessages();
  }

  // 检测页面中的 video 元素
  private detectVideoElements(): void {
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach((video, index) => {
      this.processVideoElement(video, index);
    });
  }

  private processVideoElement(video: HTMLVideoElement, index: number): void {
    const sources: string[] = [];
    
    // 检查 video.src
    if (video.src) sources.push(video.src);
    
    // 检查 video.currentSrc (实际播放的源)
    if (video.currentSrc && !sources.includes(video.currentSrc)) {
      sources.push(video.currentSrc);
    }
    
    // 检查 <source> 子元素
    video.querySelectorAll('source').forEach(source => {
      if (source.src && !sources.includes(source.src)) {
        sources.push(source.src);
      }
    });

    console.log('VideoGrabber: Found video sources:', sources);

    sources.forEach(src => {
      if (this.isValidVideoUrl(src)) {
        this.addVideo(src, video, index);
      }
    });
  }

  private isValidVideoUrl(url: string): boolean {
    if (!url) return false;
    // 允许 blob URL（某些网站使用）
    if (url.startsWith('blob:')) return true;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m4v', '.mkv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('video') || 
           lowerUrl.includes('media');
  }

  private addVideo(url: string, element: HTMLVideoElement, index: number): void {
    const id = this.generateId(url);
    if (this.videos.has(id)) return;

    const videoInfo: VideoInfo = {
      id,
      url,
      title: this.extractTitle(element, index),
      duration: element.duration || 0,
      qualities: this.detectQualities(url, element),
      thumbnail: this.extractThumbnail(element),
      type: 'video',
    };

    this.videos.set(id, videoInfo);
    this.notifyBackground();
  }

  private detectQualities(url: string, element: HTMLVideoElement): Quality[] {
    const qualities: Quality[] = [];
    const width = element.videoWidth || 1920;
    const height = element.videoHeight || 1080;

    qualities.push({
      label: this.getQualityLabel(height),
      resolution: `${width}x${height}`,
      url,
    });

    return qualities;
  }

  private getQualityLabel(height: number): string {
    if (height >= 2160) return '4K';
    if (height >= 1440) return '1440p';
    if (height >= 1080) return '1080p';
    if (height >= 720) return '720p';
    if (height >= 480) return '480p';
    return '360p';
  }

  private extractTitle(element: HTMLVideoElement, index: number): string {
    return element.title || 
           document.title || 
           `Video ${index + 1}`;
  }

  private extractThumbnail(element: HTMLVideoElement): string | undefined {
    return element.poster || undefined;
  }

  private generateId(url: string): string {
    return btoa(url).slice(0, 16);
  }

  // 监听 DOM 变化
  private observeDOM(): void {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLVideoElement) {
            this.processVideoElement(node, this.videos.size);
          }
          if (node instanceof HTMLElement) {
            node.querySelectorAll('video').forEach((video, i) => {
              this.processVideoElement(video, this.videos.size + i);
            });
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // 拦截网络请求
  private interceptMediaRequests(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (this.isMediaResource(entry.name)) {
          this.addMediaUrl(entry.name);
        }
      });
    });
    
    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.log('PerformanceObserver not supported');
    }
  }

  private isMediaResource(url: string): boolean {
    const mediaPatterns = ['.mp4', '.webm', '.m3u8', '.mpd', 'video/', 'media/'];
    return mediaPatterns.some(pattern => url.includes(pattern));
  }

  private addMediaUrl(url: string): void {
    const id = this.generateId(url);
    if (this.videos.has(id)) return;

    const videoInfo: VideoInfo = {
      id,
      url,
      title: document.title || 'Video',
      duration: 0,
      qualities: [{ label: 'Original', resolution: 'Unknown', url }],
      type: url.includes('.m3u8') ? 'hls' : 'video',
    };

    this.videos.set(id, videoInfo);
    this.notifyBackground();
  }

  // 监听来自 popup 的消息
  private listenForMessages(): void {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'GET_VIDEOS') {
        sendResponse({ videos: Array.from(this.videos.values()) });
      }
      return true;
    });
  }

  private notifyBackground(): void {
    chrome.runtime.sendMessage({
      type: 'VIDEOS_DETECTED',
      videos: Array.from(this.videos.values()),
    }).catch(() => {});
  }
}

// 初始化检测器
new VideoDetector();
