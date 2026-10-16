/**
 * Undo · Redo · Save · Projects for the 2D board, shown in the left header.
 * Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Undo2, Redo2, Save, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendBoardCommand, useBoardStatus } from "./boardCommands";

export const BoardHeaderControls: React.FC = () => {
  const s = useBoardStatus();
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={!s.canUndo} onClick={() => sendBoardCommand("undo")} title="Undo (Ctrl/Cmd+Z)"><Undo2 className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={!s.canRedo} onClick={() => sendBoardCommand("redo")} title="Redo (Ctrl/Cmd+Shift+Z)"><Redo2 className="h-4 w-4" /></Button>
      <div className="mx-1 h-5 w-px bg-border" />
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => sendBoardCommand("save")} title="Save now"><Save className="h-3.5 w-3.5" />Save</Button>
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => sendBoardCommand("projects")} title="Open your projects"><FolderOpen className="h-3.5 w-3.5" />Projects</Button>
      {s.lastSaved && <span className="ml-1 hidden text-[10px] text-muted-foreground lg:inline">Saved {new Date(s.lastSaved).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>}
    </div>
  );
};
