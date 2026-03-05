import { useState, useEffect, useRef } from 'react';

// Folder-scoped cache: Map<folderId, Map<originalUrl, thumbDataUrl>>
const folderCaches = new Map<string, Map<string, string>>();
const THUMB_SIZE = 480;
const THUMB_QUALITY = 0.75;
const MAX_CONCURRENT = 3; // Max simultaneous thumbnail generations

const getCache = (folderId: string): Map<string, string> => {
  if (!folderCaches.has(folderId)) {
    folderCaches.set(folderId, new Map());
  }
  return folderCaches.get(folderId)!;
};

export const clearFolderCache = (folderId: string) => {
  folderCaches.delete(folderId);
};

// ── Priority queue for thumbnail generation ──
type QueueEntry = {
  url: string;
  priority: number; // lower = higher priority (render order)
  resolve: (dataUrl: string) => void;
  reject: (err: Error) => void;
  cancelled: boolean;
};

let queue: QueueEntry[] = [];
let activeCount = 0;

const processQueue = () => {
  while (activeCount < MAX_CONCURRENT && queue.length > 0) {
    // Sort so lowest priority number (topmost on screen) goes first
    queue.sort((a, b) => a.priority - b.priority);
    const entry = queue.shift()!;
    if (entry.cancelled) {
      continue;
    }
    activeCount++;
    generateThumbnailRaw(entry.url)
      .then((dataUrl) => {
        if (!entry.cancelled) entry.resolve(dataUrl);
      })
      .catch((err) => {
        if (!entry.cancelled) entry.reject(err);
      })
      .finally(() => {
        activeCount--;
        processQueue();
      });
  }
};

const enqueue = (url: string, priority: number): { promise: Promise<string>; entry: QueueEntry } => {
  let resolve!: (v: string) => void;
  let reject!: (e: Error) => void;
  const promise = new Promise<string>((res, rej) => { resolve = res; reject = rej; });
  const entry: QueueEntry = { url, priority, resolve, reject, cancelled: false };
  queue.push(entry);
  processQueue();
  return { promise, entry };
};

const generateThumbnailRaw = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(THUMB_SIZE / img.naturalWidth, THUMB_SIZE / img.naturalHeight, 1);
        canvas.width = Math.round(img.naturalWidth * ratio);
        canvas.height = Math.round(img.naturalHeight * ratio);
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/webp', THUMB_QUALITY);
        canvas.width = 0;
        canvas.height = 0;
        resolve(dataUrl);
      } catch {
        resolve(url);
      }
    };
    img.onerror = () => reject(new Error('Load failed'));
    img.src = url;
  });
};

// Global counter so the first hook instances to mount get lowest priority numbers
let mountCounter = 0;

/**
 * Returns a lightweight thumbnail data URL for images.
 * Uses a priority queue so files rendered first (top of grid) load first.
 */
export const useThumbnail = (
  originalUrl: string,
  fileType: string | null,
  folderId?: string,
): { thumbUrl: string; isLoading: boolean } => {
  const isImage = fileType?.startsWith('image/');
  const cacheKey = folderId || '__global__';
  const cache = getCache(cacheKey);
  const cached = isImage ? cache.get(originalUrl) : undefined;
  const [thumbUrl, setThumbUrl] = useState<string>(cached || '');
  const [isLoading, setIsLoading] = useState(!cached && !!isImage);
  const priorityRef = useRef(() => mountCounter++);
  const priority = priorityRef.current();

  useEffect(() => {
    if (!isImage) return;
    const c = getCache(cacheKey);
    if (c.has(originalUrl)) {
      setThumbUrl(c.get(originalUrl)!);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { promise, entry } = enqueue(originalUrl, priority);
    promise
      .then((url) => {
        c.set(originalUrl, url);
        if (!entry.cancelled) {
          setThumbUrl(url);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!entry.cancelled) setIsLoading(false);
      });
    return () => {
      entry.cancelled = true;
    };
  }, [originalUrl, isImage, cacheKey, priority]);

  if (!isImage) return { thumbUrl: originalUrl, isLoading: false };
  return { thumbUrl, isLoading };
};
