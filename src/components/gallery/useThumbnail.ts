import { useState, useEffect } from 'react';

// Folder-scoped cache: Map<folderId, Map<originalUrl, thumbDataUrl>>
const folderCaches = new Map<string, Map<string, string>>();
// Higher res thumbnails that still look sharp but are lightweight
const THUMB_SIZE = 480;
const THUMB_QUALITY = 0.75;

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
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/webp', THUMB_QUALITY);
        // Clean up
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

/**
 * Returns a lightweight thumbnail data URL for images.
 * IMPORTANT: Never returns the original full-size URL for thumbnails —
 * returns empty string while generating, then the compressed data URL.
 * The full-size URL is only used in the FileViewer when opened.
 */
export const useThumbnail = (originalUrl: string, fileType: string | null, folderId?: string): { thumbUrl: string; isLoading: boolean } => {
  const isImage = fileType?.startsWith('image/');
  const cacheKey = folderId || '__global__';
  const cache = getCache(cacheKey);
  const cached = isImage ? cache.get(originalUrl) : undefined;
  const [thumbUrl, setThumbUrl] = useState<string>(cached || '');
  const [isLoading, setIsLoading] = useState(!cached && !!isImage);

  useEffect(() => {
    if (!isImage) return;
    const c = getCache(cacheKey);
    if (c.has(originalUrl)) {
      setThumbUrl(c.get(originalUrl)!);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    let cancelled = false;
    generateThumbnail(originalUrl).then(url => {
      c.set(originalUrl, url);
      if (!cancelled) {
        setThumbUrl(url);
        setIsLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [originalUrl, isImage, cacheKey]);

  // For non-images, just return the original URL (videos, etc.)
  if (!isImage) return { thumbUrl: originalUrl, isLoading: false };

  return { thumbUrl, isLoading };
};
