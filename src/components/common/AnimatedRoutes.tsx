import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load pages for better performance
import Index from "@/pages/Index";
import Films from "@/pages/Films";
import FilmDetail from "@/pages/FilmDetail";
import TVShows from "@/pages/TVShows";
import TVDetail from "@/pages/TVDetail";
import PersonDetail from "@/pages/PersonDetail";
import WikipediaView from "@/pages/WikipediaView";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Watchlist from "@/pages/Watchlist";
import Diary from "@/pages/Diary";
import Reviews from "@/pages/Reviews";
import NotFound from "@/pages/NotFound";

const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const reducedTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? reducedTransition : pageTransition;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
        <Route path="/films" element={<PageWrapper><Films /></PageWrapper>} />
        <Route path="/film/:id" element={<PageWrapper><FilmDetail /></PageWrapper>} />
        <Route path="/tv" element={<PageWrapper><TVShows /></PageWrapper>} />
        <Route path="/tv/:id" element={<PageWrapper><TVDetail /></PageWrapper>} />
        <Route path="/person/:id" element={<PageWrapper><PersonDetail /></PageWrapper>} />
        <Route path="/wikipedia" element={<PageWrapper><WikipediaView /></PageWrapper>} />
        <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/watchlist" element={<PageWrapper><Watchlist /></PageWrapper>} />
        <Route path="/diary" element={<PageWrapper><Diary /></PageWrapper>} />
        <Route path="/reviews" element={<PageWrapper><Reviews /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
