// components/GlobalLoader.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

type GlobalLoaderContextType = {
  isLoading: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
};

const GlobalLoaderContext = createContext<GlobalLoaderContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useGlobalLoader = () => useContext(GlobalLoaderContext);

/**
 * Top Progress Bar on Route Transitions
 */
function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, setNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Route change detected -> Trigger luxury progress glide
    setNavigating(true);
    setProgress(20);

    const step1 = setTimeout(() => setProgress(65), 120);
    const step2 = setTimeout(() => setProgress(90), 280);
    const finish = setTimeout(() => {
      setProgress(100);
      const close = setTimeout(() => {
        setNavigating(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(close);
    }, 450);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(finish);
    };
  }, [pathname, searchParams]);

  if (!navigating && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[3px] bg-transparent">
      <motion.div
        className="h-full bg-gradient-to-r from-gold-500 via-amber-300 to-gold-400 shadow-[0_0_14px_rgba(212,175,55,0.9)]"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ ease: "easeInOut", duration: 0.2 }}
      />
    </div>
  );
}

export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [initialProgress, setInitialProgress] = useState(15);
  const [isAsyncLoading, setIsAsyncLoading] = useState(false);
  const [asyncMessage, setAsyncMessage] = useState<string | null>(null);

  // Initial Fullscreen Splash Sequence (Runs on page load)
  useEffect(() => {
    // Progress fill animation
    const p1 = setTimeout(() => setInitialProgress(45), 180);
    const p2 = setTimeout(() => setInitialProgress(78), 420);
    const p3 = setTimeout(() => setInitialProgress(100), 720);
    const finish = setTimeout(() => {
      setIsInitialLoad(false);
    }, 950);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(finish);
    };
  }, []);

  // Listen to global window events for async data loading across components
  useEffect(() => {
    const handleStart = (e: any) => {
      setIsAsyncLoading(true);
      if (e?.detail?.message) setAsyncMessage(e.detail.message);
    };
    const handleStop = () => {
      setIsAsyncLoading(false);
      setAsyncMessage(null);
    };

    window.addEventListener("global-loading-start", handleStart);
    window.addEventListener("global-loading-stop", handleStop);

    return () => {
      window.removeEventListener("global-loading-start", handleStart);
      window.removeEventListener("global-loading-stop", handleStop);
    };
  }, []);

  const startLoading = useCallback((message?: string) => {
    setIsAsyncLoading(true);
    if (message) setAsyncMessage(message);
  }, []);

  const stopLoading = useCallback(() => {
    setIsAsyncLoading(false);
    setAsyncMessage(null);
  }, []);

  return (
    <GlobalLoaderContext.Provider
      value={{
        isLoading: isAsyncLoading || isInitialLoad,
        startLoading,
        stopLoading,
      }}
    >
      <Suspense fallback={null}>
        <RouteProgressBar />
      </Suspense>

      {/* 1. Initial Luxury Brand Splash Preloader */}
      <AnimatePresence>
        {isInitialLoad && (
          <motion.div
            key="maison-preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
            className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#070709] select-none pointer-events-auto"
          >
            {/* Background radial gold aura */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
              {/* Dual Orbital Golden Rings & Flacon Monogram */}
              <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                {/* Outer pulsing ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-gold/30 border-dashed"
                />

                {/* Inner counter-rotating ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-transparent border-t-gold border-b-gold/40 shadow-gold-glow"
                />

                {/* Golden Emblem Center */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-obsidian-900 via-obsidian-850 to-gold/20 border border-gold/60 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.35)]">
                  <span className="font-serif text-lg font-bold text-gold tracking-widest pl-0.5">
                    MC
                  </span>
                </div>

                {/* Sparkle badge */}
                <motion.div
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-1 -right-1 text-gold"
                >
                  <Sparkles size={16} />
                </motion.div>
              </div>

              {/* Brand Typography */}
              <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-[0.28em] text-ivory uppercase">
                Maison Charcoal
              </h1>
              <p className="mt-2 text-[10px] tracking-[0.35em] text-gold/80 uppercase font-sans font-medium">
                Haute Parfumerie
              </p>

              {/* High precision luxury progress bar */}
              <div className="w-48 h-[2px] bg-neutral-800/80 rounded-full mt-7 overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-600 via-gold to-amber-200 shadow-gold-glow"
                  initial={{ width: "0%" }}
                  animate={{ width: `${initialProgress}%` }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                />
              </div>

              <span className="text-[10px] text-neutral-500 font-mono tracking-wider mt-2.5">
                {initialProgress}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Non-blocking Floating Async Loading Indicator (when fetching data/cart) */}
      <AnimatePresence>
        {isAsyncLoading && !isInitialLoad && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-[9990] flex items-center gap-3 px-4 py-2.5 rounded-full bg-obsidian-900/90 border border-gold/40 shadow-2xl backdrop-blur-md pointer-events-none"
          >
            <div className="relative w-4 h-4 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 rounded-full border-2 border-transparent border-t-gold border-r-gold/60"
              />
            </div>
            <span className="text-xs font-serif text-ivory tracking-wider">
              {asyncMessage || "Updating Concierge..."}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </GlobalLoaderContext.Provider>
  );
}
