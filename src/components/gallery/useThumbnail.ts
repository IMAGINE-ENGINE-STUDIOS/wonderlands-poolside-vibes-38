import { useState, useEffect } from 'react';

// Folder-scoped cache: Map<folderId, Map<originalUrl, thumbDataUrl>>
const folderCaches = new Map<string, Map<string, string>>();
const THUMB_SIZE = 200;

const getCache = (folderId: string): Map<string, string> => {
  if (!folderCaches.has(folderId)) {
    folderCaches.set(folderId, new Map());
  }
  return folderCaches.get(folderId)!;
};

export const clearFolderCache = (folderId: string) => {
  folderCaches.delete(folderId);
};

const generateThumbnail = (url: string): Promise<string> => {
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
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.5));
      } catch {
        resolve(url);
      }
    };
    img.onerror = () => reject(new Error('Load failed'));
    img.src = url;
  });
};

export const useThumbnail = (originalUrl: string, fileType: string | null, folderId?: string): string => {
  const isImage = fileType?.startsWith('image/');
  const cacheKey = folderId || '__global__';
  const cache = getCache(cacheKey);
  const [thumbUrl, setThumbUrl] = useState(() => (isImage ? cache.get(originalUrl) : undefined) || originalUrl);

  useEffect(() => {
    if (!isImage) return;
    const c = getCache(cacheKey);
    if (c.has(originalUrl)) {
      setThumbUrl(c.get(originalUrl)!);
      return;
    }
    let cancelled = false;
    generateThumbnail(originalUrl).then(url => {
      c.set(originalUrl, url);
      if (!cancelled) setThumbUrl(url);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [originalUrl, isImage, cacheKey]);

  return thumbUrl;
};
