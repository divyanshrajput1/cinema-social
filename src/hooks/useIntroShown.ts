import { useState, useEffect } from "react";

export const useIntroShown = () => {
  const [hasShownIntro, setHasShownIntro] = useState(() => {
    // Check sessionStorage to avoid showing intro on every page refresh during session
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("cinevault-intro-shown") === "true";
    }
    return false;
  });

  const markIntroShown = () => {
    setHasShownIntro(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cinevault-intro-shown", "true");
    }
  };

  return { hasShownIntro, markIntroShown };
};

export default useIntroShown;
