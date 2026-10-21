// components/Page3DTransition.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Page3DTransitionProps {
  children: React.ReactNode;
}

export function Page3DTransition({ children }: Page3DTransitionProps) {
  const pathname = usePathname();

  return (
    <div
      style={{
        perspective: "1200px",
      }}
      className="w-full flex-1 flex flex-col relative overflow-x-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{
            opacity: 0,
            y: 18,
            rotateX: 3.5,
            scale: 0.99,
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -12,
            rotateX: -2,
            scale: 0.995,
          }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform, opacity",
          }}
          className="w-full flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
