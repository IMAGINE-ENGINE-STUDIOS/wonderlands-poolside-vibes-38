import { describe, it as test } from 'node:test';
import { strict as assert } from 'node:assert';
import { isShowroomToolActive, showroomDesignView } from './showroomPolicy';

const expect = (actual: unknown) => ({ toBe: (expected: unknown) => assert.equal(actual, expected) });

describe('showroom launch rules', () => {
  test('no tool opens until explicitly selected', () => {
    expect(isShowroomToolActive('Website Builder', null)).toBe(false);
    expect(isShowroomToolActive('3D Studio', null)).toBe(false);
  });
  test('only the requested tool runs', () => {
    expect(isShowroomToolActive('3D Studio', '3D Studio')).toBe(true);
    expect(isShowroomToolActive('Website Builder', '3D Studio')).toBe(false);
  });
  test('the 3D widget uses 3D mode and former global and 2D widgets use 2D', () => {
    expect(showroomDesignView('studio-3d')).toBe('3d');
    expect(showroomDesignView('design-studio')).toBe('2d');
    expect(showroomDesignView('global-board')).toBe('2d');
    expect(showroomDesignView('site-planner')).toBe('2d');
  });
});