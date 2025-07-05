import { useEffect, useState } from "react";
import logoPNG from "@/assets/images/Logo_BoxBox_BoxBox_64x64.png";
import logoWEBP from "@/assets/images/Logo_BoxBox_BoxBox_64x64.webp";
import logoPNGBig from "@/assets/images/Logo_BoxBox_BoxBox.png";
import logoWEBPBig from "@/assets/images/Logo_BoxBox_BoxBox.webp";

export function Logo() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    const handleLoad = () => {
      setIsPageLoaded(true);
    };

    // Check if page is already loaded
    if (document.readyState === "complete") {
      setIsPageLoaded(true);
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  if (isPageLoaded) {
    return (
      <picture>
        <source srcSet={logoWEBPBig} type="image/webp" />
        <img
          src={logoPNGBig}
          alt="BoxBox BoxBox Logo"
          className="h-10 w-auto"
          fetchPriority="high"
        />
      </picture>
    );
  }

  return (
    <picture>
      <source srcSet={logoWEBP} type="image/webp" />
      <img
        src={logoPNG}
        alt="BoxBox BoxBox Logo"
        className="h-10 w-auto"
        fetchPriority="high"
      />
    </picture>
  );
}
