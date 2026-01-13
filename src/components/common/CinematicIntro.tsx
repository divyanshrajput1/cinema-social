import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [phase, setPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => onComplete(), 2800),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
        >
          {/* Cinema curtain effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-background via-background to-background"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: phase >= 2 ? 0 : 1 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            style={{ transformOrigin: "top" }}
          />

          {/* Film projector light beam */}
          <motion.div
            className="absolute top-0 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: phase >= 1 ? [0, 0.3, 0] : 0,
              scale: phase >= 1 ? [0, 2, 3] : 0,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 50%)",
            }}
          />

          {/* 3D rotating logo container */}
          <div className="relative" style={{ perspective: "1000px" }}>
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 border-2 border-primary/30 rounded-full"
              initial={{ scale: 0, opacity: 0, rotateY: -180 }}
              animate={{ 
                scale: phase >= 1 ? 2.5 : 0, 
                opacity: phase >= 1 ? [0, 1, 0] : 0,
                rotateY: phase >= 1 ? 0 : -180,
              }}
              transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              style={{ width: 80, height: 80 }}
            />

            {/* Middle ring with 3D rotation */}
            <motion.div
              className="absolute inset-0 border border-primary/50 rounded-full"
              initial={{ scale: 0, opacity: 0, rotateX: 90 }}
              animate={{ 
                scale: phase >= 1 ? 1.8 : 0, 
                opacity: phase >= 1 ? 1 : 0,
                rotateX: phase >= 1 ? 0 : 90,
              }}
              transition={{ duration: 1, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              style={{ width: 80, height: 80 }}
            />

            {/* Main logo with 3D flip */}
            <motion.div
              className="relative z-10 w-20 h-20 flex items-center justify-center"
              initial={{ 
                scale: 0, 
                rotateY: -180,
                rotateX: 45,
              }}
              animate={{ 
                scale: phase >= 1 ? 1 : 0,
                rotateY: phase >= 1 ? 0 : -180,
                rotateX: phase >= 1 ? 0 : 45,
              }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <motion.div
                className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/30"
                animate={{
                  boxShadow: phase >= 1 
                    ? ["0 0 0px hsl(var(--primary) / 0)", "0 0 40px hsl(var(--primary) / 0.5)", "0 0 20px hsl(var(--primary) / 0.3)"]
                    : "0 0 0px hsl(var(--primary) / 0)",
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <Film className="w-8 h-8 text-primary" />
              </motion.div>
            </motion.div>

            {/* Particle burst */}
            {phase >= 1 && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary rounded-full"
                    initial={{ 
                      x: 40, 
                      y: 40, 
                      scale: 0,
                      opacity: 1,
                    }}
                    animate={{ 
                      x: 40 + Math.cos((i * Math.PI * 2) / 8) * 100,
                      y: 40 + Math.sin((i * Math.PI * 2) / 8) * 100,
                      scale: [0, 1.5, 0],
                      opacity: [1, 1, 0],
                    }}
                    transition={{ 
                      duration: 1,
                      delay: 0.3 + i * 0.05,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Title with 3D reveal */}
          <motion.div
            className="absolute bottom-1/3 left-1/2 -translate-x-1/2"
            style={{ perspective: "600px" }}
          >
            <motion.h1
              className="font-display text-4xl md:text-5xl font-bold text-foreground whitespace-nowrap"
              initial={{ 
                opacity: 0, 
                rotateX: -90,
                y: 50,
              }}
              animate={{ 
                opacity: phase >= 1 ? 1 : 0,
                rotateX: phase >= 1 ? 0 : -90,
                y: phase >= 1 ? 0 : 50,
              }}
              transition={{ 
                duration: 0.8, 
                delay: 0.5,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <span className="text-primary">Cine</span>vault
            </motion.h1>
          </motion.div>

          {/* Subtle film strip lines */}
          <div className="absolute inset-x-0 top-0 h-8 flex justify-between px-4 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-8 h-6 bg-muted/20 rounded-sm"
                initial={{ y: -30 }}
                animate={{ y: phase >= 1 ? 0 : -30 }}
                transition={{ delay: 0.1 + i * 0.02, duration: 0.4 }}
              />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-8 flex justify-between px-4 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-8 h-6 bg-muted/20 rounded-sm"
                initial={{ y: 30 }}
                animate={{ y: phase >= 1 ? 0 : 30 }}
                transition={{ delay: 0.1 + i * 0.02, duration: 0.4 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CinematicIntro;
