import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface ShimmerButtonProps extends ButtonProps {
  children: ReactNode;
  shimmer?: boolean;
}

export const ShimmerButton = ({
  children,
  shimmer = true,
  className,
  ...props
}: ShimmerButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative inline-block"
    >
      <Button
        className={cn(
          "relative overflow-hidden",
          shimmer && "group",
          className
        )}
        {...props}
      >
        {shimmer && (
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />
        )}
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  );
};

export default ShimmerButton;
