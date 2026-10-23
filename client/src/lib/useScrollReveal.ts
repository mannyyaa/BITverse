import { useEffect, useRef, type RefObject } from "react";

/**
 * Scroll-reveal hook.
 *
 * Content is ALWAYS visible without JS (the CSS starts fully visible).
 * On first use this hook adds `.bv-anim-ready` to the <main class="bv-landing">
 * ancestor, which opts the page into the hide-then-reveal behaviour.
 *
 * If the IntersectionObserver fires successfully it adds `.bv-reveal--visible`.
 * A safety timeout (800 ms) adds the class regardless, so a failed or
 * throttled observer can never leave content permanently hidden.
 *
 * Respects prefers-reduced-motion: skips the hidden-start state entirely.
 */
export function useScrollReveal<T extends Element = HTMLDivElement>(
  threshold = 0.1,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Always make the element visible immediately for reduced-motion users.
    if (prefersReducedMotion) {
      el.classList.add("bv-reveal--visible");
      return;
    }

    // Opt the page into animation by marking the <main> ancestor.
    const landing = el.closest(".bv-landing");
    if (landing && !landing.classList.contains("bv-anim-ready")) {
      landing.classList.add("bv-anim-ready");
    }

    // Safety: guarantee visibility after 800 ms regardless of observer.
    const safetyId = window.setTimeout(() => {
      el.classList.add("bv-reveal--visible");
    }, 800);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.clearTimeout(safetyId);
          entry.target.classList.add("bv-reveal--visible");
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => {
      window.clearTimeout(safetyId);
      observer.disconnect();
    };
  }, [threshold]);

  return ref;
}
