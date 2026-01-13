import { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  backgroundImage?: string;
  speed?: number;
  overlay?: boolean;
}

export const ParallaxSection = ({
  children,
  className,
  backgroundImage,
  speed = 0.3,
  overlay = true,
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {backgroundImage && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={backgroundImage}
              alt=""
              className="w-full h-full object-cover"
            />
            {overlay && (
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
            )}
          </div>
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {backgroundImage && (
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            src={backgroundImage}
            alt=""
            className="w-full h-[120%] object-cover will-change-transform"
            style={{ y, scale }}
          />
          {overlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          )}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default ParallaxSection;
