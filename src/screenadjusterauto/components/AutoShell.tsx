/**
 * screenadjusterauto / components
 * -------------------------------
 * Thin presentational wrappers so pages never hardcode max-widths again.
 *
 *  AutoShell   — page shell: fluid width + tier gutters.
 *  AutoSplit   — content + side-rail split that widens with the screen.
 *  AutoOverlay — centered overlay panel (search, dialogs).
 *  AutoBoard   — full tool overlay panel (drawing boards).
 *  AutoCardGrid— auto-fill card grid whose column count grows with width.
 */
import React from "react";
import { useScreenAdjuster } from "../hooks/useScreenAdjuster";

type Div = React.HTMLAttributes<HTMLDivElement>;

interface BaseProps extends Div {
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

function make(styleKey: "shellStyle" | "splitStyle" | "overlayStyle" | "boardStyle" | "cardGridStyle") {
  return function AutoBox({ as = "div", style, children, ...rest }: BaseProps) {
    const adjuster = useScreenAdjuster();
    const Tag = as as any;
    return (
      <Tag style={{ ...adjuster[styleKey], ...style }} {...rest}>
        {children}
      </Tag>
    );
  };
}

export const AutoShell = make("shellStyle");
export const AutoSplit = make("splitStyle");
export const AutoOverlay = make("overlayStyle");
export const AutoBoard = make("boardStyle");
export const AutoCardGrid = make("cardGridStyle");
