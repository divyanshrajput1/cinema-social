import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FilmGrainOverlayProps {
  opacity?: number;
}

export const FilmGrainOverlay = ({ opacity = 0.03 }: FilmGrainOverlayProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
};

export default FilmGrainOverlay;
