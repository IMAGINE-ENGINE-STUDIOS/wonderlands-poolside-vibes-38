/**
 * Board commands — header ⇄ 2D board bridge for the Design Studio.
 * Imagine Engine Studios Corp.
 *
 * The header (DesignStudio) never owns pool/deck state; PoolBuilder does.
 * Header buttons send commands (undo, redo, save, projects) and PoolBuilder
 * answers with its status (can undo/redo, last saved time) over two window
 * events, so neither side imports the other's internals.
 */
import * as React from "react";

export type BoardCommand = "undo" | "redo" | "save" | "projects";
export interface BoardStatus { canUndo: boolean; canRedo: boolean; lastSaved?: string }

const CMD = "design-studio:board-command";
const STATUS = "design-studio:board-status";
let lastStatus: BoardStatus = { canUndo: false, canRedo: false };

export const sendBoardCommand = (c: BoardCommand) => window.dispatchEvent(new CustomEvent(CMD, { detail: c }));
export const publishBoardStatus = (s: BoardStatus) => { lastStatus = s; window.dispatchEvent(new CustomEvent(STATUS, { detail: s })); };

export function useBoardCommands(handler: (c: BoardCommand) => void) {
  const ref = React.useRef(handler); ref.current = handler;
  React.useEffect(() => {
    const on = (e: Event) => ref.current((e as CustomEvent<BoardCommand>).detail);
    window.addEventListener(CMD, on); return () => window.removeEventListener(CMD, on);
  }, []);
}

export function useBoardStatus(): BoardStatus {
  const [s, setS] = React.useState(lastStatus);
  React.useEffect(() => {
    const on = (e: Event) => setS((e as CustomEvent<BoardStatus>).detail);
    window.addEventListener(STATUS, on); return () => window.removeEventListener(STATUS, on);
  }, []);
  return s;
}

/**
 * Snapshot history for the whole 2D board (pool, decks, extra pools, site elements).
 * Changes are grouped (350 ms) so a drag is one step; restoring a snapshot is
 * never recorded as a new step. The first second after mount (autosave load) is ignored.
 */
export function useBoardHistory<T>(snap: T, apply: (s: T) => void) {
  const past = React.useRef<string[]>([]);
  const future = React.useRef<string[]>([]);
  const last = React.useRef<string | null>(null);
  const skip = React.useRef(false);
  const mountedAt = React.useRef(Date.now());
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, bump] = React.useState(0);
  const json = JSON.stringify(snap);

  const commit = React.useCallback((j: string) => {
    if (last.current === null || Date.now() - mountedAt.current < 1000) { last.current = j; return; }
    if (j === last.current) return;
    past.current = [...past.current, last.current].slice(-80);
    future.current = []; last.current = j; bump((n) => n + 1);
  }, []);

  React.useEffect(() => {
    if (skip.current) { skip.current = false; last.current = json; return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { timer.current = null; commit(json); }, 350);
  }, [json, commit]);

  const flush = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; commit(json); } };
  const undo = React.useCallback(() => {
    flush(); const prev = past.current.pop(); if (prev === undefined || last.current === null) return;
    future.current = [last.current, ...future.current]; last.current = prev; skip.current = true; apply(JSON.parse(prev)); bump((n) => n + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apply, json]);
  const redo = React.useCallback(() => {
    flush(); const next = future.current.shift(); if (next === undefined || last.current === null) return;
    past.current = [...past.current, last.current]; last.current = next; skip.current = true; apply(JSON.parse(next)); bump((n) => n + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apply, json]);
  return { undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0 };
}
