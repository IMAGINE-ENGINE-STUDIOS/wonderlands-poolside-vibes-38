
1) Rework zoom handler in `src/components/PoolBuilder.tsx` to a deterministic, non-accumulating model.
- Remove `wheelZoomAccumRef`-based accumulation.
- Use per-event normalized delta with hard clamp (`[-1, 1]`) and very small fixed step.
- Ignore tiny deltas with a deadzone to block jitter.

2) Add trackpad momentum and bounce protection.
- Track `lastWheelTime`, `lastWheelDirection`, and `momentumLockUntil` refs.
- Drop opposite-direction micro-events during momentum window (prevents “zoom back” effect).
- Apply max one zoom update per animation frame with strict cap per frame.

3) Split wheel vs pinch behavior for laptops.
- Detect pinch-like events (`ctrlKey === true` and/or very high-resolution wheel pattern).
- Use a separate lower sensitivity curve for pinch than wheel scroll.
- Clamp pinch step tighter than wheel step to prevent first-swipe jumps.

4) Anchor zoom to pointer position to remove perceived drift.
- Before zoom: compute world point under cursor.
- After zoom: adjust `panOffset` so the same world point stays under cursor.
- Keep existing min/max zoom bounds unchanged.

5) Stop browser-level gesture interference on canvas.
- Ensure wheel handling blocks page/parent scroll while cursor is over canvas (`preventDefault` + propagation guard).
- Keep `touchAction: 'none'` and confirm no parent scroll container re-captures the gesture.

6) Add user-tunable sensitivity constants (single source of truth).
- Define constants near zoom logic: `WHEEL_STEP`, `PINCH_STEP`, `ZOOM_DEADZONE`, `MOMENTUM_MS`, `MAX_FRAME_STEP`.
- Use these constants for desktop/tablet/phone behavior profiles without changing product visuals or card/quote styles.

7) Validate with focused QA pass.
- Test on laptop trackpad: slow two-finger zoom in/out, fast swipe, release momentum, direction change mid-gesture.
- Test mouse wheel behavior separately.
- Confirm no snap-back, no runaway zoom, and no page scrolling while interacting with canvas.
