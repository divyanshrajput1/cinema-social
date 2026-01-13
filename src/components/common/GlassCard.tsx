import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export const GlassCard = ({
  children,
  className,
  hover = true,
  delay = 0,
}: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.23, 1, 0.32, 1],
      }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-card/60 backdrop-blur-xl",
        "border border-border/50",
        "shadow-lg",
        hover && "transition-shadow duration-300 hover:shadow-xl",
        className
      )}
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:translate-x-full group-hover:opacity-100 transition-all duration-700" />
      
      {/* Gradient glow on top edge */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default GlassCard;
