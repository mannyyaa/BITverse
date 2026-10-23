import { useEffect, useRef, type RefObject } from "react";

/**
 * Adds `bv-reveal--visible` to the target element once it enters the
 * viewport. The element must already have the `bv-reveal` class applied so
 * its initial hidden state is set in CSS (opacity 0, translateY).
 *
 * Respects `prefers-reduced-motion` — the CSS already handles that, but we
 * also skip the observer entirely so there are no layout side-effects.
 */
export function useScrollReveal<T extends Element = HTMLDivElement>(
  threshold = 0.12,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      el.classList.add("bv-reveal--visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("bv-reveal--visible");
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
