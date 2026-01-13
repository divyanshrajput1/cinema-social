import { ReactNode } from "react";
import { motion } from "framer-motion";
import { use3DCard } from "@/hooks/use3DCard";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  onClick?: () => void;
  delay?: number;
}

export const AnimatedCard = ({
  children,
  className,
  intensity = 12,
  onClick,
  delay = 0,
}: AnimatedCardProps) => {
  const { cardProps, glowStyle, isHovered } = use3DCard(intensity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={cn(
        "relative cursor-pointer will-change-transform",
        className
      )}
      onClick={onClick}
      {...cardProps}
    >
      {/* 3D Glow overlay */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none z-10"
        style={glowStyle}
      />
      
      {/* Shadow that responds to tilt */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg transition-all duration-300",
          isHovered ? "shadow-xl" : "shadow-md"
        )}
        style={{
          transform: isHovered ? "translateZ(-20px)" : "none",
        }}
      />
      
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
