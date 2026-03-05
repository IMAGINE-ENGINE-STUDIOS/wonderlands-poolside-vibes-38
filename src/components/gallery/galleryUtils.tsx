import { GalleryFile } from '@/hooks/useGallery';
import { File, FileText, Film, Image } from 'lucide-react';

export const getFileIcon = (type: string | null, className = "h-8 w-8") => {
  if (!type) return <File className={`${className} text-muted-foreground`} />;
  if (type.startsWith('image/')) return <Image className={`${className} text-blue-500`} />;
  if (type.startsWith('video/')) return <Film className={`${className} text-purple-500`} />;
  if (type === 'application/pdf') return <FileText className={`${className} text-red-500`} />;
  return <File className={`${className} text-muted-foreground`} />;
};

export const formatSize = (bytes: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank');
  }
};

export const downloadFilesAsZip = async (files: GalleryFile[]) => {
  // Download files one by one (no zip library needed)
  for (const file of files) {
    await downloadFile(file.file_url, file.file_name);
    // Small delay between downloads
    await new Promise(r => setTimeout(r, 300));
  }
};

export const printFile = (url: string) => {
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      printWindow.print();
    });
  }
};

export const forwardFile = (url: string, filename: string) => {
  const subject = encodeURIComponent(`File: ${filename}`);
  const body = encodeURIComponent(`Here is the file "${filename}":\n\n${url}`);
  window.open(`mailto:?subject=${subject}&body=${body}`);
};
