/**
 * 2D Studio "Objects" widget — same panel, spot and layers as the 3D Studio.
 * Lists every piece drawn on the board (fences, screens, turf, decks) so it
 * can be hidden or moved between layers; IDs match the 3D board, so hiding a
 * piece here hides it in 3D too.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { SceneObjectsPanel, sceneObjectIcons, type SceneObjectGroup } from "@/components/scene3d/SceneObjectsPanel";
import { useSiteElements } from "./SiteElementsLayer";
import { boardObjectId } from "@/lib/design/sceneLayers";

const KIND = { fence: "fence", enclosure: "screen", turf: "surface", deck: "surface" } as const;
const LAYER = { fence: "fences", enclosure: "fences", turf: "landscape", deck: "deck" } as const;
const LABEL = { fence: "Fence", enclosure: "Screen", turf: "Turf", deck: "Deck" } as const;

export function BoardObjectsPanel() {
  const [items, setItems] = useSiteElements();
  const groups: SceneObjectGroup[] = React.useMemo(() => {
    const make = (kinds: Array<keyof typeof KIND>, key: string, label: string) => {
      const list = items.filter((e) => kinds.includes(e.kind as keyof typeof KIND));
      return {
        key, label,
        items: list.map((e, i) => ({
          id: boardObjectId(KIND[e.kind as keyof typeof KIND], e.id, i),
          label: `${LABEL[e.kind as keyof typeof LABEL]} ${i + 1}`,
          detail: e.label,
          icon: e.kind === "fence" || e.kind === "enclosure" ? sceneObjectIcons.fence : e.kind === "deck" ? sceneObjectIcons.deck : sceneObjectIcons.terrain,
          layer: LAYER[e.kind as keyof typeof LAYER],
          onDelete: () => setItems((p) => p.filter((x) => x.id !== e.id)),
        })),
      };
    };
    return [make(["fence", "enclosure"], "fences", "Fences & Screens"), make(["deck", "turf"], "surfaces", "Decks & Turf")].filter((g) => g.items.length);
  }, [items, setItems]);
  return <SceneObjectsPanel groups={groups} />;
}
