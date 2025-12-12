import { useEffect, useState } from 'react';
import type { FC } from 'react';
import type { VideoInfo, Quality, DownloadTask } from '../types';
import { useVideoStore } from '../store';
import { formatFileSize, formatSpeed } from '../utils/parser';
import { i18n } from '../utils/i18n';
import { Download, Play, Pause, Check, AlertCircle, Video, Settings, RefreshCw } from 'lucide-react';

const App: FC = () => {
  const { videos, tasks, loading, setVideos, setTasks, updateTask, setLoading } = useVideoStore();
  const [activeTab, setActiveTab] = useState<'videos' | 'downloads'>('videos');

  useEffect(() => {
    loadVideos();
    loadTasks();
    
    const handleMessage = (message: any) => {
      if (message.type === 'PROGRESS_UPDATE') {
        updateTask(message.task);
      }
    };
    
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  const loadVideos = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_VIDEOS' });
        setVideos(response?.videos || []);
      }
    } catch (error) {
      console.log('No videos detected');
    }
    setLoading(false);
  };

  const loadTasks = async () => {
    const response = await chrome.runtime.sendMessage({ type: 'GET_TASKS' });
    setTasks(response?.tasks || []);
  };

  const handleRefresh = () => {
    setLoading(true);
    loadVideos();
  };

  return (
    <div className="bg-gray-900 text-white min-h-[400px] max-h-[600px] overflow-hidden flex flex-col">
      <Header onRefresh={handleRefresh} />
      <TabBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        videoCount={videos.length} 
        taskCount={tasks.filter(t => t.status === 'downloading').length} 
      />
      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'videos' ? (
          loading ? <LoadingState /> : 
          videos.length === 0 ? <EmptyState /> : 
          <VideoList videos={videos} tasks={tasks} />
        ) : (
          <DownloadList tasks={tasks} />
        )}
      </main>
      <Footer videoCount={videos.length} />
    </div>
  );
};

interface HeaderProps {
  onRefresh: () => void;
}

const Header: FC<HeaderProps> = ({ onRefresh }) => (
  <header className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
    <div className="flex items-center gap-2">
      <Video className="w-5 h-5 text-indigo-400" />
      <h1 className="font-semibold text-sm">{i18n.appTitle()}</h1>
    </div>
    <div className="flex items-center gap-1">
      <button onClick={onRefresh} className="p-1.5 hover:bg-gray-700 rounded-lg transition" title={i18n.refresh()}>
        <RefreshCw className="w-4 h-4 text-gray-400" />
      </button>
      <button className="p-1.5 hover:bg-gray-700 rounded-lg transition" title={i18n.settings()}>
        <Settings className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  </header>
);

interface TabBarProps {
  activeTab: 'videos' | 'downloads';
  onTabChange: (tab: 'videos' | 'downloads') => void;
  videoCount: number;
  taskCount: number;
}

const TabBar: FC<TabBarProps> = ({ activeTab, onTabChange, videoCount, taskCount }) => (
  <div className="flex border-b border-gray-700">
    <button
      onClick={() => onTabChange('videos')}
      className={`flex-1 py-2 text-sm font-medium transition ${
        activeTab === 'videos' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      {i18n.tabVideos()} {videoCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-indigo-500/20 rounded-full text-xs">{videoCount}</span>}
    </button>
    <button
      onClick={() => onTabChange('downloads')}
      className={`flex-1 py-2 text-sm font-medium transition ${
        activeTab === 'downloads' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      {i18n.tabDownloads()} {taskCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-green-500/20 rounded-full text-xs">{taskCount}</span>}
    </button>
  </div>
);

const LoadingState: FC = () => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
    <p>{i18n.detecting()}</p>
  </div>
);

const EmptyState: FC = () => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
    <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
    <p className="text-center">{i18n.noVideos()}</p>
    <p className="text-sm mt-1 opacity-70">{i18n.noVideosHint()}</p>
  </div>
);


interface VideoListProps {
  videos: VideoInfo[];
  tasks: DownloadTask[];
}

const VideoList: FC<VideoListProps> = ({ videos, tasks }) => (
  <div className="space-y-3">
    <p className="text-sm text-gray-400">{i18n.videosFound(videos.length)}</p>
    {videos.map(video => (
      <VideoCard key={video.id} video={video} task={tasks.find(t => t.videoId === video.id)} />
    ))}
  </div>
);

interface VideoCardProps {
  video: VideoInfo;
  task?: DownloadTask;
}

const VideoCard: FC<VideoCardProps> = ({ video, task }) => {
  const [selectedQuality, setSelectedQuality] = useState(video.qualities[0]);

  const handleDownload = async () => {
    await chrome.runtime.sendMessage({ type: 'START_DOWNLOAD', video, quality: selectedQuality });
  };

  const handlePause = async () => {
    if (task) await chrome.runtime.sendMessage({ type: 'PAUSE_DOWNLOAD', taskId: task.id });
  };

  const handleResume = async () => {
    if (task) await chrome.runtime.sendMessage({ type: 'RESUME_DOWNLOAD', taskId: task.id });
  };

  return (
    <div className="bg-gray-800 rounded-xl p-3 hover:bg-gray-750 transition">
      <div className="flex gap-3">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-24 h-16 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-24 h-16 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
            <Play className="w-6 h-6 text-gray-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate" title={video.title}>{video.title}</h3>
          {video.duration > 0 && <p className="text-xs text-gray-400 mt-0.5">{formatDuration(video.duration)}</p>}
          <div className="flex items-center gap-2 mt-2">
            <QualitySelector qualities={video.qualities} selected={selectedQuality} onChange={setSelectedQuality} />
            <DownloadButton task={task} onDownload={handleDownload} onPause={handlePause} onResume={handleResume} />
          </div>
        </div>
      </div>
      {task && task.status === 'downloading' && <ProgressBar progress={task.progress} speed={task.speed} />}
    </div>
  );
};

interface QualitySelectorProps {
  qualities: Quality[];
  selected: Quality;
  onChange: (quality: Quality) => void;
}

const QualitySelector: FC<QualitySelectorProps> = ({ qualities, selected, onChange }) => (
  <select
    value={selected.label}
    onChange={(e) => {
      const quality = qualities.find(q => q.label === e.target.value);
      if (quality) onChange(quality);
    }}
    className="bg-gray-700 text-xs px-2 py-1 rounded-lg border-none outline-none cursor-pointer"
  >
    {qualities.map(q => <option key={q.label} value={q.label}>{q.label}</option>)}
  </select>
);

interface DownloadButtonProps {
  task?: DownloadTask;
  onDownload: () => void;
  onPause: () => void;
  onResume: () => void;
}

const DownloadButton: FC<DownloadButtonProps> = ({ task, onDownload, onPause, onResume }) => {
  if (!task) {
    return (
      <button onClick={onDownload} className="bg-indigo-500 hover:bg-indigo-600 p-1.5 rounded-lg transition">
        <Download className="w-4 h-4" />
      </button>
    );
  }

  switch (task.status) {
    case 'downloading':
      return (
        <button onClick={onPause} className="bg-yellow-500 hover:bg-yellow-600 p-1.5 rounded-lg transition">
          <Pause className="w-4 h-4" />
        </button>
      );
    case 'paused':
      return (
        <button onClick={onResume} className="bg-green-500 hover:bg-green-600 p-1.5 rounded-lg transition">
          <Play className="w-4 h-4" />
        </button>
      );
    case 'completed':
      return <div className="bg-green-500 p-1.5 rounded-lg"><Check className="w-4 h-4" /></div>;
    default:
      return (
        <button onClick={onDownload} className="bg-indigo-500 hover:bg-indigo-600 p-1.5 rounded-lg transition">
          <Download className="w-4 h-4" />
        </button>
      );
  }
};

interface ProgressBarProps {
  progress: number;
  speed: number;
}

const ProgressBar: FC<ProgressBarProps> = ({ progress, speed }) => (
  <div className="mt-3">
    <div className="flex justify-between text-xs text-gray-400 mb-1">
      <span>{formatSpeed(speed)}</span>
      <span>{progress.toFixed(1)}%</span>
    </div>
    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
      <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
    </div>
  </div>
);

interface DownloadListProps {
  tasks: DownloadTask[];
}

const DownloadList: FC<DownloadListProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Download className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-center">{i18n.noDownloads()}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {tasks.map(task => <DownloadTaskCard key={task.id} task={task} />)}
    </div>
  );
};

interface DownloadTaskCardProps {
  task: DownloadTask;
}

const DownloadTaskCard: FC<DownloadTaskCardProps> = ({ task }) => {
  const handlePause = async () => {
    await chrome.runtime.sendMessage({ type: 'PAUSE_DOWNLOAD', taskId: task.id });
  };

  const handleResume = async () => {
    await chrome.runtime.sendMessage({ type: 'RESUME_DOWNLOAD', taskId: task.id });
  };

  const statusColors: Record<string, string> = {
    pending: 'text-gray-400',
    downloading: 'text-blue-400',
    paused: 'text-yellow-400',
    completed: 'text-green-400',
    error: 'text-red-400',
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending': return i18n.statusPending();
      case 'downloading': return i18n.statusDownloading();
      case 'paused': return i18n.statusPaused();
      case 'completed': return i18n.statusCompleted();
      case 'error': return i18n.statusError();
      default: return status;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm truncate flex-1" title={task.filename}>{task.filename}</h3>
        <span className={`text-xs ${statusColors[task.status]}`}>{getStatusText(task.status)}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>{formatFileSize(task.downloadedSize)} / {formatFileSize(task.totalSize)}</span>
        {task.status === 'downloading' && <span>{formatSpeed(task.speed)}</span>}
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            task.status === 'completed' ? 'bg-green-500' : task.status === 'error' ? 'bg-red-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${task.progress}%` }}
        />
      </div>
      <div className="flex justify-end gap-2">
        {task.status === 'downloading' && (
          <button onClick={handlePause} className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition">
            <Pause className="w-3 h-3 text-yellow-400" />
          </button>
        )}
        {task.status === 'paused' && (
          <button onClick={handleResume} className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition">
            <Play className="w-3 h-3 text-green-400" />
          </button>
        )}
      </div>
    </div>
  );
};

interface FooterProps {
  videoCount: number;
}

const Footer: FC<FooterProps> = ({ videoCount }) => (
  <footer className="px-4 py-2 border-t border-gray-700 text-xs text-gray-500 text-center">
    {i18n.footerText('1.0.0', videoCount)}
  </footer>
);

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default App;
