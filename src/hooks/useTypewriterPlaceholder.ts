/**
 * Typewriter placeholder — types and erases phrases like keystrokes, with
 * slight human jitter. Pauses when `active` is false.
 * © Imagine Engine Studios Corp.
 */
import * as React from 'react';

export function useTypewriterPlaceholder(phrases: string[], active = true): string {
  const [text, setText] = React.useState('');
  React.useEffect(() => {
    if (!active || !phrases.length) return;
    let i = 0, pos = 0, deleting = false, timer: number;
    const tick = () => {
      const phrase = phrases[i % phrases.length];
      if (!deleting) {
        pos++;
        setText(phrase.slice(0, pos));
        if (pos >= phrase.length) { deleting = true; timer = window.setTimeout(tick, 1800); return; }
        timer = window.setTimeout(tick, 55 + Math.random() * 70);
      } else {
        pos--;
        setText(phrase.slice(0, pos));
        if (pos <= 0) { deleting = false; i++; timer = window.setTimeout(tick, 450); return; }
        timer = window.setTimeout(tick, 28);
      }
    };
    timer = window.setTimeout(tick, 400);
    return () => window.clearTimeout(timer);
  }, [phrases, active]);
  return text;
}
