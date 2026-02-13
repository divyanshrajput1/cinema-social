import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Adds a subtle easing feel to native scroll using GSAP ScrollSmoother-lite approach.
 * Does NOT hijack scroll — just smooths ScrollTrigger scrub calculations.
 */
export const useGSAPSmoothScroll = () => {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 768) return;

    // Configure ScrollTrigger defaults for smoother feel
    ScrollTrigger.defaults({
      toggleActions: "play none none none",
    });

    // Refresh on resize
    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.killAll();
    };
  }, [prefersReducedMotion]);
};

export default useGSAPSmoothScroll;
