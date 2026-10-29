/**
 * Wonderlands Live stage — what everyone is looking at together.
 *
 * Widgets load LOCALLY on each device (never screen-shared): the host picks
 * one, every client renders it natively at full speed, and a guest can only
 * touch it when the host unlocks interaction for them.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Hand, Lock, Mic, MicOff, Crown } from "lucide-react";
import type { LiveStageState } from "@/lib/live/liveTypes";
import { liveWidget } from "@/lib/live/liveCatalog";
import { ProductShowcase } from "./ProductShowcase";

const initials = (n: string) => n.split(/[\s@._-]+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

export function VideoTile({
  stream,
  name,
  isLocal = false,
  micOff = false,
  hand = false,
  isHost = false,
  small = false,
  onDoubleClick,
}: {
  stream: MediaStream | null;
  name: string;
  isLocal?: boolean;
  micOff?: boolean;
  hand?: boolean;
  isHost?: boolean;
  small?: boolean;
  onDoubleClick?: () => void;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (el && stream && el.srcObject !== stream) el.srcObject = stream;
  }, [stream]);
  const hasVideo = !!stream && stream.getVideoTracks().some((t) => t.readyState === "live" && t.enabled);
  return (
    <div
      className="group relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-zinc-800 to-zinc-900"
      onDoubleClick={onDoubleClick}
    >
      {stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={isLocal}
          className={`h-full w-full object-cover ${isLocal ? "-scale-x-100" : ""} ${hasVideo ? "" : "invisible"}`}
        />
      ) : null}
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`flex items-center justify-center rounded-full bg-white/10 font-medium text-zinc-200 ${small ? "h-14 w-14 text-base" : "h-28 w-28 text-3xl"}`}>
            {initials(name || "?")}
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-2.5 text-white">
        <span className="truncate font-mono text-xs">
          {name}
          {isLocal ? " (You)" : ""}
        </span>
        {isHost && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
        {hand && <Hand className="h-3.5 w-3.5 shrink-0 text-amber-200" />}
        <span className={`ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${micOff ? "bg-red-500" : "bg-white/15"}`}>
          {micOff ? <MicOff className="h-3 w-3 text-white" /> : <Mic className="h-3 w-3 text-white" />}
        </span>
      </div>
    </div>
  );
}

export function LiveStage({
  stage,
  interactive,
  onProductSelect,
}: {
  stage: LiveStageState;
  interactive: boolean;
  onProductSelect: (productKey: string, variantIdx: number) => void;
}) {
  const widget = liveWidget(stage.widgetId);
  if (!widget) return null;
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950">
      {widget.kind === "showcase" ? (
        <ProductShowcase
          productKey={stage.productKey}
          variantIdx={stage.variantIdx}
          interactive={interactive}
          onSelect={onProductSelect}
        />
      ) : (
        <>
          <iframe
            key={widget.route}
            src={stage.route ?? widget.route}
            title={widget.title}
            className="h-full w-full border-0 bg-white"
            allow="accelerometer; gyroscope; xr-spatial-tracking"
          />
          {!interactive && (
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-transparent">
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur">
                <Lock className="h-3.5 w-3.5 text-amber-200" />
                The host is presenting — interaction is locked
              </div>
            </div>
          )}
        </>
      )}
      <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/85 backdrop-blur">
        {widget.title} · live on your device
      </div>
    </div>
  );
}
