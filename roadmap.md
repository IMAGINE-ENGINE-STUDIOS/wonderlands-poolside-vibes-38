# Roadmap

## In progress
- [ ] Architect curvature on the drawing boards — true arcs (typed radius in feet),
      tangent corner fillets, tensioned splines, draggable arc handles, numeric
      inspector. Math done in `src/lib/design/curvature.ts`; board integration next.
- [ ] Cropping tool with true overlap logic — pools, spas, tanning ledges cut the
      paver deck and artificial turf they sit on, so elements can overlap while
      areas and prices stay net.

## Done
- [x] Board tools moved into the sheet header (icon-only, mobile-friendly)
- [x] Shared 70 ft default board altitude tuned for pool + patio work
- [x] Global Design Board dossier aggregates every trade (estimate, take-off,
      specifications, process, project payment schedule)
