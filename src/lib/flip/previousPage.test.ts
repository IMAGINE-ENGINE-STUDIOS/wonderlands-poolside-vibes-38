// Copyright Imagine Engine Studios Corp.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { flipPreviousPage } from './previousPage';
describe('previous-page navigation', () => {
  test('allows portrait back arrows while retaining arrow-only interaction', () => {
    const settings = { disableFlipByClick: true };
    let page = 3;
    flipPreviousPage({ getCurrentPageIndex: () => page, getSettings: () => settings,
      flipPrev: () => { if (!settings.disableFlipByClick) page -= 1; } });
    assert.equal(page, 2);
    assert.equal(settings.disableFlipByClick, true);
  });
  test('does not turn before the first page', () => {
    let turns = 0;
    flipPreviousPage({ getCurrentPageIndex: () => 0,
      getSettings: () => ({ disableFlipByClick: true }), flipPrev: () => { turns += 1; } });
    assert.equal(turns, 0);
  });
  test('restores click protection if the library throws', () => {
    const settings = { disableFlipByClick: true };
    assert.throws(() => flipPreviousPage({ getCurrentPageIndex: () => 2, getSettings: () => settings,
      flipPrev: () => { throw new Error('turn failed'); } }), /turn failed/);
    assert.equal(settings.disableFlipByClick, true);
  });
});
