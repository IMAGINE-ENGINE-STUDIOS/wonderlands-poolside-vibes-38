import usePersistentState from '@/hooks/usePersistentState';

export type BoardDensity = 'compact' | 'full';

/**
 * Drawing board chrome preference, remembered across sessions.
 *
 * 'full'    — every helper panel, swatch carousel, preset row and takeoff strip
 * 'compact' — tools + canvas only; secondary panels stay hidden until re-enabled
 *
 * The value is shared by every drawing board (single cache key) so choosing
 * compact once keeps the boards quiet everywhere, including after a reload.
 */
export function useBoardDensity() {
  const [density, setDensity] = usePersistentState<BoardDensity>('board:density', 'full');
  const compact = density === 'compact';
  const toggle = () => setDensity(d => (d === 'compact' ? 'full' : 'compact'));
  return { density, compact, setDensity, toggle } as const;
}

export default useBoardDensity;
