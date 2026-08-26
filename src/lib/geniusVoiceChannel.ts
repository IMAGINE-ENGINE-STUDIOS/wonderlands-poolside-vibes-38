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

/** Play a clip, replacing anything currently being spoken. Resolves when it ends.
 *  Returns false when the browser refused to play it (autoplay policy, bad clip),
 *  so the caller can fall back to the browser's own speech engine. */
export async function playGeniusVoice(url: string): Promise<boolean> {
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
    return false;
  }
  if (el.ended) return true;
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
  return true;
}

/**
 * Last-resort voice: the browser's own speech engine.
 *
 * Used when the recorded reading cannot be fetched or the tab refuses to play
 * it (autoplay policy inside preview iframes). It costs nothing and keeps the
 * narrator audible instead of silently failing.
 */
export function speakGeniusText(text: string, lang?: string): boolean {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (!synth || !text) return false;
  try {
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (lang) utter.lang = lang; // narrator console language selection
    utter.volume = GENIUS_VOLUME;
    utter.rate = 1;
    utter.onend = () => emit(false);
    utter.onerror = () => emit(false);
    emit(true);
    synth.speak(utter);
    return true;
  } catch {
    emit(false);
    return false;
  }
}


/** Silence her at once — used for barge-in and when a new page opens. */
export function stopGeniusVoice() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* no speech engine here */
  }
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
