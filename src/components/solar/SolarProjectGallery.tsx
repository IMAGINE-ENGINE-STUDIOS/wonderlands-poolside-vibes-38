import * as React from "react";
import { FolderOpen, Trash2, Save, RotateCcw } from "lucide-react";
import {
  deleteSolarProject,
  listSolarProjects,
  onSolarGalleryChange,
  type SolarProjectEntry,
} from "@/lib/solar/solarGallery";

/**
 * The gallery of saved solar studies.
 *
 * It reads the browser-local history written by the calculator and hands a whole
 * entry back on "Reload", which restores the session and the aerial framing.
 * Presentation only — all persistence lives in @/lib/solar/solarGallery.
 */
const SolarProjectGallery: React.FC<{
  onReload: (entry: SolarProjectEntry) => void;
  onSaveCurrent: () => void;
  canSave: boolean;
}> = ({ onReload, onSaveCurrent, canSave }) => {
  const [entries, setEntries] = React.useState<SolarProjectEntry[]>(() => listSolarProjects());

  React.useEffect(() => onSolarGalleryChange(() => setEntries(listSolarProjects())), []);

  const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="border border-border/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Saved studies</p>
        <button
          type="button"
          onClick={onSaveCurrent}
          disabled={!canSave}
          className="ml-auto inline-flex items-center gap-2 border border-foreground px-3 py-2 text-[9px] uppercase tracking-[0.28em] transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" /> Save this study
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
          Nothing saved yet. Capture a roof, then save the study — it stays on this device and can be
          reloaded any time.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border/50">
          {entries.map((e) => (
            <li key={e.id} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-light">{e.title}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  {e.summary.kwDc.toFixed(1)} kW · {Math.round(e.summary.yearlyKwh).toLocaleString()} kWh/yr ·{" "}
                  {money(e.summary.netCost)} · {e.summary.faces} plane{e.summary.faces === 1 ? "" : "s"}
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  {new Date(e.savedAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onReload(e)}
                className="inline-flex items-center gap-2 border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.28em] hover:border-foreground"
              >
                <FolderOpen className="h-3.5 w-3.5" /> Reload
              </button>
              <button
                type="button"
                onClick={() => deleteSolarProject(e.id)}
                aria-label={`Delete ${e.title}`}
                className="inline-flex items-center border border-border/60 px-2 py-2 text-muted-foreground hover:border-foreground hover:text-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {entries.length > 0 && (
        <p className="mt-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          <RotateCcw className="h-3 w-3" /> Autosaved as you work
        </p>
      )}
    </div>
  );
};

export default SolarProjectGallery;
