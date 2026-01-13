import { useState, useCallback, MouseEvent } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface CardTransform {
  rotateX: number;
  rotateY: number;
  scale: number;
  glowX: number;
  glowY: number;
}

const defaultTransform: CardTransform = {
  rotateX: 0,
  rotateY: 0,
  scale: 1,
  glowX: 50,
  glowY: 50,
};

export const use3DCard = (intensity: number = 15) => {
  const [transform, setTransform] = useState<CardTransform>(defaultTransform);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;

      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation (inverted for natural feel)
      const rotateX = ((y - centerY) / centerY) * -intensity;
      const rotateY = ((x - centerX) / centerX) * intensity;

      // Calculate glow position as percentage
      const glowX = (x / rect.width) * 100;
      const glowY = (y / rect.height) * 100;

      setTransform({
        rotateX,
        rotateY,
        scale: 1.02,
        glowX,
        glowY,
      });
    },
    [intensity, prefersReducedMotion]
  );

  const handleMouseEnter = useCallback(() => {
    if (prefersReducedMotion) return;
    setIsHovered(true);
  }, [prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTransform(defaultTransform);
  }, []);

  const cardStyle = prefersReducedMotion
    ? {}
    : {
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
        transition: isHovered
          ? "transform 0.1s ease-out"
          : "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
      };

  const glowStyle = prefersReducedMotion
    ? {}
    : {
        background: isHovered
          ? `radial-gradient(circle at ${transform.glowX}% ${transform.glowY}%, hsl(var(--primary) / 0.15) 0%, transparent 60%)`
          : "transparent",
        opacity: isHovered ? 1 : 0,
        transition: "opacity 0.3s ease-out",
      };

  return {
    cardProps: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      style: cardStyle,
    },
    glowStyle,
    isHovered,
    transform,
  };
};

export default use3DCard;
