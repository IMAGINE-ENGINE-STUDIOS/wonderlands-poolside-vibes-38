/// <reference types="google.maps" />
import * as React from "react";
import { Loader2, Crosshair, MapPin, Pencil, RotateCcw, Search, Trash2, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useOptionalShoppingCart } from "@/components/ShoppingCartProvider";
import useGoogleMaps from "@/lib/solar/useGoogleMaps";
import {
  autoTraceAt,
  facesFromInsights,
  guessAzimuth,
  rectangleAround,
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

interface SavedFace {
  id: string;
  path: LatLng[];
  azimuthDeg: number;
  pitchDeg: number;
  shadeFactor: number;
  measuredSunshineHours?: number | null;
  source: "auto" | "traced";
  excluded?: boolean;
}

interface SolarSession {
  address: string;
  lat: number | null;
  lng: number | null;
  faces: SavedFace[];
  covered: boolean;
  imageryDate: string;
  panelId: string;
  batteryId: string;
  covering: RoofCovering;
  monthlyBill: number;
  serviceRunFt: number;
}

const emptySession: SolarSession = {
  address: "",
  lat: null,
  lng: null,
  faces: [],
  covered: false,
  imageryDate: "",
  panelId: solarPanels[0]?.id ?? "",
  batteryId: "battery-none",
  covering: "shingle",
  monthlyBill: 320,
  serviceRunFt: 45,
};

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

const SolarCalculatorBoard: React.FC<{ height?: number }> = ({ height }) => {
  const { ready, error: mapsError } = useGoogleMaps();
  const { toast } = useToast();
  const cart = useOptionalShoppingCart();

  const [session, setSession] = usePersistentState<SolarSession>("solar_calculator_session", emptySession);
  const [query, setQuery] = React.useState(session.address);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [typing, setTyping] = React.useState(false);
  const [busy, setBusy] = React.useState<"" | "geocode" | "insights" | "trace">("");

  const [mode, setMode] = usePersistentState<Mode>("solar_capture_mode", "idle");
  const [selected, setSelected] = React.useState<string>("");
  const [draft, setDraft] = React.useState<LatLng[]>([]);

  const mapEl = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<google.maps.Map | null>(null);
  const polys = React.useRef<Map<string, google.maps.Polygon>>(new Map());
  const draftPoly = React.useRef<google.maps.Polygon | null>(null);
  const marker = React.useRef<google.maps.Marker | null>(null);
  const tile = React.useRef<TileFrame | null>(null);
  /** Google's measured roof planes for this address — the click hit-test pool */
  const measured = React.useRef<RoofFace[]>([]);
  /** Live hand-trace overlay: the spline plus one length label per side */
  const draftLine = React.useRef<google.maps.Polyline | null>(null);
  const draftDots = React.useRef<google.maps.Marker[]>([]);
  const draftLabels = React.useRef<google.maps.Marker[]>([]);

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


  /* ── map bootstrap ─────────────────────────────────────────────────── */

  React.useEffect(() => {
    if (!ready || !mapEl.current || map.current) return;
    const centre = { lat: session.lat ?? 27.9506, lng: session.lng ?? -82.4572 };
    map.current = new google.maps.Map(mapEl.current, {
      center: centre,
      zoom: session.lat ? 20 : 11,
      mapTypeId: "satellite",
      tilt: 0,
      rotateControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      gestureHandling: "greedy",
      maxZoom: 21,
    });
  }, [ready, session.lat, session.lng]);

  /* refresh the sampling tile whenever the framing settles */
  React.useEffect(() => {
    if (!ready || !map.current) return;
    const m = map.current;
    const listener = m.addListener("idle", () => {
      const c = m.getCenter();
      if (!c) return;
      const zoom = Math.round(m.getZoom() ?? 20);
      if (zoom < 17) {
        tile.current = null;
        return;
      }
      callSolar<TileFrame>({ action: "tile", lat: c.lat(), lng: c.lng(), zoom, size: 640 })
        .then((frame) => {
          tile.current = frame;
        })
        .catch(() => {
          tile.current = null;
        });
    });
    return () => listener.remove();
  }, [ready, callSolar]);

  /* ── address search ────────────────────────────────────────────────── */

  /** Frames a resolved address on the aerial and reads its roof. */
  const settleOn = async (found: { address: string; lat: number; lng: number }) => {
    patch({ address: found.address, lat: found.lat, lng: found.lng });
    setQuery(found.address);
    setSuggestions([]);
    map.current?.setCenter({ lat: found.lat, lng: found.lng });
    map.current?.setZoom(20);
    marker.current?.setMap(null);
    marker.current = new google.maps.Marker({
      position: { lat: found.lat, lng: found.lng },
      map: map.current!,
      opacity: 0.85,
    });
    await loadInsights(found.lat, found.lng);
  };

  /* Suggest registered addresses as the reader types (debounced, server-side). */
  React.useEffect(() => {
    const input = query.trim();
    if (!typing || input.length < 4 || input === session.address) {
      setSuggestions([]);
      return;
    }
    const timer = window.setTimeout(() => {
      callSolar<{ suggestions: Suggestion[] }>({ action: "autocomplete", input })
        .then((r) => setSuggestions(r.suggestions ?? []))
        .catch(() => setSuggestions([]));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, typing, session.address, callSolar]);

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


  /** Measured roof planes, when Google covers the address. */
  const loadInsights = async (lat: number, lng: number) => {
    setBusy("insights");
    try {
      const insights = await callSolar<BuildingInsights>({ action: "insights", lat, lng });
      if (!insights.covered) {
        measured.current = [];
        patch({ covered: false });
        setMode("auto");
        toast({
          title: "No measured roof data here",
          description: "Click each roof plane on the aerial and the outline is traced for you.",
        });
        return;
      }
      const planes = facesFromInsights(insights);
      /* Kept aside so a later click on the aerial can pick the measured plane
         under the cursor even after the reader has cleared or edited faces. */
      measured.current = planes;
      const d = insights.imageryDate;
      patch({
        covered: true,
        imageryDate: d ? `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}` : "",
        faces: planes.map(({ planAreaSqFt: _drop, ...f }) => f),
      });
      /* Stay in click-to-detect so any plane Google missed can be added by
         clicking it — the roof colouring is applied from location + azimuth. */
      setMode("auto");
      if (planes.length)
        toast({
          title: `${planes.length} roof planes detected`,
          description: "Colours read sun exposure. Click any missed plane, or drag a point to adjust.",
        });
    } catch (err) {
      measured.current = [];
      patch({ covered: false });
      setMode("auto");
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
  const addMeasuredFace = (plane: RoofFace) => {
    const id = `auto-${plane.id}-${Date.now().toString(36)}`;
    setSession((s) => ({
      ...s,
      faces: [
        ...s.faces,
        {
          id,
          path: plane.path,
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

  React.useEffect(() => {
    if (!ready || !map.current) return;
    const m = map.current;
    const listener = m.addListener("click", async (e: google.maps.MapMouseEvent) => {
      const at = e.latLng;
      if (!at) return;
      const point = { lat: at.lat(), lng: at.lng() };

      if (mode === "manual") {
        setDraft((d) => [...d, point]);
        return;
      }
      if (mode !== "auto") return;

      /* 1. A measured plane under the cursor is the best answer — real
            azimuth, pitch and satellite sunshine hours, no image guessing. */
      const hit = measured.current.find((p) => pointInPath(point, p.path));
      if (hit) {
        const already = session.faces.some((f) => pointInPath(point, f.path));
        if (already) {
          toast({ title: "Plane already captured", description: "Click it once more to select and edit its outline." });
          return;
        }
        addMeasuredFace(hit);
        toast({ title: "Roof plane detected", description: `${compassLabel(hit.azimuthDeg)} facing · coloured by sun exposure.` });
        return;
      }

      /* 2. Otherwise read the plane out of the aerial photo. */
      if (tile.current) {
        setBusy("trace");
        try {
          const traced = await autoTraceAt(tile.current, point);
          if (traced) {
            addFace(traced, "auto");
            return;
          }
        } catch (err) {
          console.error("roof trace failed:", (err as Error).message);
        } finally {
          setBusy("");
        }
      }

      /* 3. Last resort — an editable outline on the spot, so the click is
            never dead even when the photo cannot be sampled. */
      addFace(rectangleAround(point), "traced");
      toast({
        title: "Outline placed for you",
        description: "The photo could not be read here — drag the points onto the roof edges.",
      });
    });
    return () => listener.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, mode, session.faces, toast]);


  /* ── draw the faces ───────────────────────────────────────────────── */

  React.useEffect(() => {
    if (!ready || !map.current) return;
    const m = map.current;
    const live = new Set(session.faces.map((f) => f.id));

    // drop polygons whose face is gone
    polys.current.forEach((poly, id) => {
      if (!live.has(id)) {
        poly.setMap(null);
        polys.current.delete(id);
      }
    });

    session.faces.forEach((face) => {
      const engineFace: RoofFace = { ...face, planAreaSqFt: pathAreaSqFt(face.path) };
      const exposure = readExposure(engineFace, session.lat ?? FL_LAT);
      const isSelected = face.id === selected;
      const style: google.maps.PolygonOptions = {
        paths: face.path,
        fillColor: face.excluded ? "#dc2626" : exposure.color,
        fillOpacity: face.excluded ? 0.2 : isSelected ? 0.62 : 0.45,
        strokeColor: isSelected ? "#ffffff" : exposure.color,
        strokeOpacity: 0.95,
        strokeWeight: isSelected ? 2.5 : 1.5,
        editable: isSelected,
        draggable: isSelected,
        zIndex: isSelected ? 20 : 10,
      };

      let poly = polys.current.get(face.id);
      if (!poly) {
        poly = new google.maps.Polygon({ ...style, map: m });
        polys.current.set(face.id, poly);
        poly.addListener("click", () => setSelected(face.id));
        const commit = () => {
          const path = poly!
            .getPath()
            .getArray()
            .map((p) => ({ lat: p.lat(), lng: p.lng() }));
          updateFace(face.id, { path, source: "traced" });
        };
        poly.getPath().addListener("set_at", commit);
        poly.getPath().addListener("insert_at", commit);
        poly.getPath().addListener("remove_at", commit);
        poly.addListener("dragend", commit);
      } else {
        poly.setOptions(style);
      }
    });
  }, [ready, session.faces, session.lat, selected, updateFace]);

  /**
   * The in-progress hand trace. The spline is drawn as it is laid down — an
   * open polyline with a dot on every vertex, a dimension label in feet on
   * every side (including the closing side once three points exist), and a
   * translucent fill so the plane reads while it is still being drawn.
   */
  React.useEffect(() => {
    if (!ready || !map.current) return;
    const m = map.current;

    const clearOverlay = () => {
      draftDots.current.forEach((d) => d.setMap(null));
      draftDots.current = [];
      draftLabels.current.forEach((l) => l.setMap(null));
      draftLabels.current = [];
    };

    if (!draft.length) {
      draftPoly.current?.setMap(null);
      draftPoly.current = null;
      draftLine.current?.setMap(null);
      draftLine.current = null;
      clearOverlay();
      return;
    }

    /* fill (needs three points to read as a plane) */
    if (!draftPoly.current)
      draftPoly.current = new google.maps.Polygon({
        map: m,
        clickable: false,
        strokeOpacity: 0,
        fillColor: "#f97316",
        fillOpacity: 0.22,
      });
    draftPoly.current.setPath(draft.length >= 3 ? draft : []);

    /* the spline itself, as drawn */
    if (!draftLine.current)
      draftLine.current = new google.maps.Polyline({
        map: m,
        clickable: false,
        strokeColor: "#ffffff",
        strokeOpacity: 0.95,
        strokeWeight: 2.5,
        zIndex: 40,
      });
    draftLine.current.setPath(draft);

    clearOverlay();

    /* vertex dots */
    draft.forEach((p, i) => {
      draftDots.current.push(
        new google.maps.Marker({
          position: p,
          map: m,
          clickable: false,
          zIndex: 41,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: i === draft.length - 1 ? "#f97316" : "#ffffff",
            fillOpacity: 1,
            strokeColor: "#0a0a0f",
            strokeWeight: 1.5,
          },
        }),
      );
    });

    /* one dimension label per side, at the side's midpoint */
    const sides = draft.length >= 3 ? draft.length : draft.length - 1;
    for (let i = 0; i < sides; i++) {
      const a = draft[i];
      const b = draft[(i + 1) % draft.length];
      const feet = distanceFt(a, b);
      if (feet < 1) continue;
      draftLabels.current.push(
        new google.maps.Marker({
          position: { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 },
          map: m,
          clickable: false,
          zIndex: 42,
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0, fillOpacity: 0, strokeOpacity: 0 },
          label: {
            text: `${feet.toFixed(1)} ft`,
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: "500",
            className: "wl-solar-dim",
          },
        }),
      );
    }
  }, [ready, draft]);


  React.useEffect(
    () => () => {
      polys.current.forEach((p) => p.setMap(null));
      polys.current.clear();
      draftLine.current?.setMap(null);
      draftDots.current.forEach((d) => d.setMap(null));
      draftLabels.current.forEach((l) => l.setMap(null));
      draftPoly.current?.setMap(null);
      marker.current?.setMap(null);
      map.current = null;
    },
    [],
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


      {mapsError && (
        <p className="border border-border/60 p-3 text-xs text-muted-foreground">{mapsError}</p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* ── aerial ── */}
        <div>
          <div className="relative overflow-hidden border border-border/60">
            <div ref={mapEl} style={{ height: mapHeight }} className="w-full" />
            {!ready && !mapsError && (
              <div className="absolute inset-0 flex items-center justify-center text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                Bringing up the aerial…
              </div>
            )}
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
            <button
              onClick={() => {
                setDraft([]);
                setMode(mode === "auto" ? "idle" : "auto");
              }}
              className={`inline-flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.28em] transition-colors ${
                mode === "auto" ? "border-foreground bg-foreground text-background" : "border-border/60 hover:border-foreground"
              }`}
            >
              <Crosshair className="h-3.5 w-3.5" /> Click a roof plane
            </button>
            <button
              onClick={() => setMode(mode === "manual" ? "idle" : "manual")}
              className={`inline-flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.28em] transition-colors ${
                mode === "manual" ? "border-foreground bg-foreground text-background" : "border-border/60 hover:border-foreground"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" /> Trace by hand
            </button>
            {mode === "manual" && (
              <button
                onClick={finishManual}
                className="border border-primary px-3 py-2 text-[9px] uppercase tracking-[0.28em] text-primary"
              >
                Finish the outline
              </button>
            )}
            {session.lat != null && (
              <button
                onClick={() => loadInsights(session.lat!, session.lng!)}
                className="inline-flex items-center gap-2 border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.28em] hover:border-foreground"
              >
                <Sun className="h-3.5 w-3.5" /> Re-read the roof
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
        </div>

        {/* ── the build ── */}
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
      </div>

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
