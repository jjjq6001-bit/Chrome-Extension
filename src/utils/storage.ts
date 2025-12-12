import type { DownloadTask } from '../types';

class StorageManager {
  private db: IDBDatabase | null = null;
  private dbName = 'VideoGrabberDB';
  private dbVersion = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('chunks')) {
          const store = db.createObjectStore('chunks', { keyPath: ['taskId', 'index'] });
          store.createIndex('taskId', 'taskId');
        }

        if (!db.objectStoreNames.contains('history')) {
          const store = db.createObjectStore('history', { keyPath: 'id' });
          store.createIndex('date', 'completedAt');
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveTask(task: DownloadTask): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('tasks', 'readwrite');
      const store = tx.objectStore('tasks');
      const request = store.put(task);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async loadTask(taskId: string): Promise<DownloadTask | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('tasks', 'readonly');
      const store = tx.objectStore('tasks');
      const request = store.get(taskId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTasks(): Promise<DownloadTask[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('tasks', 'readonly');
      const store = tx.objectStore('tasks');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('tasks', 'readwrite');
      const store = tx.objectStore('tasks');
      const request = store.delete(taskId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveChunkData(taskId: string, chunkIndex: number, data: Uint8Array): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('chunks', 'readwrite');
      const store = tx.objectStore('chunks');
      const request = store.put({ taskId, index: chunkIndex, data });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getChunkData(taskId: string, chunkIndex: number): Promise<Uint8Array | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('chunks', 'readonly');
      const store = tx.objectStore('chunks');
      const request = store.get([taskId, chunkIndex]);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }

  async addToHistory(task: DownloadTask): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('history', 'readwrite');
      const store = tx.objectStore('history');
      const request = store.put({
        id: task.id,
        filename: task.filename,
        url: task.url,
        totalSize: task.totalSize,
        completedAt: task.completedAt || Date.now(),
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getHistory(limit = 50): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('history', 'readonly');
      const store = tx.objectStore('history');
      const index = store.index('date');
      const request = index.openCursor(null, 'prev');
      const results: any[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const storage = new StorageManager();
