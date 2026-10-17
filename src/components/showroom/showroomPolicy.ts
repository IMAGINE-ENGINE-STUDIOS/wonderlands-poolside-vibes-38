/** Copyright Imagine Engine Studios Corp. Explicit activation never follows scroll or cached state. */
export function isShowroomToolActive(requested: string, active: string | null): boolean {
  return requested === active;
}

export function showroomDesignView(widgetId: string): '2d' | '3d' {
  return widgetId === 'studio-3d' ? '3d' : '2d';
}