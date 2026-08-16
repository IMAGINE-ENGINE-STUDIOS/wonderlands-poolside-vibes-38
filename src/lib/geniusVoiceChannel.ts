/**
 * Genius' single voice channel.
 *
 * Every spoken word — a page reading or a conversational answer — plays through
 * one shared <audio> element, so two voices can never overlap and any listener
 * (the microphone session, the panel UI) always knows whether she is speaking.
 * Stopping the channel is what makes barge-in possible: the guest talks, she
 * goes quiet instantly.
 */

let audio: HTMLAudioElement | null = null;
let speaking = false;
const listeners = new Set<(speaking: boolean) => void>();

/** Mid volume — she speaks over the page, never across it. */
export const GENIUS_VOLUME = 0.55;

const emit = (next: boolean) => {
  if (speaking === next) return;
  speaking = next;
  listeners.forEach((l) => l(next));
};

const element = (): HTMLAudioElement => {
  if (audio) return audio;
  const el = new Audio();
  el.preload = 'auto';
  el.volume = GENIUS_VOLUME;
  el.onended = () => emit(false);
  el.onpause = () => emit(false);
  el.onerror = () => emit(false);
  audio = el;
  return el;
};

/** Play a clip, replacing anything currently being spoken. Resolves when it ends. */
export async function playGeniusVoice(url: string): Promise<void> {
  const el = element();
  try {
    el.pause();
    el.src = url;
    el.currentTime = 0;
    el.volume = GENIUS_VOLUME;
    emit(true);
    await el.play();
  } catch {
    emit(false);
    return;
  }
  if (el.ended) return;
  await new Promise<void>((resolve) => {
    const done = () => {
      el.removeEventListener('ended', done);
      el.removeEventListener('pause', done);
      el.removeEventListener('error', done);
      resolve();
    };
    el.addEventListener('ended', done);
    el.addEventListener('pause', done);
    el.addEventListener('error', done);
  });
}

/** Silence her at once — used for barge-in and when a new page opens. */
export function stopGeniusVoice() {
  if (!audio) {
    emit(false);
    return;
  }
  try {
    audio.pause();
    audio.currentTime = 0;
  } catch {
    /* nothing to stop */
  }
  emit(false);
}

export const isGeniusSpeaking = () => speaking;

export function subscribeGeniusVoice(listener: (speaking: boolean) => void) {
  listeners.add(listener);
  listener(speaking);
  return () => {
    listeners.delete(listener);
  };
}
