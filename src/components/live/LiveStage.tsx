/**
 * Wonderlands Live stage — what everyone is looking at together.
 *
 * Widgets load LOCALLY on each device (never screen-shared): the host picks
 * one, every client renders it natively at full speed, and a guest can only
 * touch it when the host unlocks interaction for them.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Hand, Lock, MicOff, Crown } from "lucide-react";
import type { LiveStageState } from "@/lib/live/liveTypes";
import { liveWidget } from "@/lib/live/liveCatalog";
import { ProductShowcase } from "./ProductShowcase";

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
      className="group relative h-full w-full overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-white/10"
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
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white">
            {(name || "?").slice(0, 1).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-1.5 pt-6 text-white">
        <span className={`truncate ${small ? "text-[11px]" : "text-xs"} font-medium`}>
          {name}
          {isLocal ? " (you)" : ""}
        </span>
        {isHost && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-300" />}
        {hand && <Hand className="h-3.5 w-3.5 shrink-0 text-amber-200" />}
        {micOff && <MicOff className="h-3.5 w-3.5 shrink-0 text-red-300" />}
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
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-neutral-950 ring-1 ring-white/10">
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
