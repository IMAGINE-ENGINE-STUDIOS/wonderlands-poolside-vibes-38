/**
 * Gallery Flip Book — presents a customer folder's images in the platform's
 * FLIP Book V3 reader (components/flip/FlipBookReader, the site builder's
 * viewer). The book is built in memory from the folder's files: a cover leaf
 * plus one leaf per image, in the folder's order. Nothing is saved or
 * published — it is a reading view of the gallery, opened from the Files
 * page header or from the image viewer.
 *
 * Page images use the storage render endpoint at book size (1600×1000)
 * instead of the 7–33 MB originals, so pages turn fast; the reader still
 * lazy-loads each leaf's image.
 */

import { useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { GalleryFile } from '@/hooks/useGallery';
import { galleryRenderUrl } from './useThumbnail';
import FlipBookReader from '@/components/flip/FlipBookReader';
import { blankDocV3 } from '@/components/flip/flipBuilderV2Types';
import type { BuilderDocV2 } from '@/components/flip/flipBuilderV2Types';
import type { BuilderPage } from '@/components/flip/flipBuilderTypes';

const pageImage = (file: GalleryFile): string =>
  galleryRenderUrl(file.file_url, { width: 1600, height: 1000, resize: 'cover', quality: 80 }) ?? file.file_url;

export const buildGalleryBook = (folderName: string, files: GalleryFile[], startFileId?: string): BuilderDocV2 => {
  const images = files.filter(f => f.file_type?.startsWith('image/'));
  const base = blankDocV3();
  const pages: BuilderPage[] = [];

  const coverFile = images.find(f => f.id === startFileId) ?? images[0];
  const coverSrc = coverFile ? pageImage(coverFile) : undefined;
  pages.push({
    id: 'gallery-cover',
    name: 'Cover',
    tone: 'cover',
    transition: 'flip',
    background: coverSrc,
    blocks: [
      {
        id: 'cover-eyebrow', kind: 'text', x: 8, y: 57, w: 84, h: 6,
        text: 'Wonderlands — Client Gallery', style: 'eyebrow', tone: 'light', align: 'left',
      },
      {
        id: 'cover-title', kind: 'text', x: 8, y: 63, w: 84, h: 18,
        text: folderName, style: 'title', tone: 'light', align: 'left',
      },
      {
        id: 'cover-count', kind: 'text', x: 8, y: 84, w: 84, h: 5,
        text: `${images.length} image${images.length !== 1 ? 's' : ''}`, style: 'caption', tone: 'light', align: 'left',
      },
    ],
  });

  images.forEach((file, i) => {
    pages.push({
      id: `gallery-page-${file.id}`,
      name: file.file_name,
      tone: 'paper',
      transition: 'flip',
      blocks: [
        {
          id: `img-${file.id}`, kind: 'image', x: 0, y: 17, w: 100, h: 50,
          src: pageImage(file), text: file.file_name,
        },
        {
          id: `cap-${file.id}`, kind: 'text', x: 8, y: 72, w: 84, h: 6,
          text: file.file_name, style: 'caption', align: 'center',
        },
        {
          id: `num-${file.id}`, kind: 'text', x: 8, y: 79, w: 84, h: 5,
          text: `${i + 1} / ${images.length}`, style: 'caption', align: 'center',
        },
      ],
    });
  });

  return {
    ...base,
    title: folderName,
    pages,
    theme: { ...base.theme, shareButton: false, studyButton: false },
  };
};

interface GalleryFlipBookProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderName: string;
  files: GalleryFile[];
  /** Id of the image the reader was opened from (used as the cover image). */
  startFileId?: string;
}

const GalleryFlipBook = ({ open, onOpenChange, folderName, files, startFileId }: GalleryFlipBookProps) => {
  const doc = useMemo(
    () => (open ? buildGalleryBook(folderName, files, startFileId) : null),
    [open, folderName, files, startFileId],
  );

  if (!open || !doc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[97vw] max-h-[97vh] w-[97vw] h-[97vh] p-0 gap-0 flex flex-col bg-white border-zinc-200 [&>button]:hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 shrink-0">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500">Flip Book</p>
            <p className="font-serif text-lg font-light text-zinc-950 truncate">{folderName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-none text-zinc-700 hover:text-zinc-950"
            onClick={() => onOpenChange(false)}
            aria-label="Close flip book"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <FlipBookReader doc={doc} className="h-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryFlipBook;
