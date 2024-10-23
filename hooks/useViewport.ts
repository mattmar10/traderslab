import { useEffect, useState } from "react";

const useViewport = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 1024); // matches Tailwind's lg breakpoint
    };

    // Initial check
    checkViewport();

    // Add listener
    window.addEventListener("resize", checkViewport);

    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  return { isMobile };
};

export default useViewport;
