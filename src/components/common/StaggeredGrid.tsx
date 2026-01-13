import { ReactNode, Children } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface StaggeredGridProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const reducedMotionItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const StaggeredGrid = ({
  children,
  className,
  staggerDelay = 0.05,
}: StaggeredGridProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  const customContainerVariants = {
    ...containerVariants,
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={customContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={prefersReducedMotion ? reducedMotionItemVariants : itemVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StaggeredGrid;
