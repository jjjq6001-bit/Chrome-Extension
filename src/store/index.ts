import { create } from 'zustand';
import type { VideoInfo, DownloadTask } from '../types';

interface VideoStore {
  videos: VideoInfo[];
  tasks: DownloadTask[];
  loading: boolean;
  setVideos: (videos: VideoInfo[]) => void;
  setTasks: (tasks: DownloadTask[]) => void;
  updateTask: (task: DownloadTask) => void;
  setLoading: (loading: boolean) => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  videos: [],
  tasks: [],
  loading: true,
  
  setVideos: (videos) => set({ videos }),
  
  setTasks: (tasks) => set({ tasks }),
  
  updateTask: (task) => set((state) => {
    const index = state.tasks.findIndex(t => t.id === task.id);
    if (index >= 0) {
      const newTasks = [...state.tasks];
      newTasks[index] = task;
      return { tasks: newTasks };
    }
    return { tasks: [...state.tasks, task] };
  }),
  
  setLoading: (loading) => set({ loading }),
}));

interface SettingsStore {
  theme: 'dark' | 'light';
  maxConcurrent: number;
  chunkSize: number;
  autoDownload: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  setMaxConcurrent: (max: number) => void;
  setChunkSize: (size: number) => void;
  setAutoDownload: (auto: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'dark',
  maxConcurrent: 3,
  chunkSize: 2 * 1024 * 1024,
  autoDownload: false,
  
  setTheme: (theme) => set({ theme }),
  setMaxConcurrent: (maxConcurrent) => set({ maxConcurrent }),
  setChunkSize: (chunkSize) => set({ chunkSize }),
  setAutoDownload: (autoDownload) => set({ autoDownload }),
}));
