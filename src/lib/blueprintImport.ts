/**
 * Blueprint import engine.
 *
 * Turns an existing plan set — PDF, JPG/PNG scan, AutoCAD DXF or a
 * Vectorworks / Illustrator SVG export — into something the Blueprint Builder
 * can keep editing:
 *
 *  - raster sources become a scalable, calibratable underlay per sheet
 *  - vector sources (DXF / SVG) become real editable polygons on the site
 *    layers, so every corner, wall and pool edge stays draggable
 */

export type ImportKind = 'pdf' | 'image' | 'dxf' | 'svg';

export interface ImportedPoint {
  x: number;
  y: number;
}

export interface ImportedVectorShape {
  points: ImportedPoint[];
  closed: boolean;
  /** Source CAD/SVG layer or id, used to suggest a site layer */
  sourceLayer: string;
}

export interface ImportedRasterPage {
  /** PNG data URL of the rendered page */
  dataUrl: string;
  widthPx: number;
  heightPx: number;
  label: string;
}

export interface ImportedDrawing {
  kind: ImportKind;
  fileName: string;
  rasterPages: ImportedRasterPage[];
  vectorShapes: ImportedVectorShape[];
  /** Bounding box of the vector geometry, in source units */
  vectorBounds?: { minX: number; minY: number; maxX: number; maxY: number };
  /** Text pulled out of a PDF, handy to prefill title block fields */
  text?: string;
  warnings: string[];
}

const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';

let pdfjsPromise: Promise<any> | null = null;

/** Lazily loads pdf.js from the CDN once per session. */
export function loadPdfjs(): Promise<any> {
  const w = window as any;
  if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib);
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = import(/* @vite-ignore */ PDFJS_URL).then(mod => {
    const lib = (mod as any).default ?? mod;
    lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    w.pdfjsLib = lib;
    return lib;
  });
  return pdfjsPromise;
}

const readAsArrayBuffer = (file: File) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

const readAsText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/* ------------------------------------------------------------------ PDF */

async function importPdf(file: File, maxPages = 12): Promise<ImportedDrawing> {
  const pdfjsLib = await loadPdfjs();
  const buffer = await readAsArrayBuffer(file);
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: ImportedRasterPage[] = [];
  const warnings: string[] = [];
  let text = '';

  const count = Math.min(doc.numPages, maxPages);
  if (doc.numPages > maxPages) warnings.push(`Only the first ${maxPages} of ${doc.numPages} pages were imported.`);

  for (let i = 1; i <= count; i++) {
    const page = await doc.getPage(i);
    // Target ~2200px on the long edge: sharp enough to trace, light enough to cache.
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(3, Math.max(1, 2200 / Math.max(base.width, base.height)));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    pages.push({
      dataUrl: canvas.toDataURL('image/jpeg', 0.85),
      widthPx: canvas.width,
      heightPx: canvas.height,
      label: `Page ${i}`,
    });
    try {
      const content = await page.getTextContent();
      text += content.items.map((it: any) => it.str).join(' ') + '\n';
    } catch {
      /* text layer optional */
    }
  }

  return { kind: 'pdf', fileName: file.name, rasterPages: pages, vectorShapes: [], text, warnings };
}

/* ---------------------------------------------------------------- image */

async function importImage(file: File): Promise<ImportedDrawing> {
  const dataUrl = await readAsDataUrl(file);
  const size = await new Promise<{ w: number; h: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error('Could not read that image.'));
    img.src = dataUrl;
  });
  return {
    kind: 'image',
    fileName: file.name,
    rasterPages: [{ dataUrl, widthPx: size.w, heightPx: size.h, label: file.name }],
    vectorShapes: [],
    warnings: [],
  };
}

/* ------------------------------------------------------------------ DXF */

/**
 * Minimal but dependable DXF entity reader: LINE, LWPOLYLINE, POLYLINE/VERTEX,
 * CIRCLE and ARC (polygonized). Enough to bring a surveyor's or architect's
 * AutoCAD plan in as editable geometry.
 */
export function parseDxf(source: string): { shapes: ImportedVectorShape[]; warnings: string[] } {
  const lines = source.split(/\r\n|\r|\n/);
  const pairs: { code: number; value: string }[] = [];
  for (let i = 0; i < lines.length - 1; i += 2) {
    const code = parseInt(lines[i].trim(), 10);
    if (Number.isNaN(code)) continue;
    pairs.push({ code, value: lines[i + 1] });
  }

  const shapes: ImportedVectorShape[] = [];
  const warnings: string[] = [];
  const skipped = new Set<string>();

  let i = 0;
  const nextEntityStart = (from: number) => {
    for (let k = from; k < pairs.length; k++) if (pairs[k].code === 0) return k;
    return pairs.length;
  };

  while (i < pairs.length) {
    if (pairs[i].code !== 0) {
      i++;
      continue;
    }
    const type = pairs[i].value.trim().toUpperCase();
    const end = nextEntityStart(i + 1);
    const body = pairs.slice(i + 1, end);
    const get = (code: number) => body.find(p => p.code === code)?.value;
    const num = (code: number, fallback = 0) => {
      const v = get(code);
      const n = v === undefined ? NaN : parseFloat(v);
      return Number.isFinite(n) ? n : fallback;
    };
    const layer = (get(8) || '0').trim();

    if (type === 'LINE') {
      shapes.push({
        points: [
          { x: num(10), y: num(20) },
          { x: num(11), y: num(21) },
        ],
        closed: false,
        sourceLayer: layer,
      });
    } else if (type === 'LWPOLYLINE') {
      const xs = body.filter(p => p.code === 10).map(p => parseFloat(p.value));
      const ys = body.filter(p => p.code === 20).map(p => parseFloat(p.value));
      const pts = xs.map((x, idx) => ({ x, y: ys[idx] ?? 0 })).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
      const flag = num(70);
      if (pts.length >= 2) shapes.push({ points: pts, closed: (flag & 1) === 1, sourceLayer: layer });
    } else if (type === 'POLYLINE') {
      // vertices follow as separate VERTEX entities until SEQEND
      const pts: ImportedPoint[] = [];
      let k = end;
      let closed = (num(70) & 1) === 1;
      while (k < pairs.length && pairs[k].code === 0) {
        const vType = pairs[k].value.trim().toUpperCase();
        if (vType === 'SEQEND') {
          k = nextEntityStart(k + 1);
          break;
        }
        if (vType !== 'VERTEX') break;
        const vEnd = nextEntityStart(k + 1);
        const vBody = pairs.slice(k + 1, vEnd);
        const vx = parseFloat(vBody.find(p => p.code === 10)?.value ?? 'NaN');
        const vy = parseFloat(vBody.find(p => p.code === 20)?.value ?? 'NaN');
        if (Number.isFinite(vx) && Number.isFinite(vy)) pts.push({ x: vx, y: vy });
        k = vEnd;
      }
      if (pts.length >= 2) shapes.push({ points: pts, closed, sourceLayer: layer });
      i = k;
      continue;
    } else if (type === 'CIRCLE' || type === 'ARC') {
      const cx = num(10);
      const cy = num(20);
      const r = num(40);
      const start = type === 'ARC' ? (num(50) * Math.PI) / 180 : 0;
      let sweepEnd = type === 'ARC' ? (num(51) * Math.PI) / 180 : Math.PI * 2;
      if (sweepEnd <= start) sweepEnd += Math.PI * 2;
      const steps = Math.max(12, Math.round(((sweepEnd - start) / (Math.PI * 2)) * 48));
      const pts: ImportedPoint[] = [];
      for (let s = 0; s <= steps; s++) {
        const a = start + ((sweepEnd - start) * s) / steps;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
      shapes.push({ points: pts, closed: type === 'CIRCLE', sourceLayer: layer });
    } else if (['SPLINE', 'ELLIPSE', 'HATCH', 'INSERT', 'SOLID', 'MTEXT', 'TEXT', 'DIMENSION'].includes(type)) {
      skipped.add(type);
    }

    i = end;
  }

  if (skipped.size) warnings.push(`Not converted to editable geometry: ${[...skipped].join(', ')}.`);
  return { shapes, warnings };
}

async function importDxf(file: File): Promise<ImportedDrawing> {
  const text = await readAsText(file);
  const { shapes, warnings } = parseDxf(text);
  // DXF Y grows upward; flip so it matches screen coordinates.
  const flipped = shapes.map(s => ({ ...s, points: s.points.map(p => ({ x: p.x, y: -p.y })) }));
  return {
    kind: 'dxf',
    fileName: file.name,
    rasterPages: [],
    vectorShapes: flipped,
    vectorBounds: boundsOf(flipped),
    warnings: shapes.length ? warnings : ['No LINE / POLYLINE geometry was found in that DXF.'],
  };
}

/* ------------------------------------------------------------------ SVG */

const parseSvgPath = (d: string): ImportedVectorShape[] => {
  const out: ImportedVectorShape[] = [];
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
  let pts: ImportedPoint[] = [];
  let cur: ImportedPoint = { x: 0, y: 0 };
  let cmd = '';
  let idx = 0;
  const flush = (closed: boolean) => {
    if (pts.length >= 2) out.push({ points: pts, closed, sourceLayer: 'path' });
    pts = [];
  };
  const nextNum = () => parseFloat(tokens[idx++] ?? '0');
  while (idx < tokens.length) {
    const t = tokens[idx];
    if (/[a-z]/i.test(t)) {
      cmd = t;
      idx++;
      if (cmd === 'Z' || cmd === 'z') {
        flush(true);
        continue;
      }
      if (cmd === 'M' || cmd === 'm') flush(false);
    }
    const rel = cmd === cmd.toLowerCase();
    switch (cmd.toUpperCase()) {
      case 'M':
      case 'L': {
        const x = nextNum();
        const y = nextNum();
        cur = rel ? { x: cur.x + x, y: cur.y + y } : { x, y };
        pts.push(cur);
        break;
      }
      case 'H': {
        const x = nextNum();
        cur = { x: rel ? cur.x + x : x, y: cur.y };
        pts.push(cur);
        break;
      }
      case 'V': {
        const y = nextNum();
        cur = { x: cur.x, y: rel ? cur.y + y : y };
        pts.push(cur);
        break;
      }
      case 'C': {
        nextNum();
        nextNum();
        nextNum();
        nextNum();
        const x = nextNum();
        const y = nextNum();
        cur = rel ? { x: cur.x + x, y: cur.y + y } : { x, y };
        pts.push(cur);
        break;
      }
      case 'S':
      case 'Q': {
        nextNum();
        nextNum();
        const x = nextNum();
        const y = nextNum();
        cur = rel ? { x: cur.x + x, y: cur.y + y } : { x, y };
        pts.push(cur);
        break;
      }
      case 'T': {
        const x = nextNum();
        const y = nextNum();
        cur = rel ? { x: cur.x + x, y: cur.y + y } : { x, y };
        pts.push(cur);
        break;
      }
      case 'A': {
        nextNum();
        nextNum();
        nextNum();
        nextNum();
        nextNum();
        const x = nextNum();
        const y = nextNum();
        cur = rel ? { x: cur.x + x, y: cur.y + y } : { x, y };
        pts.push(cur);
        break;
      }
      default:
        idx++;
    }
  }
  flush(false);
  return out;
};

export function parseSvg(source: string): { shapes: ImportedVectorShape[]; warnings: string[] } {
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
  if (doc.querySelector('parsererror')) return { shapes: [], warnings: ['That SVG could not be parsed.'] };
  const shapes: ImportedVectorShape[] = [];
  const layerOf = (el: Element) =>
    el.closest('g')?.getAttribute('inkscape:label') ||
    el.closest('g')?.getAttribute('id') ||
    el.getAttribute('id') ||
    el.tagName;

  doc.querySelectorAll('polygon, polyline').forEach(el => {
    const nums = (el.getAttribute('points') || '').match(/-?\d*\.?\d+/g) || [];
    const pts: ImportedPoint[] = [];
    for (let i = 0; i < nums.length - 1; i += 2) pts.push({ x: parseFloat(nums[i]), y: parseFloat(nums[i + 1]) });
    if (pts.length >= 2) shapes.push({ points: pts, closed: el.tagName.toLowerCase() === 'polygon', sourceLayer: layerOf(el) });
  });
  doc.querySelectorAll('line').forEach(el => {
    const n = (a: string) => parseFloat(el.getAttribute(a) || '0');
    shapes.push({ points: [{ x: n('x1'), y: n('y1') }, { x: n('x2'), y: n('y2') }], closed: false, sourceLayer: layerOf(el) });
  });
  doc.querySelectorAll('rect').forEach(el => {
    const n = (a: string) => parseFloat(el.getAttribute(a) || '0');
    const x = n('x');
    const y = n('y');
    const w = n('width');
    const h = n('height');
    if (w && h)
      shapes.push({
        points: [
          { x, y },
          { x: x + w, y },
          { x: x + w, y: y + h },
          { x, y: y + h },
        ],
        closed: true,
        sourceLayer: layerOf(el),
      });
  });
  doc.querySelectorAll('path').forEach(el => {
    const layer = layerOf(el);
    parseSvgPath(el.getAttribute('d') || '').forEach(s => shapes.push({ ...s, sourceLayer: layer }));
  });

  return { shapes, warnings: shapes.length ? [] : ['No traceable geometry was found in that SVG.'] };
}

async function importSvg(file: File): Promise<ImportedDrawing> {
  const text = await readAsText(file);
  const { shapes, warnings } = parseSvg(text);
  return {
    kind: 'svg',
    fileName: file.name,
    rasterPages: [],
    vectorShapes: shapes,
    vectorBounds: boundsOf(shapes),
    warnings,
  };
}

/* --------------------------------------------------------------- helpers */

export function boundsOf(shapes: ImportedVectorShape[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  shapes.forEach(s =>
    s.points.forEach(p => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    })
  );
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return { minX, minY, maxX, maxY };
}

/** Scales + centers imported geometry into a canvas box, preserving aspect. */
export function fitShapesToBox(
  shapes: ImportedVectorShape[],
  box: { width: number; height: number; padding?: number }
): { shapes: ImportedVectorShape[]; scale: number } {
  const b = boundsOf(shapes);
  const pad = box.padding ?? 40;
  const w = b.maxX - b.minX || 1;
  const h = b.maxY - b.minY || 1;
  const scale = Math.min((box.width - pad * 2) / w, (box.height - pad * 2) / h);
  const offsetX = (box.width - w * scale) / 2 - b.minX * scale;
  const offsetY = (box.height - h * scale) / 2 - b.minY * scale;
  return {
    scale,
    shapes: shapes.map(s => ({
      ...s,
      points: s.points.map(p => ({ x: p.x * scale + offsetX, y: p.y * scale + offsetY })),
    })),
  };
}

/** Picks a likely site layer from a CAD/SVG layer name. */
export function guessSiteLayer(sourceLayer: string): string {
  const l = sourceLayer.toLowerCase();
  if (/prop|bound|lot|survey|parcel/.test(l)) return 'property';
  if (/house|resid|build|struct|slab|home/.test(l)) return 'building';
  if (/drive/.test(l)) return 'driveway';
  if (/patio|ac[-_ ]?pad|walk|conc/.test(l)) return 'patio';
  if (/pool|spa|water/.test(l)) return 'pool';
  if (/deck|paver|coping/.test(l)) return 'deck';
  if (/gravel|mulch|stone/.test(l)) return 'gravel';
  if (/fence|barrier|gate|cage|screen/.test(l)) return 'fence';
  if (/equip|pump|filter|heater/.test(l)) return 'equipment';
  return 'property';
}

export function detectImportKind(file: File): ImportKind | null {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return 'pdf';
  if (name.endsWith('.dxf')) return 'dxf';
  if (name.endsWith('.svg') || file.type === 'image/svg+xml') return 'svg';
  if (/\.(png|jpe?g|webp|gif|bmp)$/.test(name) || file.type.startsWith('image/')) return 'image';
  return null;
}

export async function importBlueprintFile(file: File): Promise<ImportedDrawing> {
  const kind = detectImportKind(file);
  if (!kind) {
    const name = file.name.toLowerCase();
    if (/\.(dwg|vwx|rvt|skp)$/.test(name)) {
      throw new Error(
        `${file.name.split('.').pop()?.toUpperCase()} is a closed binary CAD format. Export it as DXF, SVG or PDF from AutoCAD / Vectorworks and import that file — the geometry stays fully editable.`
      );
    }
    throw new Error('Unsupported file. Use PDF, JPG, PNG, DXF or SVG.');
  }
  if (kind === 'pdf') return importPdf(file);
  if (kind === 'image') return importImage(file);
  if (kind === 'dxf') return importDxf(file);
  return importSvg(file);
}
