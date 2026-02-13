import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MovieCard from "./MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface Movie {
  id: number;
  title: string;
  posterPath: string | null;
  year: string;
  rating?: number;
}

interface HorizontalShowcaseProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  onMovieClick?: (id: number) => void;
  isLoading?: boolean;
}

const HorizontalShowcase = ({
  title,
  subtitle,
  movies,
  onMovieClick,
  isLoading,
}: HorizontalShowcaseProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current || !trackRef.current || isLoading || movies.length === 0) return;
    if (window.innerWidth < 768) return;

    const track = trackRef.current;
    const scrollWidth = track.scrollWidth - track.clientWidth;

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 20%",
          end: () => `+=${scrollWidth}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion, isLoading, movies.length]);

  // On mobile or reduced motion, fall back to scrollable row
  if (prefersReducedMotion || typeof window !== "undefined" && window.innerWidth < 768) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </motion.div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {movies.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-40">
                <MovieCard {...movie} onClick={() => onMovieClick?.(movie.id)} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-12 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </motion.div>

        {isLoading ? (
          <div className="flex gap-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48">
                <Skeleton className="aspect-[2/3] rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div ref={trackRef} className="flex gap-6 will-change-transform">
            {movies.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-48">
                <MovieCard {...movie} onClick={() => onMovieClick?.(movie.id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HorizontalShowcase;
