import { useEffect } from "react";

/**
 * useScrollReveal
 * Robust, dynamic scroll-reveal hook that ensures NO chunk or section
 * of the portfolio is ever stuck invisible.
 *
 * Features:
 * 1. IntersectionObserver with eager rootMargin (80px) and threshold: 0
 * 2. Instant bounding-box check for elements already in viewport
 * 3. MutationObserver to automatically observe dynamically mounted nodes (e.g. carousel slides)
 * 4. Window scroll / resize event listener fallbacks
 * 5. Safety timeout fallback that ensures all elements reveal cleanly
 * 6. Full support for prefers-reduced-motion
 */
export default function useScrollReveal() {
  useEffect(() => {
    // If user prefers reduced motion, reveal everything immediately
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealEl = (el) => {
      if (el && !el.hasAttribute("data-visible")) {
        el.setAttribute("data-visible", "true");
      }
    };

    if (prefersReducedMotion) {
      document.querySelectorAll("[data-reveal]").forEach(revealEl);
      return;
    }

    const isNearViewport = (el) => {
      if (!el || typeof el.getBoundingClientRect !== "function") return false;
      const rect = el.getBoundingClientRect();
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight || 800;
      // Triggers if element is within 120px above/below viewport
      return rect.top <= windowHeight + 120 && rect.bottom >= -120;
    };

    // 1. IntersectionObserver with generous margins
    let observer = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealEl(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0, rootMargin: "100px 0px 100px 0px" }
      );
    }

    const registerElements = () => {
      const elements = document.querySelectorAll(
        "[data-reveal]:not([data-visible='true'])"
      );

      elements.forEach((el) => {
        if (isNearViewport(el)) {
          revealEl(el);
        } else if (observer) {
          observer.observe(el);
        } else {
          revealEl(el);
        }
      });
    };

    // Initial check immediately on mount
    registerElements();

    // 2. MutationObserver: Catch any dynamically rendered chunk, card, or carousel change
    let mutationObserver = null;
    if (typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(() => {
        registerElements();
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // 3. Fallback on scroll and resize
    const handleScrollOrResize = () => {
      const unrevealed = document.querySelectorAll(
        "[data-reveal]:not([data-visible='true'])"
      );
      unrevealed.forEach((el) => {
        if (isNearViewport(el)) {
          revealEl(el);
          if (observer) observer.unobserve(el);
        }
      });
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    // 4. Safety Fail-Safe Timers:
    // Guarantee that no content remains trapped invisible regardless of browser state
    const t1 = setTimeout(handleScrollOrResize, 400);
    const t2 = setTimeout(handleScrollOrResize, 1200);
    const t3 = setTimeout(() => {
      // Final unconditional reveal for any remaining elements
      document.querySelectorAll("[data-reveal]").forEach(revealEl);
    }, 2800);

    return () => {
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);
}
