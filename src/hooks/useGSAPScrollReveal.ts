import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  y?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  scale?: number;
  once?: boolean;
}

export const useGSAPScrollReveal = <T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) => {
  const ref = useRef<T>(null);
  const prefersReducedMotion = useReducedMotion();

  const {
    y = 40,
    opacity = 0,
    duration = 0.6,
    delay = 0,
    stagger = 0,
    scale = 1,
    once = true,
  } = options;

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;

    // Disable on small screens for performance
    const isMobile = window.innerWidth < 768;
    if (isMobile && y > 30) return;

    const children = stagger > 0 ? ref.current.children : [ref.current];

    const ctx = gsap.context(() => {
      gsap.from(children, {
        y,
        opacity,
        scale,
        duration,
        delay,
        stagger,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          toggleActions: once ? "play none none none" : "play none none reverse",
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [prefersReducedMotion, y, opacity, duration, delay, stagger, scale, once]);

  return ref;
};

export const useGSAPParallax = <T extends HTMLElement>(speed: number = 0.3) => {
  const ref = useRef<T>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;
    if (window.innerWidth < 768) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        yPercent: -speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [prefersReducedMotion, speed]);

  return ref;
};

export const useGSAPZoom = <T extends HTMLElement>(maxScale: number = 1.05) => {
  const ref = useRef<T>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;
    if (window.innerWidth < 768) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { scale: 1 },
        {
          scale: maxScale,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [prefersReducedMotion, maxScale]);

  return ref;
};

export default useGSAPScrollReveal;
