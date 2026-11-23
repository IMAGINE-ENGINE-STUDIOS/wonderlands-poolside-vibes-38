import * as React from "react";
import { saunas } from "@/data/saunaData";
import {
  arUrlForModel,
  complementsFromSelections,
  selectionsFromSuiteExtras,
  fetchSaunaPack,
  generateSaunaPlacement,
  modelSizeLine,
  placementGroupsForDisplay,
  placementImageSize,
  placementScaleEstimated,
  placementUploadToken,
  renderCleanPhotoBlob,
  renderMarkedPhotoBlob,
  tapPctFromEvent,
  uploadPlacementPhoto,
  DEFAULT_BASE_SELECTION,
  type PackModel,
  type PackOptionGroup,
  type PlacementBaseSelection,
  type PlacementResult,
  type PlacementTap,
  type SaunaPack,
} from "@/lib/sauna/saunaPlacement";

/**
 * Sauna Placement Tool — the in home placement flow as one component.
 *
 * Two homes (founder, 2026-11-22): inside the Sauna Suite, bound to
 * the model the customer is configuring there (embedded — no second
 * picker), and on its own page at /suites/saunas/place (standalone,
 * with the model picker). Same flow either way: add what goes with
 * the sauna, choose the base it sits on, take a photo of the space,
 * tap the exact spot, and Genius composes the picture at the model's
 * true dimensions.
 *
 * The option set is the pack's full set: the groups that can show in
 * the picture first, then the rest — interior fittings and personal
 * items that go with the sauna but never show. Those ride the
 * generation request too and come back listed as not visible, which
 * the result presents as such. Nothing in the pack is dropped.
 *
 * Every failure lands in a state that still offers the catalogue
 * photo, the manufacturer's own 3D page when the model has one, and a
 * way to try again. Mobile first: one column, big tap targets.
 */

const PRICE_BY_ID = new Map(saunas.map((s) => [s.id, s.price]));

const money = (n: number): string => `$${n.toLocaleString("en-US")}`;

/** Short plain labels for the base surfaces, by contract id. */
const BASE_LABELS: Record<string, string> = {
  existing: "Existing ground",
  grass: "Grass",
  pebbles: "Pebbles",
  "belgard-pavers": "Belgard pavers",
  "concrete-pad": "Concrete pad",
  "wood-deck": "Wood deck",
};
const baseLabel = (id: string): string => BASE_LABELS[id] ?? id;

/** Door and window choices are prompt level fidelity: label them requested. */
const isRequestedChoice = (entry: string): boolean =>
  entry.startsWith("Door Upgrade") || entry.startsWith("Window Upgrade");

type Phase = "edit" | "generating" | "result" | "error";

interface PhotoState {
  file: File;
  url: string;
  naturalW: number;
  naturalH: number;
}

const chipClass = (selected: boolean): string =>
  `min-h-[44px] rounded-full border px-4 py-2 text-sm ${
    selected
      ? "border-neutral-900 bg-neutral-900 text-white"
      : "border-neutral-300 bg-white text-neutral-800"
  }`;

export interface SaunaPlacementToolProps {
  /**
   * Controlled model (embedded use): the tool always works on this
   * model and shows no picker. Omit for the standalone page, where
   * the tool keeps its own selection seeded by initialModelId.
   */
  modelId?: string | null;
  /** Standalone only: the model to open already chosen, once the pack resolves it. */
  initialModelId?: string | null;
  /** Inside the Sauna Suite: fluid width, section heading, no picker. */
  embedded?: boolean;
  /**
   * Embedded only: the suite configurator's current extras record.
   * The section starts from that configuration (strategy §2.4): each
   * suite selection the pack carries seeds the matching placement
   * choice, and later changes above are followed group by group —
   * choices the customer edits here for other groups are left alone.
   */
  initialFromExtras?: Record<string, unknown>;
}

const SaunaPlacementTool: React.FC<SaunaPlacementToolProps> = ({
  modelId: controlledModelId,
  initialModelId,
  embedded = false,
  initialFromExtras,
}) => {
  const [pack, setPack] = React.useState<SaunaPack | null>(null);
  const [packError, setPackError] = React.useState<string | null>(null);
  const [pickedModelId, setPickedModelId] = React.useState<string | null>(null);
  const requestedAppliedRef = React.useRef(false);
  const [selections, setSelections] = React.useState<Record<string, string>>({});
  const [toggles, setToggles] = React.useState<Record<string, boolean>>({});
  const [base, setBase] =
    React.useState<PlacementBaseSelection>(DEFAULT_BASE_SELECTION);
  const [photo, setPhoto] = React.useState<PhotoState | null>(null);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const [tap, setTap] = React.useState<PlacementTap | null>(null);
  const [phase, setPhase] = React.useState<Phase>("edit");
  const [result, setResult] = React.useState<PlacementResult | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string>("");

  const cameraRef = React.useRef<HTMLInputElement>(null);
  const libraryRef = React.useRef<HTMLInputElement>(null);
  const topRef = React.useRef<HTMLDivElement>(null);

  const controlled = controlledModelId !== undefined;
  const modelId = controlled ? controlledModelId : pickedModelId;

  const loadPack = React.useCallback(async () => {
    setPackError(null);
    try {
      setPack(await fetchSaunaPack());
    } catch (err) {
      setPackError(
        err instanceof Error
          ? err.message
          : "The sauna catalogue could not be loaded.",
      );
    }
  }, []);

  React.useEffect(() => {
    void loadPack();
  }, [loadPack]);

  /* Carry-over from the suite configurator (strategy §2.4): seed the
   * section from the configuration above, then follow later changes
   * group by group. Only groups whose suite value changed since the
   * last seed are re-applied, so a choice the customer edits here
   * for another group is never clobbered. */
  const lastSeedRef = React.useRef<{
    selections: Record<string, string>;
    toggles: Record<string, boolean>;
  }>({ selections: {}, toggles: {} });
  React.useEffect(() => {
    if (!pack || !initialFromExtras) return;
    const derived = selectionsFromSuiteExtras(
      pack.optionGroups,
      initialFromExtras,
    );
    const last = lastSeedRef.current;
    const selDelta = new Map<string, string | undefined>();
    const togDelta = new Map<string, boolean | undefined>();
    for (const g of pack.optionGroups) {
      if (g.type === "selection") {
        if (derived.selections[g.id] !== last.selections[g.id]) {
          selDelta.set(g.id, derived.selections[g.id]);
        }
      } else if (derived.toggles[g.id] !== last.toggles[g.id]) {
        togDelta.set(g.id, derived.toggles[g.id]);
      }
    }
    if (selDelta.size) {
      setSelections((prev) => {
        const next = { ...prev };
        for (const [id, value] of selDelta) {
          if (value === undefined) delete next[id];
          else next[id] = value;
        }
        return next;
      });
    }
    if (togDelta.size) {
      setToggles((prev) => {
        const next = { ...prev };
        for (const [id, value] of togDelta) {
          if (value === undefined) delete next[id];
          else next[id] = value;
        }
        return next;
      });
    }
    lastSeedRef.current = derived;
  }, [pack, initialFromExtras]);

  /* Standalone in-context entry: apply the requested model once the
   * pack can resolve it. The ref keeps a later manual change from
   * ever being overridden. (Embedded use is controlled instead.) */
  React.useEffect(() => {
    if (controlled || !pack || !initialModelId || requestedAppliedRef.current)
      return;
    if (pack.models.some((m) => m.id === initialModelId)) {
      requestedAppliedRef.current = true;
      setPickedModelId(initialModelId);
    }
  }, [controlled, pack, initialModelId]);

  React.useEffect(() => {
    if (phase === "result" || phase === "error") {
      topRef.current?.scrollIntoView({ block: "start" });
    }
  }, [phase]);

  const model: PackModel | null = React.useMemo(
    () => pack?.models.find((m) => m.id === modelId) ?? null,
    [pack, modelId],
  );
  const { visible: visibleGroups, rest: restGroups } = React.useMemo(
    () =>
      pack
        ? placementGroupsForDisplay(pack)
        : { visible: [] as PackOptionGroup[], rest: [] as PackOptionGroup[] },
    [pack],
  );
  const allGroups = React.useMemo(
    () => [...visibleGroups, ...restGroups],
    [visibleGroups, restGroups],
  );
  const arUrl =
    result?.meta.threeDUrl ?? (pack && modelId ? arUrlForModel(pack, modelId) : null);
  const ready = Boolean(model && photo && tap);

  const onPhotoFile = (file: File | undefined) => {
    if (!file) return;
    setPhotoError(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setPhoto((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { file, url, naturalW: img.naturalWidth, naturalH: img.naturalHeight };
      });
      setTap(null);
      setResult(null);
      setPhase("edit");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setPhotoError("That photo could not be read. Please pick another photo.");
    };
    img.src = url;
  };

  const onTapPhoto = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTap(
      tapPctFromEvent(e.clientX, e.clientY, {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }),
    );
  };

  const runGenerate = async () => {
    if (!model || !photo || !tap) return;
    setPhase("generating");
    try {
      const token = placementUploadToken();
      const cleanBlob = await renderCleanPhotoBlob(photo.file);
      const markedBlob = await renderMarkedPhotoBlob(photo.file, tap);
      const photoUrl = await uploadPlacementPhoto(cleanBlob, token, "photo.jpg");
      const markedPhotoUrl = await uploadPlacementPhoto(
        markedBlob,
        token,
        "marked.jpg",
      );
      const size = placementImageSize(photo.naturalW, photo.naturalH);
      const res = await generateSaunaPlacement(
        {
          photoUrl,
          markedPhotoUrl,
          tapPct: tap,
          modelId: model.id,
          referencePhotos: model.referencePhotos,
          dimensionsText: modelSizeLine(model),
          complements: complementsFromSelections(allGroups, selections, toggles),
          base,
        },
        size,
      );
      setResult(res);
      setPhase("result");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "The picture could not be made.",
      );
      setPhase("error");
    }
  };

  const wrapClass = embedded
    ? "w-full"
    : "mx-auto w-full max-w-xl px-4 py-8";
  const Title = embedded ? "h2" : "h1";

  const renderGroup = (g: PackOptionGroup) => (
    <div key={g.id}>
      <p className="text-sm font-medium">{g.label}</p>
      {g.visualEffect ? (
        <p className="mt-0.5 text-xs text-neutral-600">{g.visualEffect}</p>
      ) : null}
      {g.type === "selection" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {g.choices.map((choice) => {
            const selected = selections[g.id] === choice;
            return (
              <button
                key={choice}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  setSelections((prev) => ({
                    ...prev,
                    [g.id]: selected ? "" : choice,
                  }))
                }
                className={chipClass(selected)}
              >
                {choice}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-2">
          <button
            type="button"
            aria-pressed={Boolean(toggles[g.id])}
            onClick={() =>
              setToggles((prev) => ({ ...prev, [g.id]: !prev[g.id] }))
            }
            className={chipClass(Boolean(toggles[g.id]))}
          >
            {toggles[g.id] ? "Added" : "Add"} {g.label.toLowerCase()}
          </button>
        </div>
      )}
    </div>
  );

  /* ---------------- pack loading and failure ---------------- */
  if (!pack) {
    return (
      <div className={wrapClass}>
        <Title className="text-2xl font-semibold">See a sauna in your space</Title>
        {packError ? (
          <div className="mt-6 rounded-2xl border border-neutral-200 p-5">
            <p className="text-base">{packError}</p>
            <p className="mt-2 text-sm text-neutral-600">
              Check the connection and try again. The sauna suite still has
              every model with its photos and sizes.
            </p>
            <button
              type="button"
              onClick={() => void loadPack()}
              className="mt-4 min-h-[48px] w-full rounded-2xl bg-neutral-900 px-4 py-3 font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <p className="mt-6 text-base text-neutral-600">
            Loading the sauna catalogue.
          </p>
        )}
      </div>
    );
  }

  /* ---------------- generating ---------------- */
  if (phase === "generating") {
    return (
      <div className={wrapClass} ref={topRef}>
        <Title className="text-2xl font-semibold">Building your picture</Title>
        <p className="mt-3 text-base text-neutral-600">
          Placing the {model?.name} where you tapped, at its true size. This
          usually takes about half a minute: the picture is checked against
          the sauna's own catalogue photo before you see it, so what you get
          is the sauna you chose.
        </p>
        {model?.heroPhoto ? (
          <img
            src={model.heroPhoto}
            alt={model.name}
            className="mt-6 w-full rounded-2xl"
          />
        ) : null}
      </div>
    );
  }

  /* ---------------- result ---------------- */
  if (phase === "result" && result && model && !result.meta.cannotRender) {
    const meta = result.meta;
    const scaleEstimated = placementScaleEstimated(model, meta);
    const sizeUsed = meta.officialDimensions ?? meta.footprintUsed;
    return (
      <div className={wrapClass} ref={topRef}>
        <Title className="text-2xl font-semibold">Your sauna, in place</Title>
        <img
          src={result.imageUrl}
          alt={`${model.name} placed in your space`}
          className="mt-4 w-full rounded-2xl"
        />
        <div className="mt-4 space-y-2 rounded-2xl border border-neutral-200 p-4 text-sm">
          {/* The placed sauna's identity, beside its own catalogue
              photo: a mismatch is obvious before it is believed. */}
          <div className="flex items-center gap-3">
            {meta.modelHeroPhoto || model.heroPhoto ? (
              <img
                src={meta.modelHeroPhoto ?? model.heroPhoto ?? ""}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
            ) : null}
            <p>
              <span className="font-medium">Your sauna: {model.name}</span>
              {meta.modelForm ? (
                <span className="block text-neutral-600">{meta.modelForm}</span>
              ) : null}
            </p>
          </div>
          {meta.fidelityVerdict === "verified" ? (
            <p>
              Checked against its catalogue photo
              {meta.fidelitySeenForm || meta.fidelitySeenFinish
                ? `: ${[meta.fidelitySeenForm, meta.fidelitySeenFinish]
                    .filter(Boolean)
                    .join(", ")}`
                : ""}
              .
            </p>
          ) : null}
          {sizeUsed ? <p>Size used: {sizeUsed}</p> : null}
          {meta.heightFt != null ? (
            <p>Height: {Number(meta.heightFt.toFixed(2))} ft</p>
          ) : null}
          {scaleEstimated ? (
            <p>The scale is estimated for this model.</p>
          ) : null}
          {meta.baseApplied ? (
            <p>
              Base: {baseLabel(meta.baseApplied.surface)}
              {meta.baseApplied.paverCollection
                ? `, ${meta.baseApplied.paverCollection}`
                : ""}
              {meta.baseApplied.lighting ? ", with ground lighting" : ""}
            </p>
          ) : null}
          {meta.appliedVisualOptions.length > 0 ? (
            <div>
              <p className="font-medium">In this picture</p>
              <ul className="list-disc pl-5">
                {meta.appliedVisualOptions.map((entry) => (
                  <li key={entry}>
                    {entry}
                    {isRequestedChoice(entry) ? " (requested)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {meta.excludedOptions.length > 0 ? (
            <div>
              <p className="font-medium">Not visible in this picture</p>
              <ul className="list-disc pl-5">
                {meta.excludedOptions.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {meta.warnings.length > 0 ? (
            <div className="text-neutral-600">
              {meta.warnings.map((w) => (
                <p key={w}>{w}</p>
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => void runGenerate()}
            className="min-h-[48px] w-full rounded-2xl bg-neutral-900 px-4 py-3 font-semibold text-white"
          >
            Generate again
          </button>
          <button
            type="button"
            onClick={() => setPhase("edit")}
            className="min-h-[48px] w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 font-semibold text-neutral-900"
          >
            Adjust the choices
          </button>
          {arUrl ? (
            <a
              href={arUrl}
              target="_blank"
              rel="noreferrer"
              className="block min-h-[48px] w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center font-semibold text-neutral-900"
            >
              See this sauna in 3D on the manufacturer's site
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  /* ------------- cannot render faithfully (founder ruling) -------------
   * The placed sauna must be the selected model or nothing: when the
   * generator reports it cannot render this model faithfully, the tool
   * says so plainly and shows the model's own catalogue photo instead
   * of a substituted picture. */
  if (phase === "result" && result && model && result.meta.cannotRender) {
    return (
      <div className={wrapClass} ref={topRef}>
        <Title className="text-2xl font-semibold">
          We cannot place this sauna faithfully yet
        </Title>
        <p className="mt-3 text-base">
          The {model.name} cannot be pictured true to its own shape and
          finish from the references we hold, so we will not show you a
          different sauna in its place.
        </p>
        {result.meta.cannotRenderReason ? (
          <p className="mt-2 text-sm text-neutral-600">
            {result.meta.cannotRenderReason}
          </p>
        ) : null}
        {result.meta.modelHeroPhoto || model.heroPhoto ? (
          <img
            src={result.meta.modelHeroPhoto ?? model.heroPhoto ?? ""}
            alt={model.name}
            className="mt-5 w-full rounded-2xl"
          />
        ) : null}
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => setPhase("edit")}
            className="min-h-[48px] w-full rounded-2xl bg-neutral-900 px-4 py-3 font-semibold text-white"
          >
            {embedded ? "Adjust the choices" : "Change sauna or photo"}
          </button>
          {arUrl ? (
            <a
              href={arUrl}
              target="_blank"
              rel="noreferrer"
              className="block min-h-[48px] w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center font-semibold text-neutral-900"
            >
              See this sauna in 3D on the manufacturer's site
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  /* ---------------- error (never a dead end) ---------------- */
  if (phase === "error" && model) {
    return (
      <div className={wrapClass} ref={topRef}>
        <Title className="text-2xl font-semibold">The picture did not come out</Title>
        <p className="mt-3 text-base">{errorMsg}</p>
        <p className="mt-2 text-sm text-neutral-600">
          Your choices are still here. Try once more, or look at the sauna on
          its catalogue photo for now.
        </p>
        {model.heroPhoto ? (
          <img
            src={model.heroPhoto}
            alt={model.name}
            className="mt-5 w-full rounded-2xl"
          />
        ) : null}
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={() => void runGenerate()}
            className="min-h-[48px] w-full rounded-2xl bg-neutral-900 px-4 py-3 font-semibold text-white"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => setPhase("edit")}
            className="min-h-[48px] w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 font-semibold text-neutral-900"
          >
            Change the choices
          </button>
          {arUrl ? (
            <a
              href={arUrl}
              target="_blank"
              rel="noreferrer"
              className="block min-h-[48px] w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center font-semibold text-neutral-900"
            >
              See this sauna in 3D on the manufacturer's site
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  /* ---------------- edit ---------------- */
  const stepBase = embedded ? 2 : 3;
  const stepPhoto = embedded ? 3 : 4;
  return (
    <div className={wrapClass} ref={topRef}>
      <Title className="text-2xl font-semibold">
        {embedded ? "See this sauna in your space" : "See a sauna in your space"}
      </Title>
      <p className="mt-2 text-base text-neutral-600">
        {embedded
          ? "Add what goes with it, take a photo of the space, and tap the spot where it should stand. The picture is built at the sauna's true size."
          : "Pick a sauna, add what goes with it, take a photo of the space, and tap the spot where it should stand. The picture is built at the sauna's true size."}
      </p>

      {embedded ? (
        model ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-neutral-200 p-3">
            {model.heroPhoto ? (
              <img
                src={model.heroPhoto}
                alt=""
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
              />
            ) : null}
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug">{model.name}</p>
              {modelSizeLine(model) ? (
                <p className="text-xs text-neutral-600">{modelSizeLine(model)}</p>
              ) : null}
              {PRICE_BY_ID.get(model.id) ? (
                <p className="text-sm font-semibold">
                  {money(PRICE_BY_ID.get(model.id) ?? 0)}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-600">
            Pick a sauna above and it opens here, ready to place.
          </p>
        )
      ) : (
        <>
          <h2 className="mt-8 text-lg font-semibold">1. Choose your sauna</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {pack.models.map((m) => {
              const selected = m.id === modelId;
              const price = PRICE_BY_ID.get(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPickedModelId(m.id)}
                  aria-pressed={selected}
                  className={`min-w-0 overflow-hidden rounded-2xl border text-left ${
                    selected
                      ? "border-neutral-900 ring-1 ring-neutral-900"
                      : "border-neutral-200"
                  }`}
                >
                  {m.heroPhoto ? (
                    <img
                      src={m.heroPhoto}
                      alt={m.name}
                      className="h-28 w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <span className="block p-3">
                    <span className="block text-sm font-medium leading-snug">
                      {m.name}
                    </span>
                    {modelSizeLine(m) ? (
                      <span className="mt-1 block text-xs text-neutral-600">
                        {modelSizeLine(m)}
                      </span>
                    ) : null}
                    {m.capacity ? (
                      <span className="block text-xs text-neutral-600">
                        {m.capacity}
                      </span>
                    ) : null}
                    {price ? (
                      <span className="mt-1 block text-sm font-semibold">
                        {money(price)}
                      </span>
                    ) : null}
                    {m.scaleEstimated ? (
                      <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                        Scale estimated
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <h2 className="mt-8 text-lg font-semibold">
        {embedded ? "1" : "2"}. Add what goes with it
      </h2>
      <div className="mt-3 space-y-5">{visibleGroups.map(renderGroup)}</div>

      {restGroups.length > 0 ? (
        <>
          <h3 className="mt-8 text-base font-semibold">
            More that goes with it
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Part of your sauna, fitted inside or kept with it. These do not
            show in the picture, and the picture will say so.
          </p>
          <div className="mt-3 space-y-5">{restGroups.map(renderGroup)}</div>
        </>
      ) : null}

      <h2 className="mt-8 text-lg font-semibold">
        {stepBase}. Choose what it sits on
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {pack.bases.map((b) => {
          const selected = base.surface === b.id;
          return (
            <button
              key={b.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setBase((prev) => ({ ...prev, surface: b.id }))}
              className={chipClass(selected)}
            >
              {baseLabel(b.id)}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={base.lighting}
          onClick={() =>
            setBase((prev) => ({ ...prev, lighting: !prev.lighting }))
          }
          className={chipClass(base.lighting)}
        >
          Ground lighting
        </button>
      </div>
      <p className="mt-2 text-xs text-neutral-600">
        Ground lighting rings the base with warm spotlights.
      </p>

      <h2 className="mt-8 text-lg font-semibold">{stepPhoto}. Photo of the space</h2>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          onPhotoFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onPhotoFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {!photo ? (
        <div className="mt-3 space-y-3">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="min-h-[52px] w-full rounded-2xl bg-neutral-900 px-4 py-3 font-semibold text-white"
          >
            Take a photo
          </button>
          <button
            type="button"
            onClick={() => libraryRef.current?.click()}
            className="min-h-[52px] w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 font-semibold text-neutral-900"
          >
            Choose a photo
          </button>
          {photoError ? (
            <p className="text-sm text-red-700">{photoError}</p>
          ) : null}
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-neutral-700">
            {tap
              ? "Tap again to move the marker."
              : "Tap the centre of the spot where the sauna should stand"}
          </p>
          <div
            className="relative mt-2 w-full cursor-pointer"
            onClick={onTapPhoto}
          >
            <img
              src={photo.url}
              alt="Your space"
              className="block w-full rounded-2xl"
            />
            {tap ? (
              <span
                className="pointer-events-none absolute block h-6 w-6 rounded-full border-[3px] border-white bg-red-600 shadow"
                style={{
                  left: `${tap.x * 100}%`,
                  top: `${tap.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(photo.url);
              setPhoto(null);
              setTap(null);
            }}
            className="mt-3 min-h-[44px] rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800"
          >
            Use a different photo
          </button>
        </div>
      )}

      <button
        type="button"
        disabled={!ready}
        onClick={() => void runGenerate()}
        className="mt-8 min-h-[52px] w-full rounded-2xl bg-neutral-900 px-4 py-3 text-base font-semibold text-white disabled:opacity-40"
      >
        Make the picture
      </button>
      {!ready ? (
        <p className="mt-2 text-center text-sm text-neutral-600">
          {embedded
            ? "Add a photo and tap the spot first."
            : "Choose a sauna, add a photo, and tap the spot first."}
        </p>
      ) : null}
      <p className="mt-6 text-xs text-neutral-500">
        Pictures are made by Wonderlands World Experience LLC with the
        sauna maker's own photos as the guide.
      </p>
    </div>
  );
};

export default SaunaPlacementTool;
