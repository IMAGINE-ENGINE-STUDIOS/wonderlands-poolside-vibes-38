import { useState, useEffect } from 'react';

const cache = new Map<string, string>();
const THUMB_SIZE = 200;

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

export const useThumbnail = (originalUrl: string, fileType: string | null): string => {
  const isImage = fileType?.startsWith('image/');
  const [thumbUrl, setThumbUrl] = useState(() => (isImage ? cache.get(originalUrl) : undefined) || originalUrl);

  useEffect(() => {
    if (!isImage) return;
    if (cache.has(originalUrl)) {
      setThumbUrl(cache.get(originalUrl)!);
      return;
    }
    let cancelled = false;
    generateThumbnail(originalUrl).then(url => {
      cache.set(originalUrl, url);
      if (!cancelled) setThumbUrl(url);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [originalUrl, isImage]);

  return thumbUrl;
};
