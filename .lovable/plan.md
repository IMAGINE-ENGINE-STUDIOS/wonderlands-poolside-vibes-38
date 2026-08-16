# Wonderlands Narrator — Realistic AI Reading Assistant

## Goal
Add a tiny, organic-feeling corner narrator that reads every page like a human sales designer would: explanatory, entertaining, and option-rich. Users can listen or read, then act through branching choices, add-to-cart, or navigation.

## What we will build

### 1. The reading/voice model
- Use **OpenAI `gpt-4o-mini-tts`** through the Lovable AI Gateway `/v1/audio/speech`.
- It is the most realistic voice option available without a separate provider account; billed through existing Lovable AI credits.
- Stream PCM audio via SSE so playback starts immediately.
- Voice persona: warm, professional, luxury sales designer named "Sarah".
- Fallback to **Google `gemini-2.5-pro-tts`** if the user wants a more expressive, story-like tone.

### 2. The UI reading pattern
- A persistent **glassmorphic orb** in the bottom-right corner.
- Subtle organic motion: random micro-translation + breathing scale, like a living assistant waiting to be invited.
- Clicking the orb opens a minimal panel that shows:
  - Live transcript of what is being read.
  - Playback controls (play/pause, mute, replay).
  - Context-aware action chips.
- The panel is small and non-blocking; it does not cover the FLIP book or product page.

### 3. Content source
- The narrator knows where the user is:
  - FLIP page index / category / product / additional-feature page.
  - Main site pages (`/`, `/wonderlands-studio`, `/asset-gallery`, etc.).
- A page-context payload is sent to the backend: route, page title, category, product name, current cart items, and user intent.
- The backend returns a short, persuasive pitch (2–4 sentences) plus a set of actions.

### 4. Options behavior
Each narration can expose one or more action chips:
- **Branch** — hear the next part of the story ("Tell me more about finishes").
- **Add to cart** — add the current product or featured option.
- **Navigate** — jump to the relevant FLIP page, studio, or product page.
- **Calculate** — open the matching calculator (pool, pavers, fence, etc.).

### 5. Backend changes
- Extend the existing `ai-assistant` Supabase Edge Function with a `/narrate` path.
- The function builds a page-specific prompt and returns:
  - `script`: text to read and display.
  - `actions`: array of labeled actions with type and payload.
- Add a separate TTS route or reuse the same function to call `https://ai.gateway.lovable.dev/v1/audio/speech` and stream audio bytes back to the client.
- Cache generated scripts and audio by page context to avoid re-billing on revisits.

### 6. Frontend changes
- Create `NarratorOrb.tsx` — the vibrating corner icon.
- Create `NarratorPanel.tsx` — the transcript + actions UI.
- Create `useNarrator.ts` — manages playback, SSE audio streaming, page context, and branching history.
- Wire the orb into `App.tsx` so it appears globally.
- Update `AIAssistantContext.tsx`:
  - Add audio state and action execution.
  - Fix the `useNavigate()` runtime error by either moving navigation into a route-aware child component or falling back to `window.location`.

### 7. Runtime error fix
- The current preview shows `useNavigate() may be used only in the context of a <Router>` inside `AIAssistantProvider`.
- We will verify the provider tree; if the error persists, we will remove `useNavigate` from the provider and pass a `navigate` function from a route-aware component instead, or use `window.location.assign` for navigation actions.

### 8. Polish & performance
- Use the existing `usePersistentState` hook to remember mute preference and last-heard page.
- Lazy-load the audio decoder so the orb adds no weight to initial page load.
- Keep generated audio files in memory cache keyed by page context; do not regenerate when the user flips back and forth.

## Out of scope
- Full conversational chat overhaul (the existing AI chat stays as-is).
- New ElevenLabs connector; we will use Lovable AI Gateway TTS.
- Custom voice cloning.

## Success criteria
- A vibrating orb is visible on every page and opens a clean narrator panel.
- Tapping play reads the current page aloud in a realistic voice.
- Action chips let users branch, add to cart, navigate, or calculate.
- The `useNavigate` runtime error is gone.
