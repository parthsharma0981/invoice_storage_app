import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter } from "react-router-dom";
import RoutesApp from "./pages/RoutesApp";
import { StoreProvider } from "./store/StoreContext";
import SplashScreen from "./components/SplashScreen";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Check if splash was already shown in this session
  useEffect(() => {
    const splashShown = sessionStorage.getItem("splashShown");
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem("splashShown", "true");
  }, []);

  // Trigger splash replay from anywhere (e.g., logo click)
  const triggerSplash = useCallback(() => {
    setShowSplash(true);
  }, []);

  // Expose trigger function globally for navbar to use
  useEffect(() => {
    window.triggerSplashAnimation = triggerSplash;
    return () => {
      delete window.triggerSplashAnimation;
    };
  }, [triggerSplash]);

  return (
    <StoreProvider>
      <BrowserRouter>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        <RoutesApp />
      </BrowserRouter>
    </StoreProvider>
  );
}