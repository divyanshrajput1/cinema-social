import { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface CinematicHeroProps {
  children: ReactNode;
  backgroundImage?: string;
  className?: string;
}

export const CinematicHero = ({
  children,
  backgroundImage,
  className,
}: CinematicHeroProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax and fade effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.2]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], ["0%", "10%"]);

  if (prefersReducedMotion) {
    return (
      <section ref={ref} className={cn("relative min-h-[60vh] flex items-end", className)}>
        {backgroundImage && (
          <div className="absolute inset-0 -top-16 overflow-hidden">
            <img
              src={backgroundImage}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          </div>
        )}
        <div className="relative z-10 w-full">{children}</div>
      </section>
    );
  }

  return (
    <section ref={ref} className={cn("relative min-h-[60vh] flex items-end overflow-hidden", className)}>
      {/* Parallax Background */}
      {backgroundImage && (
        <motion.div
          className="absolute inset-0 -top-16 overflow-hidden"
          style={{ y: backgroundY }}
        >
          <motion.img
            src={backgroundImage}
            alt=""
            className="w-full h-[130%] object-cover will-change-transform"
            style={{ scale: backgroundScale }}
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          
          {/* Cinematic vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.3)_70%)]" />
        </motion.div>
      )}

      {/* Content with parallax */}
      <motion.div
        className="relative z-10 w-full"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CinematicHero;
