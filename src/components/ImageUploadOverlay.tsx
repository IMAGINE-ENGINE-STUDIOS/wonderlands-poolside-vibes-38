import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface ImageUploadOverlayProps {
  imageKey: string;
  isEditMode: boolean;
  imageOverrides: Record<string, string>;
  onImageOverride: (key: string, dataUrl: string) => void;
  children: React.ReactNode;
}

const ImageUploadOverlay: React.FC<ImageUploadOverlayProps> = ({
  imageKey,
  isEditMode,
  imageOverrides,
  onImageOverride,
  children,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageOverride(imageKey, reader.result);
      }
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="relative">
      {children}
      {isEditMode && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-1 left-1 z-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-md transition-colors no-print print:hidden"
            title="Replace image"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
};

export default ImageUploadOverlay;
