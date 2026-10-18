import { describe, expect, test } from 'bun:test';
import { flipPreviousPage } from './previousPage';
describe('previous-page navigation', () => {
  test('allows portrait back arrows while retaining arrow-only interaction', () => {
    const settings = { disableFlipByClick: true };
    let page = 3;
    flipPreviousPage({ getCurrentPageIndex: () => page, getSettings: () => settings,
      flipPrev: () => { if (!settings.disableFlipByClick) page -= 1; } });
    expect(page).toBe(2);
    expect(settings.disableFlipByClick).toBe(true);
  });
  test('does not turn before the first page', () => {
    let turns = 0;
    flipPreviousPage({ getCurrentPageIndex: () => 0,
      getSettings: () => ({ disableFlipByClick: true }), flipPrev: () => { turns += 1; } });
    expect(turns).toBe(0);
  });
  test('restores click protection if the library throws', () => {
    const settings = { disableFlipByClick: true };
    expect(() => flipPreviousPage({ getCurrentPageIndex: () => 2, getSettings: () => settings,
      flipPrev: () => { throw new Error('turn failed'); } })).toThrow('turn failed');
    expect(settings.disableFlipByClick).toBe(true);
  });
});
