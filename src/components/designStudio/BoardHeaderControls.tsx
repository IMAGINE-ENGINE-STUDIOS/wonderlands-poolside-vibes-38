/**
 * Undo · Redo · Save · Projects for the 2D board, shown in the left header.
 * Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Undo2, Redo2, Save, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendBoardCommand, useBoardStatus } from "./boardCommands";

export const BoardHeaderControls: React.FC<{ hideHistory?: boolean }> = ({ hideHistory }) => {
  const s = useBoardStatus();
  return (
    <div className="flex items-center gap-1">
      {!hideHistory && <>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={!s.canUndo} onClick={() => sendBoardCommand("undo")} title="Undo (Ctrl/Cmd+Z)"><Undo2 className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={!s.canRedo} onClick={() => sendBoardCommand("redo")} title="Redo (Ctrl/Cmd+Shift+Z)"><Redo2 className="h-4 w-4" /></Button>
      <div className="mx-1 hidden sm:block h-5 w-px bg-border" />
      </>}
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs px-2 sm:px-3" onClick={() => sendBoardCommand("save")} title="Save now"><Save className="h-3.5 w-3.5" /><span className="hidden sm:inline">Save</span></Button>
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs px-2 sm:px-3" onClick={() => sendBoardCommand("projects")} title="Open your projects"><FolderOpen className="h-3.5 w-3.5" /><span className="hidden sm:inline">Projects</span></Button>
      {s.lastSaved && <span className="ml-1 hidden text-[10px] text-muted-foreground lg:inline">Saved {new Date(s.lastSaved).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>}
    </div>
  );
};
