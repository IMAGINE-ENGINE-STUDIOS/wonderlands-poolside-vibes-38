// A scoped theming shell for the licensing gallery.
//
// Writes a palette's semantic tokens and a typeface pair onto one container, so
// every widget mounted inside re-themes without touching component code. The
// tokens are the same ones declared in src/index.css, which is why nothing in
// the tree needs to know it is being skinned.
import * as React from "react";
import { skinVars, type WidgetSkin } from "@/lib/tools/widgetSkins";

interface Props {
  skin: WidgetSkin;
  className?: string;
  children: React.ReactNode;
}

const WidgetSkinScope: React.FC<Props> = ({ skin, className, children }) => (
  <div
    data-wl-skin={`${skin.paletteId}-${skin.typefaceId}`}
    style={skinVars(skin)}
    className={`wl-skin bg-background text-foreground transition-colors duration-500 ${className ?? ""}`}
  >
    <style>{`
      [data-wl-skin] { font-family: var(--wl-font-body); }
      [data-wl-skin] .font-serif,
      [data-wl-skin] h1, [data-wl-skin] h2, [data-wl-skin] h3 { font-family: var(--wl-font-display); }
      [data-wl-skin] .font-mono { font-family: var(--wl-font-mono); }
    `}</style>
    {children}
  </div>
);

export default WidgetSkinScope;
