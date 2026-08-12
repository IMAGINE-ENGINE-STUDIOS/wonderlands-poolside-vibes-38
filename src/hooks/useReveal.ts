import * as React from "react";

/**
 * Lightweight scroll-reveal hook. One shared IntersectionObserver per element,
 * disconnected as soon as the element has been revealed (no ongoing cost).
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.18) {
  const ref = React.useRef<T | null>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [shown, threshold]);

  return { ref, shown } as const;
}

export default useReveal;
