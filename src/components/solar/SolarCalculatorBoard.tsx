import * as React from "react";
import { Loader2, Crosshair, MapPin, Pencil, RotateCcw, Search, Trash2, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useOptionalShoppingCart } from "@/components/ShoppingCartProvider";
import AerialCanvas, { type AerialView } from "./AerialCanvas";
import { composeAerialFrame } from "@/lib/solar/aerialTiles";

import {
  traceRoofPlane,
  facesFromInsights,
  guessAzimuth,
  snapVertexToEdge,
  type BuildingInsights,
  type TileFrame,
} from "@/lib/solar/roofAutoTrace";

import {
  compassLabel,
  computeProduction,
  computeSavings,
  distanceFt,
  pathAreaSqFt,
  pointInPath,
  pathSpanFt,
  pitchAsRise,
  readExposure,
  type LatLng,
  type RoofFace,
} from "@/lib/solar/solarEngine";
import { buildSolarBom } from "@/lib/solar/solarBom";
import {
  rackingByCovering,
  roofCoverings,
  solarBatteries,
  solarPanelBrands,
  solarPanels,
  panelFullName,
  type RoofCovering,
} from "@/data/solarHardware";
import SolarReportTabs from "./SolarReportTabs";
import SolarPerformanceGraphics from "./SolarPerformanceGraphics";
import StudioCartWidget from "@/components/StudioCartWidget";

/**
 * Total Solar Calculator.
 *
 * The reader types an address, frames the property on the aerial (the map pans
 * and zooms freely, so a wrong pin is corrected by hand), then clicks each roof
 * plane. Google's measured roof segments are used where the address is covered;
 * elsewhere a click flood-fills the plane on the aerial tile and returns an
 * outline. Every face stays editable — drag a vertex, set the pitch, dial in
 * shade, or reject it. Faces are shaded orange through red by sun exposure, and
 * the array, battery, racking for the roof covering and the whole electrical
 * takeoff are priced from what was captured.
 */

type Mode = "idle" | "auto" | "manual";

/* the session shape, defaults and cache key are shared with the facing
   product-options leaf — see ./solarSession */
import {
  SOLAR_SESSION_KEY,
  emptySolarSession as emptySession,
  type SavedFace,
  type SolarSession,
} from "./solarSession";


const FL_LAT = 27.5;

/** One registered address returned by the Places suggestion service. */
interface Suggestion {
  placeId: string;
  label: string;
}


const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">{children}</span>
);

const selectClass =
  "mt-1 w-full border border-border/60 bg-transparent px-2 py-2 text-sm font-light outline-none focus:border-foreground";

/**
 * `mapOnly` trims the board to the aerial leaf: the address header, the map and
 * the map tools underneath it. The system builder, the graphics and the report
 * live on the facing page of the flip spread, so they are not repeated here.
 */
const SolarCalculatorBoard: React.FC<{ height?: number; mapOnly?: boolean }> = ({ height, mapOnly }) => {
  const { toast } = useToast();
  const cart = useOptionalShoppingCart();

  const [session, setSession] = usePersistentState<SolarSession>(SOLAR_SESSION_KEY, emptySession);
  const [query, setQuery] = React.useState(session.address);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [typing, setTyping] = React.useState(false);
  const [busy, setBusy] = React.useState<"" | "geocode" | "insights" | "trace">("");

  const [mode, setMode] = usePersistentState<Mode>("solar_capture_mode", "idle");
  const [selected, setSelected] = React.useState<string>("");
  const [draft, setDraft] = React.useState<LatLng[]>([]);

  /** real pixel size of the visible map so the trace bitmap matches the click */
  const [frameSize, setFrameSize] = React.useState<{ width: number; height: number }>({
    width: 640,
    height: height ?? 520,
  });

  /** what the aerial is framing — cached so a reload lands on the same roof */
  const [view, setView] = usePersistentState<AerialView>("solar_aerial_view", {
    lat: session.lat ?? 27.9506,
    lng: session.lng ?? -82.4572,
    zoom: session.lat ? 20 : 11,
  });

  /** the composed aerial bitmap the flood-fill tracer samples */
  const frame = React.useRef<TileFrame | null>(null);
  /** Google's measured roof planes for this address — the click hit-test pool */
  const measured = React.useRef<RoofFace[]>([]);


  const panel = solarPanels.find((p) => p.id === session.panelId) ?? solarPanels[0];
  const battery = solarBatteries.find((b) => b.id === session.batteryId) ?? solarBatteries[0];

  /* faces in engine form */
  const faces: RoofFace[] = React.useMemo(
    () =>
      session.faces.map((f) => ({
        ...f,
        planAreaSqFt: pathAreaSqFt(f.path),
      })),
    [session.faces],
  );

  const production = React.useMemo(() => computeProduction(faces, panel, session.lat ?? FL_LAT), [faces, panel, session.lat]);
  const bom = React.useMemo(
    () =>
      buildSolarBom({
        faces,
        layouts: production.layouts,
        panel,
        battery,
        covering: session.covering,
        serviceRunFt: session.serviceRunFt,
        kwDc: production.kwDc,
        kwAc: production.kwAc,
      }),
    [faces, production, panel, battery, session.covering, session.serviceRunFt],
  );
  const savings = React.useMemo(
    () =>
      computeSavings(
        production.yearlyKwhVerified ?? production.yearlyKwhModel,
        bom.netCost,
        session.monthlyBill,
      ),
    [production, bom.netCost, session.monthlyBill],
  );

  const patch = React.useCallback(
    (next: Partial<SolarSession>) => setSession((s) => ({ ...s, ...next })),
    [setSession],
  );

  const updateFace = React.useCallback(
    (id: string, next: Partial<SavedFace>) =>
      setSession((s) => ({ ...s, faces: s.faces.map((f) => (f.id === id ? { ...f, ...next } : f)) })),
    [setSession],
  );

  /* ── the edge function ─────────────────────────────────────────────── */

  const callSolar = React.useCallback(
    async <T,>(body: Record<string, unknown>): Promise<T> => {
      const { data, error } = await supabase.functions.invoke("solar-report", { body });
      if (error) {
        /* The function answers non-2xx with a JSON body that names the real
           cause (an un-enabled Google API, a rejected address, a quota). Read
           it and pass that through instead of a blanket "unavailable". */
        let detail = "";
        const ctx = (error as { context?: { text?: () => Promise<string> } }).context;
        if (ctx?.text) {
          try {
            const text = await ctx.text();
            detail = (JSON.parse(text) as { error?: string })?.error ?? text;
          } catch {
            /* body was not JSON — fall through to the generic message */
          }
        }
        console.error("solar-report failed:", detail || error.message);
        throw new Error(detail || "We could not reach the aerial service. Please try again.");
      }
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data as T;
    },
    [],
  );


  /* ── the aerial frame ──────────────────────────────────────────────── */

  /* The sampling bitmap behind click-to-trace is rebuilt from the same imagery
     the canvas shows, a beat after the framing settles, so panning stays smooth.
     It is the exact size of the visible map so a click maps to the same pixel. */
  React.useEffect(() => {
    if (view.zoom < 18) {
      frame.current = null;
      return;
    }
    let alive = true;
    const timer = window.setTimeout(() => {
      const size = Math.min(1024, Math.max(512, Math.round(frameSize.width)), Math.max(512, Math.round(frameSize.height)));
      composeAerialFrame({ lat: view.lat, lng: view.lng }, Math.round(view.zoom), size)
        .then((f) => {
          if (alive) frame.current = f;
        })
        .catch(() => {
          if (alive) frame.current = null;
        });
    }, 400);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [view.lat, view.lng, view.zoom, frameSize.width, frameSize.height]);

  /* Purge any absurd cached faces — bad lat/lng jumps can create million-SF
     shapes or roof-shaped polygons that leak into the road. Keep reasonable
     residential / small commercial footprints only. */
  React.useEffect(() => {
    setSession((s) => ({
      ...s,
      faces: s.faces.filter((f) => {
        const area = pathAreaSqFt(f.path);
        return area >= 80 && area <= 20000 && f.path.length >= 3 && f.path.length <= 40;
      }),
    }));
  }, []); // run once on mount

  /* ── address search ────────────────────────────────────────────────── */

  /**
   * Frames a resolved address on the aerial and reads its roof.
   *
   * Faces captured on a previous property are dropped here. They used to survive
   * in the cache and reappear over the new address, which read as though the
   * board had auto-dropped a dozen planes before the reader clicked anything.
   */
  const settleOn = async (found: { address: string; lat: number; lng: number }) => {
    setSession((s) => {
      const centre = { lat: found.lat, lng: found.lng };
      const kept = s.faces.filter((f) => {
        const c = {
          lat: f.path.reduce((t, p) => t + p.lat, 0) / f.path.length,
          lng: f.path.reduce((t, p) => t + p.lng, 0) / f.path.length,
        };
        return distanceFt(c, centre) < 400; // same property only
      });
      return { ...s, address: found.address, lat: found.lat, lng: found.lng, faces: kept };
    });
    setSelected("");
    setDraft([]);
    setQuery(found.address);
    setSuggestions([]);
    setView({ lat: found.lat, lng: found.lng, zoom: 20 });
    await loadInsights(found.lat, found.lng);
  };

  /* Suggest registered addresses as the reader types (debounced, server-side). */
  React.useEffect(() => {
    const input = query.trim();
    if (!typing || input.length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = window.setTimeout(() => {
      callSolar<{ suggestions: Suggestion[] }>({ action: "autocomplete", input })
        .then((r) => setSuggestions(r.suggestions ?? []))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, typing, callSolar]);


  const chooseSuggestion = async (s: Suggestion) => {
    setTyping(false);
    setSuggestions([]);
    setBusy("geocode");
    try {
      const found = await callSolar<{ address: string; lat: number; lng: number }>({
        action: "place",
        placeId: s.placeId,
      });
      await settleOn({ ...found, address: found.address || s.label });
    } catch (err) {
      toast({ title: "Address", description: (err as Error).message });
    } finally {
      setBusy("");
    }
  };

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const address = query.trim();
    if (address.length < 5) return;
    /* pressing enter on a highlighted list takes the first suggestion */
    if (suggestions.length) {
      await chooseSuggestion(suggestions[0]);
      return;
    }
    setTyping(false);
    setBusy("geocode");
    try {
      const found = await callSolar<{ address: string; lat: number; lng: number }>({ action: "geocode", address });
      await settleOn(found);
    } catch (err) {
      toast({ title: "Address", description: (err as Error).message });
    } finally {
      setBusy("");
    }
  };


  /**
   * Measured roof planes, when Google covers the address.
   *
   * Nothing is drawn from this: the planes are kept aside so a click can pick up
   * the measured azimuth, pitch and satellite sunshine hours for whichever plane
   * the reader actually asks for. The reader captures the roof, not the machine.
   */
  const loadInsights = async (lat: number, lng: number) => {
    setBusy("insights");
    try {
      const insights = await callSolar<BuildingInsights>({ action: "insights", lat, lng });
      if (!insights.covered) {
        measured.current = [];
        patch({ covered: false });
        setMode("idle");
        toast({
          title: "No measured roof data here",
          description: "Press “Click a roof plane”, then click each roof face.",
        });
        return;
      }
      const planes = facesFromInsights(insights);
      measured.current = planes;
      const d = insights.imageryDate;
      patch({
        covered: true,
        imageryDate: d ? `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}` : "",
      });
      /* Frame the building Google actually measured — a street address often
         geocodes to the kerb, which would leave the roof off to one side. */
      if (planes.length) {
        const pts = planes.flatMap((p) => p.path);
        setView((v) => ({
          lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
          lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
          zoom: Math.max(v.zoom, 20),
        }));
      }
      setMode("idle");
      toast({
        title: "Roof read",
        description: "Press “Click a roof plane”, then click each roof face you want on the array.",
      });

    } catch (err) {
      measured.current = [];
      patch({ covered: false });
      setMode("idle");
      toast({ title: "Roof data", description: (err as Error).message });
    } finally {
      setBusy("");
    }
  };


  /* ── capture: click-to-trace and manual trace ──────────────────────── */

  const addFace = (path: LatLng[], source: "auto" | "traced") => {
    if (path.length < 3) return;
    const id = `${source}-${Date.now().toString(36)}`;
    setSession((s) => ({
      ...s,
      faces: [
        ...s.faces,
        { id, path, azimuthDeg: Math.round(guessAzimuth(path)), pitchDeg: 22.6, shadeFactor: 0, source },
      ],
    }));
    setSelected(id);
  };

  /** Adds a measured plane (azimuth, pitch and sunshine hours all real). */
  const addMeasuredFace = (plane: RoofFace, path?: LatLng[]) => {
    const id = `auto-${plane.id}-${Date.now().toString(36)}`;
    setSession((s) => ({
      ...s,
      faces: [
        ...s.faces,
        {
          id,
          path: path ?? plane.path,

          azimuthDeg: Math.round(plane.azimuthDeg),
          pitchDeg: plane.pitchDeg,
          shadeFactor: 0,
          measuredSunshineHours: plane.measuredSunshineHours,
          source: "auto" as const,
        },
      ],
    }));
    setSelected(id);
  };

  /**
   * A click on the aerial.
   *
   * Hand trace: the dropped point is magnetised to the nearest roof edge in the
   * photo (ridge, hip, gutter or wall shadow) so a perimeter can be walked
   * quickly and still land on the real line; clicking back on the first point
   * closes the plane.
   *
   * Click-to-capture: the plane under the cursor is traced from the photo, and a
   * Google-measured segment under the same click carries its azimuth, pitch and
   * satellite sunshine hours. Nothing is dropped when neither source can be
   * trusted — a blind rectangle in the middle of the roof is worse than asking
   * for a hand trace.
   */
  const handleMapClick = React.useCallback(
    async (point: LatLng) => {
      if (mode === "manual") {
        const at = frame.current ? await snapVertexToEdge(frame.current, point) : point;
        if (draft.length >= 3 && distanceFt(draft[0], at) < 9) {
          addFace(draft, "traced");
          setDraft([]);
          setMode("idle");
          toast({ title: "Plane closed", description: "Drag any point to refine the perimeter." });
          return;
        }
        setDraft([...draft, at]);
        return;
      }
      if (mode !== "auto") return;

      /* clicking a face already captured just selects it */
      const existing = session.faces.find((f) => pointInPath(point, f.path));
      if (existing) {
        setSelected(existing.id);
        return;
      }

      const hit = measured.current.find((p) => pointInPath(point, p.path));

      if (!frame.current) {
        if (hit) {
          addMeasuredFace(hit);
          toast({
            title: "Roof plane captured",
            description: `${compassLabel(hit.azimuthDeg)} facing · measured plane.`,
          });
          return;
        }
        toast({
          title: "Zoom in a little",
          description: "The aerial needs to be closer before a plane can be traced.",
        });
        return;
      }

      setBusy("trace");
      try {
        const { path, rejected } = await traceRoofPlane(frame.current, point);
        if (path) {
          if (hit) addMeasuredFace(hit, path);
          else addFace(path, "auto");
          toast({
            title: "Roof plane captured",
            description: hit
              ? `${compassLabel(hit.azimuthDeg)} facing · measured pitch and sun hours.`
              : "Corners read from the photo — drag any point to correct it.",
          });
          return;
        }

        /* Trace did not return a clean polygon. Google measured data is the next
           best source: it gives azimuth, pitch and sunshine hours. */
        if (hit) {
          addMeasuredFace(hit);
          toast({
            title: "Roof plane captured",
            description: `${compassLabel(hit.azimuthDeg)} facing · measured plane.`,
          });
          return;
        }

        /* Neither source is trustworthy — refuse rather than invent a shape. */
        setMode("manual");
        toast({
          title: "That plane could not be read",
          description: `${rejected ?? "The photo is too uneven here"} — trace the perimeter by hand; points snap to the roof edges.`,
        });
      } catch (err) {
        console.error("roof trace failed:", (err as Error).message);
        /* Even if the tracer throws, measured planes are still usable. */
        if (hit) {
          addMeasuredFace(hit);
          toast({
            title: "Roof plane captured",
            description: `${compassLabel(hit.azimuthDeg)} facing · measured plane.`,
          });
        } else {
          setMode("manual");
          toast({
            title: "That plane could not be read",
            description: "Trace the perimeter by hand — points snap to the roof edges.",
          });
        }
      } finally {
        setBusy("");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, session.faces, draft, toast],
  );

  /* Hand trace shortcuts: Backspace removes the last point, Enter closes the
     plane, Escape abandons it. Only while the trace is armed. */
  React.useEffect(() => {
    if (mode !== "manual") return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        setDraft((d) => d.slice(0, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        setDraft((d) => {
          if (d.length >= 3) addFace(d, "traced");
          return [];
        });
        setMode("idle");
      } else if (e.key === "Escape") {
        setDraft([]);
        setMode("idle");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);






  /* ── the faces, in canvas form ─────────────────────────────────────── */

  /**
   * Every captured plane, coloured by sun exposure read from its azimuth and the
   * property's latitude (or Google's measured sunshine hours where the address
   * is covered). Rejected faces go red and translucent.
   */
  const aerialFaces = React.useMemo(
    () =>
      session.faces.map((face) => {
        const engineFace: RoofFace = { ...face, planAreaSqFt: pathAreaSqFt(face.path) };
        const exposure = readExposure(engineFace, session.lat ?? FL_LAT);
        return {
          id: face.id,
          path: face.path,
          fill: face.excluded ? "#dc2626" : exposure.color,
          stroke: face.excluded ? "#dc2626" : exposure.color,
          fillOpacity: face.excluded ? 0.2 : face.id === selected ? 0.62 : 0.45,
          selected: face.id === selected,
          caption: `${Math.round(engineFace.planAreaSqFt)} SF · ${compassLabel(face.azimuthDeg)}`,
        };
      }),
    [session.faces, session.lat, selected],
  );

  /** Dragging a vertex of the selected plane re-measures it live. */
  const moveVertex = React.useCallback(
    (faceId: string, index: number, at: LatLng) =>
      setSession((s) => ({
        ...s,
        faces: s.faces.map((f) =>
          f.id === faceId
            ? { ...f, source: "traced" as const, path: f.path.map((p, i) => (i === index ? at : p)) }
            : f,
        ),
      })),
    [setSession],
  );



  const finishManual = () => {
    if (draft.length >= 3) addFace(draft, "traced");
    setDraft([]);
    setMode("idle");
  };

  const reset = () => {
    setSession({ ...emptySession, address: session.address, lat: session.lat, lng: session.lng });
    setSelected("");
    setDraft([]);
    setMode("idle");
  };

  /**
   * The whole captured system goes into the shared cart (the same Order Desk
   * the flip book and the studio use): the installed total as the line price,
   * and every priced BOM line — array, racking, electrical, storage, soft
   * costs — carried as an itemised extra so the quote reads in full.
   */
  const solarExtras = React.useMemo(
    () =>
      bom.lines.map((l) => ({
        name: l.qty > 1 ? `${l.item} — ${l.qty} ${l.unit}` : l.item,
        price: l.total,
        key: `${l.group}:${l.item}`,
      })),
    [bom.lines],
  );

  const solarSummary = React.useMemo(
    () =>
      [
        `${production.kwDc.toFixed(2)} kW DC · ${production.panels} × ${panel.name}`,
        `${(production.yearlyKwhVerified ?? production.yearlyKwhModel).toLocaleString()} kWh per year · ${savings.offsetPercent}% of the bill`,
        `${rackingByCovering[session.covering].label} on ${session.covering} roof`,
        battery.usableKwh ? `${battery.name} — ${battery.usableKwh} kWh usable` : "No battery storage",
        session.address || "Address pending",
      ].join(" · "),
    [production, panel, savings, session.covering, session.address, battery],
  );

  const addToCart = () => {
    if (!cart || !production.panels) return;
    cart.addToCart({
      id: `solar-system-${panel.id}-${session.batteryId}-${session.covering}`,
      name: `Wonderlands Solar — ${production.kwDc.toFixed(2)} kW`,
      price: bom.installed,
      category: "solar",
      description: solarSummary,
      extras: solarExtras,
    } as never);
    toast({
      title: "Added to your project",
      description: `${production.kwDc.toFixed(2)} kW system with ${solarExtras.length} itemised lines — the Order Desk holds the full build.`,
    });
  };


  const mapHeight = height ?? 520;

  return (
    <div className="space-y-5">
      {/* map dimension labels need a dark halo to read over any aerial */}
      <style>{`
        .wl-solar-dim {
          text-shadow: 0 1px 3px rgba(0,0,0,.95), 0 0 8px rgba(0,0,0,.8);
          letter-spacing: .04em;
        }
      `}</style>

      {/* ── address ── */}
      <form onSubmit={search} className="relative flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <div className="flex items-center gap-2 border border-border/60 px-3">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setTyping(true);
                setQuery(e.target.value);
              }}
              onBlur={() => window.setTimeout(() => setSuggestions([]), 150)}
              placeholder="Property address — start typing, then pick your home"
              aria-label="Property address"
              autoComplete="off"
              className="w-full bg-transparent py-3 text-sm font-light outline-none"
            />
          </div>

          {/* registered addresses, as a maps-style suggestion list */}
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-30 max-h-64 overflow-y-auto border border-border/60 bg-background shadow-lg">
              {suggestions.map((s) => (
                <li key={s.placeId}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => chooseSuggestion(s)}
                    className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs font-light hover:bg-muted"
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          disabled={busy === "geocode"}
          className="inline-flex items-center justify-center gap-2 border border-foreground px-5 py-3 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          {busy === "geocode" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          Find the roof
        </button>
      </form>


      <div className={`grid gap-5 ${mapOnly ? "" : "lg:grid-cols-[1.6fr_1fr]"}`}>
        {/* ── aerial ── */}
        <div>
          <div className="relative overflow-hidden border border-border/60">
            <AerialCanvas
              view={view}
              onViewChange={setView}
              height={mapHeight}
              faces={aerialFaces}
              draft={draft}
              marker={session.lat != null && session.lng != null ? { lat: session.lat, lng: session.lng } : null}
              capturing={mode !== "idle"}
              onMapClick={handleMapClick}
              onFaceClick={(id) => setSelected((s) => (s === id ? "" : id))}
              onVertexMove={moveVertex}
              onSizeChange={setFrameSize}
            />
            {(busy === "insights" || busy === "trace") && (
              <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 bg-background/90 px-3 py-2 text-[9px] uppercase tracking-[0.3em]">
                <Loader2 className="h-3 w-3 animate-spin" />
                {busy === "insights" ? "Reading the roof" : "Tracing the plane"}
              </div>
            )}
            {mode !== "idle" && (
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 bg-background/90 px-3 py-2 text-[10px] leading-relaxed">
                {mode === "auto"
                  ? "Click the centre of each roof plane — the outline is traced from the photo."
                  : `Click each corner of the plane, then finish the outline. ${draft.length} points placed.`}
              </div>
            )}
          </div>


          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Auto flood-fill capture ("click a roof plane") is retired — it read
                the photo unreliably and dropped planes before the reader clicked.
                Hand tracing is now the single, predictable capture path. */}
            <button
              onClick={() => {
                setDraft([]);
                setMode(mode === "manual" ? "idle" : "manual");
              }}
              className={`inline-flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.28em] transition-colors ${
                mode === "manual" ? "border-foreground bg-foreground text-background" : "border-border/60 hover:border-foreground"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" /> Trace the roof
            </button>
            {mode === "manual" && draft.length >= 3 && (
              <button
                onClick={finishManual}
                className="border border-primary px-3 py-2 text-[9px] uppercase tracking-[0.28em] text-primary"
              >
                Close the plane
              </button>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.28em] hover:border-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Start over
            </button>
            <span className="ml-auto text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
              Orange prime · yellow good · red shaded
            </span>
          </div>

          {/* memory of previous studies — reload any earlier roof capture */}
          <div className="mt-4">
            <SolarProjectGallery
              onReload={reloadProject}
              onSaveCurrent={saveCurrentProject}
              canSave={Boolean(session.address) && session.faces.length > 0}
            />
          </div>
        </div>


        {/* ── the build (hidden on the map-only leaf) ── */}
        {!mapOnly && (
        <div className="space-y-5">

          <div className="border border-border/60 p-4">
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">The system</p>
            <div className="mt-3 space-y-3">
              {/* brand first, then the wattage inside that brand */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <Label>Brand</Label>
                  <select
                    value={panel.brand}
                    onChange={(e) => {
                      const first = solarPanels.find((p) => p.brand === e.target.value);
                      if (first) patch({ panelId: first.id });
                    }}
                    className={selectClass}
                  >
                    {solarPanelBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <Label>Module · watts</Label>
                  <select
                    value={session.panelId}
                    onChange={(e) => patch({ panelId: e.target.value })}
                    className={selectClass}
                  >
                    {solarPanels
                      .filter((p) => p.brand === panel.brand)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                {panelFullName(panel)} · {(panel.efficiency * 100).toFixed(1)}% efficient ·{" "}
                {panel.warrantyYears}-year warranty. {panel.note}
              </p>

              <label className="block">
                <Label>Storage</Label>
                <select value={session.batteryId} onChange={(e) => patch({ batteryId: e.target.value })} className={selectClass}>
                  {solarBatteries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <Label>Roof covering</Label>
                <select
                  value={session.covering}
                  onChange={(e) => patch({ covering: e.target.value as RoofCovering })}
                  className={selectClass}
                >
                  {roofCoverings.map((c) => (
                    <option key={c} value={c}>
                      {rackingByCovering[c].label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                {rackingByCovering[session.covering].anchor}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <Label>Power bill / mo</Label>
                  <input
                    type="number"
                    min={40}
                    value={session.monthlyBill}
                    onChange={(e) => patch({ monthlyBill: Math.max(40, Number(e.target.value) || 0) })}
                    className={selectClass}
                  />
                </label>
                <label className="block">
                  <Label>Run to panel (ft)</Label>
                  <input
                    type="number"
                    min={5}
                    value={session.serviceRunFt}
                    onChange={(e) => patch({ serviceRunFt: Math.max(5, Number(e.target.value) || 0) })}
                    className={selectClass}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* faces */}
          <div className="border border-border/60 p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                Roof faces · {session.faces.length}
              </p>
              {session.covered && (
                <span className="text-[9px] uppercase tracking-[0.28em] text-primary">measured</span>
              )}
            </div>

            {!session.faces.length && (
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                Search the address, then click each roof plane on the aerial. Every outline stays editable.
              </p>
            )}

            <div className="mt-3 space-y-2">
              {session.faces.map((f, i) => {
                const engineFace: RoofFace = { ...f, planAreaSqFt: pathAreaSqFt(f.path) };
                const exposure = readExposure(engineFace, session.lat ?? FL_LAT);
                const layout = production.layouts.find((l) => l.faceId === f.id);
                const open = f.id === selected;
                return (
                  <div key={f.id} className={`border ${open ? "border-foreground" : "border-border/50"}`}>
                    <button
                      onClick={() => setSelected(open ? "" : f.id)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left"
                    >
                      <span className="h-3 w-3 shrink-0" style={{ backgroundColor: f.excluded ? "#dc2626" : exposure.color }} />
                      <span className="font-serif text-sm font-light">
                        Face {String(i + 1).padStart(2, "0")} · {compassLabel(f.azimuthDeg)}
                      </span>
                      <span className="ml-auto text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
                        {Math.round(engineFace.planAreaSqFt)} SF · {layout?.panels ?? 0} panels
                      </span>
                    </button>

                    {open && (
                      <div className="space-y-3 border-t border-border/50 px-3 py-3">
                        <label className="block">
                          <Label>
                            Pitch {pitchAsRise(f.pitchDeg)} ({Math.round(f.pitchDeg)}°)
                          </Label>
                          <input
                            type="range"
                            min={0}
                            max={45}
                            step={1}
                            value={f.pitchDeg}
                            onChange={(e) => updateFace(f.id, { pitchDeg: Number(e.target.value) })}
                            className="mt-2 w-full accent-primary"
                          />
                        </label>
                        <label className="block">
                          <Label>
                            Faces {compassLabel(f.azimuthDeg)} · {Math.round(f.azimuthDeg)}°
                          </Label>
                          <input
                            type="range"
                            min={0}
                            max={359}
                            step={1}
                            value={f.azimuthDeg}
                            onChange={(e) => updateFace(f.id, { azimuthDeg: Number(e.target.value) })}
                            className="mt-2 w-full accent-primary"
                          />
                        </label>
                        <label className="block">
                          <Label>Shade {Math.round(f.shadeFactor * 100)}%</Label>
                          <input
                            type="range"
                            min={0}
                            max={60}
                            step={5}
                            value={Math.round(f.shadeFactor * 100)}
                            onChange={(e) => updateFace(f.id, { shadeFactor: Number(e.target.value) / 100 })}
                            className="mt-2 w-full accent-primary"
                          />
                        </label>
                        <p className="text-[10px] text-muted-foreground">
                          {exposure.label} · {exposure.sunHours.toLocaleString()} sun hours · longest span{" "}
                          {Math.round(pathSpanFt(f.path))} ft
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateFace(f.id, { excluded: !f.excluded })}
                            className="flex-1 border border-border/60 px-2 py-2 text-[9px] uppercase tracking-[0.24em] hover:border-foreground"
                          >
                            {f.excluded ? "Include face" : "Reject face"}
                          </button>
                          <button
                            onClick={() =>
                              setSession((s) => ({ ...s, faces: s.faces.filter((x) => x.id !== f.id) }))
                            }
                            aria-label="Delete this face"
                            className="border border-border/60 px-3 py-2 hover:border-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* headline */}
          <div className="border border-foreground/70 p-4">
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Your solar project</p>
            <p className="mt-2 font-serif text-3xl font-light leading-none">{production.kwDc.toFixed(2)} kW</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {production.panels} panels ·{" "}
              {(production.yearlyKwhVerified ?? production.yearlyKwhModel).toLocaleString()} kWh per year ·{" "}
              {savings.offsetPercent}% of the bill
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Pricing provided after the site survey
            </p>
            {cart && (
              <button
                onClick={addToCart}
                disabled={!production.panels}
                className="mt-4 w-full border border-foreground px-4 py-3 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
              >
                Add this system to my project
              </button>
            )}
          </div>
        </div>
        )}
      </div>

      {!mapOnly && (
        <>
          {/* ── animated performance graphics ── */}
          <SolarPerformanceGraphics
            production={production}
            savings={savings}
            faces={faces}
            latitude={session.lat ?? FL_LAT}
          />

          <SolarReportTabs
            address={session.address}
            faces={faces}
            production={production}
            savings={savings}
            bom={bom}
            panel={panel}
            battery={battery}
            covering={session.covering}
            monthlyBill={session.monthlyBill}
            imageryDate={session.imageryDate}
            verified={production.yearlyKwhVerified != null}
          />
        </>
      )}

      {/* the shared Order Desk, so the solar system lives with the rest of the project */}
      {cart && (
        <StudioCartWidget
          currentPrice={bom.installed}
          currentName={`Wonderlands Solar — ${production.kwDc.toFixed(2)} kW`}
          currentCategory="solar"
          currentExtras={solarExtras}
          onAddCurrent={addToCart}
        />
      )}
    </div>
  );
};

export default SolarCalculatorBoard;
