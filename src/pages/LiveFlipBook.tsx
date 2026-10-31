/**
 * The main-page FLIP book, standalone — the same FlipMagazine (v8) the
 * homepage hero renders: every collection and every product, already in
 * the book. This is the route the live stage loads when a host presents
 * the FLIP book or drops a product as its FLIP version.
 * Credits: Imagine Engine Studios Corp.
 */
import FlipMagazine from "@/components/flip/FlipMagazine";

export default function LiveFlipBook() {
  return (
    <div className="min-h-dvh bg-background">
      <FlipMagazine variant="v8" hideHeader />
    </div>
  );
}
