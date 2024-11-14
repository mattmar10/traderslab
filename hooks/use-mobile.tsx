import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Only access window during client-side execution
    if (typeof window !== "undefined") {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    return false;
  });

  useEffect(() => {
    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    const debouncedHandle = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkIsMobile, 200);
    };

    // Use matchMedia for better performance
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Modern event listener approach
    mql.addEventListener("change", debouncedHandle);

    // Initial check
    checkIsMobile();

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      mql.removeEventListener("change", debouncedHandle);
    };
  }, []);

  return isMobile;
}
