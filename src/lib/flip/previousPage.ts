/** Copyright Imagine Engine Studios Corp.
 * page-flip's click guard rejects its own portrait flipPrev coordinates.
 * Bypass only the synchronous guard; pointer and corner interaction stay disabled.
 */
type PreviousPageBook = {
  getCurrentPageIndex(): number;
  getSettings(): { disableFlipByClick: boolean };
  flipPrev(): void;
};
export function flipPreviousPage(book: PreviousPageBook | null | undefined): void {
  if (!book || book.getCurrentPageIndex() <= 0) return;
  const settings = book.getSettings();
  const disabled = settings.disableFlipByClick;
  try {
    settings.disableFlipByClick = false;
    book.flipPrev();
  } finally {
    settings.disableFlipByClick = disabled;
  }
}
