# Voice-to-voice Genius: press, talk, get answers out loud

Today the Genius panel has a small microphone icon and a "Live" toggle. Talking works only partially: the microphone is armed with no permission request of its own, spoken answers are played through a throwaway audio element that can talk over the page narration, and the hands-free loop only re-arms itself reliably on browsers without a built-in speech engine.

This turns it into a real conversation: one obvious button, a clear permission moment, and a continuous listen → answer aloud → listen again loop with proper interruption.

## What the guest gets

1. **One prominent Talk button** in the Genius panel (replacing the small mic icon as the primary control), with the "Live" toggle kept beside it for hands-free.
   - Not yet allowed: the button reads "Allow microphone". Pressing it asks the browser for permission and explains, in one line, that Genius needs the microphone to listen.
   - Denied: the button turns into a short recovery note ("Microphone blocked — enable it in your browser's address bar"), and the typed input stays fully usable. No red error styling.
   - Allowed: the button reads "Talk", and while listening it shows a live level meter with the words appearing as they are recognized.
2. **Press and talk.** One press starts listening; the guest speaks; the phrase is sent to Genius the moment they stop, and the answer is spoken back at mid volume while the transcript writes itself into the panel.
3. **Voice-to-voice (Live).** With Live on, the microphone re-arms itself after every answer, so it is a continuous conversation: ask, hear, ask again — no button presses in between.
4. **Interrupt her.** Talking (or pressing Talk) while Genius is speaking stops her audio immediately and listens instead, so the guest is never stuck waiting out a long answer.
5. **She stops listening to herself.** The microphone is closed while she speaks and reopens right after, so her own voice is never transcribed as a guest question.
6. **Everything she can already do, by voice**: read the spread, explain and price any product, resize and redraw a design, add to or clear the selection, open pages and tools, and book an appointment. This plan changes only how the guest talks to her, not what she can do.

## Cost behaviour (unchanged intent)

- Listening stays on the browser's free speech engine whenever the browser has one — no per-word charge.
- Paid transcription runs only when the browser has no free engine, or when Live is on for a browser that needs it.
- Answers are spoken through the existing cached voice function, so a repeated sentence reuses the recording already in the library.

## Technical notes

- **New hook `src/hooks/useVoiceSession.ts`** — one state machine over the two existing hooks (`useVoiceInput` for free recognition, `useVoiceRecorder` for the paid path) plus permission state. It exposes `permission` (`unknown | prompt | granted | denied`), `requestPermission()`, `phase` (`idle | listening | thinking | speaking`), `level`, `partial`, `start()`, `stop()`, and `handsFree`. Permission is read with `navigator.permissions.query({ name: 'microphone' })` where available and inferred from a one-shot `getUserMedia` probe otherwise; the probe's tracks are stopped immediately.
- **Single audio channel** — a module-level `Audio` element (new `src/lib/geniusVoiceChannel.ts`) that `narrate` and conversation replies both play through, with `play(url)`, `stop()`, and an `isSpeaking` subscription. This removes the fire-and-forget `new Audio(...)` in `GeniusOrb.tsx` so an answer can never overlap the page narration, and lets barge-in stop playback instantly.
- **Echo guard** — the session hook suspends recognition/recording while `isSpeaking` is true and re-arms ~300 ms after playback ends, replacing the current fixed 900 ms timer chain.
- **Barge-in** — while she is speaking, a level threshold on a lightweight monitor stream (or a Talk press) calls `geniusVoiceChannel.stop()` and moves straight to listening.
- **`GeniusOrb.tsx`** — the two effects that currently drive the transcript/re-arm loop and the silence detector move into the hook; the footer form gets the labelled Talk button, permission states, and the level meter. Existing chips, actions, and typed input are untouched.
- **`useVoiceRecorder`** distinguishes a denied-permission failure from a device failure so the panel can show the right recovery line.
- No backend changes: `narrate-voice` (cached TTS) and `transcribe-audio` (paid STT) are already deployed and used as-is.

## Verification

Drive the preview with a browser script that grants the fake microphone permission, presses Talk, and checks that the panel reaches the listening state, that a reply is requested from the voice function, and that no console errors appear. Real speech recognition can't be exercised headlessly, so the send/answer path is also verified by injecting a transcript through the same code path the recognizer uses.
