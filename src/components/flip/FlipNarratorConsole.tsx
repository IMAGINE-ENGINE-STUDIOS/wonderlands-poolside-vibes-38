/**
 * FLIP Narrator Console
 * =====================
 * A small, glassmorphic controller that pops inside the FLIP search desk when
 * the guest taps Genius in the left rail.
 *
 * It holds exactly four things, nothing more:
 *   1. PLAY / STOP — reads the open spread aloud (local script + recorded voice)
 *   2. Transcript  — the words she is saying, so the reading can be read
 *   3. Language    — the tongue she reads and answers in
 *   4. Chat        — a question box wired to the Genius pipeline
 *
 * Notes for the next programmer:
 * - The script is written locally by `useNarrator` (no paid text calls); only
 *   the voice step is billed, and it falls back to the browser engine.
 * - Chat goes through `useGenius`, which resolves most turns in the browser.
 * - The chosen language is appended as a plain instruction to the chat turn and
 *   applied to the browser speech engine, so no translation service is needed.
 */

import * as React from "react";
import { Headphones, Pause, Play, Send, Languages } from "lucide-react";

import useNarrator from "@/hooks/useNarrator";
import useGenius from "@/hooks/useGenius";
import { speakGeniusText, stopGeniusVoice } from "@/lib/geniusVoiceChannel";
import { GENIUS_LANGUAGES, detectLanguage, translateText, translateTexts } from "@/lib/genius/geniusLanguage";

const LANGUAGES = GENIUS_LANGUAGES;

const STORAGE_KEY = "wl.narrator.console.lang";

const FlipNarratorConsole: React.FC = () => {
  const narrator = useNarrator();
  const genius = useGenius({ context: narrator.context ?? null });

  const [lang, setLang] = React.useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || detectLanguage("");
    } catch {
      return "en-US";
    }
  });
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage may be unavailable */
    }
  }, [lang]);

  const english = lang.startsWith("en");

  const play = React.useCallback(() => {
    if (narrator.isSpeaking) {
      narrator.stop();
      return;
    }
    if (english) {
      void narrator.narrate();
      return;
    }
    /* Another tongue: translate the local script, then read it with a native voice. */
    void narrator.narrate({ withVoice: false }).then(async (script) => {
      const text = script || narrator.script;
      if (!text) return;
      const spoken = await translateText(text, lang);
      setShownScript(spoken);
      speakGeniusText(spoken, lang);
    });
  }, [english, lang, narrator]);

  const send = React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const text = draft.trim();
      if (!text || genius.isThinking) return;
      setDraft("");
      /* Typing in another tongue switches the console to it. */
      const typed = detectLanguage(text);
      if (!typed.startsWith("en") && typed !== lang) setLang(typed);
      void genius.ask(text);
    },
    [draft, genius, lang],
  );

  React.useEffect(() => () => stopGeniusVoice(), []);

  const [shownScript, setShownScript] = React.useState<string>("");
  React.useEffect(() => { if (english) setShownScript(""); }, [english]);
  const transcript = (!english && shownScript) || narrator.script;

  /* Chat turns are answered in English locally/by Genius, then shown in the chosen tongue. */
  const [translated, setTranslated] = React.useState<Record<string, string>>({});
  const recent = genius.turns.slice(-8);
  const pendingKey = english ? "" : recent.filter((t) => !translated[`${lang}|${t.id}`]).map((t) => t.id).join(",");
  React.useEffect(() => {
    if (!pendingKey) return;
    const todo = recent.filter((t) => !translated[`${lang}|${t.id}`]);
    void translateTexts(todo.map((t) => t.content), lang).then((out) => {
      setTranslated((prev) => {
        const next = { ...prev };
        todo.forEach((t, i) => (next[`${lang}|${t.id}`] = out[i]));
        return next;
      });
      const last = todo[todo.length - 1];
      if (last?.role === "assistant") speakGeniusText(out[todo.length - 1], lang);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingKey, lang]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={play}
          className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-[9px] uppercase tracking-[0.3em] text-primary backdrop-blur-xl transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {narrator.isSpeaking ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {narrator.isSpeaking ? "Stop" : narrator.isLoading ? "Preparing" : "Play"}
        </button>

        <span className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
          <Headphones className="h-3.5 w-3.5" />
          {narrator.context?.title ?? "This spread"}
        </span>

        <label className="ml-auto inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
          <Languages className="h-3.5 w-3.5" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border border-border/60 bg-background/60 px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-foreground outline-none backdrop-blur-xl"
            aria-label="Narration language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Transcript */}
      <div className="max-h-36 overflow-y-auto border border-border/50 bg-background/50 p-3 backdrop-blur-xl">
        <p className="mb-1 text-[8px] uppercase tracking-[0.35em] text-muted-foreground">Transcript</p>
        <p className="text-xs leading-relaxed text-foreground/85">
          {transcript || "Press play and the reading appears here, word for word."}
        </p>
      </div>

      {/* Chat */}
      {genius.turns.length > 0 && (
        <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
          {recent.map((turn) => (
            <p
              key={turn.id}
              className={
                turn.role === "user"
                  ? "text-xs leading-relaxed text-muted-foreground"
                  : "text-xs leading-relaxed text-foreground"
              }
            >
              <span className="mr-2 text-[8px] uppercase tracking-[0.3em] text-muted-foreground">
                {turn.role === "user" ? "You" : "Genius"}
              </span>
              {(!english && translated[`${lang}|${turn.id}`]) || turn.content}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={send} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={genius.isThinking ? "Genius is answering…" : "Ask about this spread, prices or an appointment"}
          className="w-full border border-border/60 bg-background/60 px-3 py-2 text-xs text-foreground outline-none backdrop-blur-xl placeholder:text-muted-foreground/70"
        />
        <button
          type="submit"
          disabled={genius.isThinking || !draft.trim()}
          aria-label="Send"
          className="inline-flex h-9 w-9 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
};

export default FlipNarratorConsole;
