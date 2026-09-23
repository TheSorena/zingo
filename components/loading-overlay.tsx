'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowLoader(true);
    } else {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => setShowLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/85 backdrop-blur-md pointer-events-none"
        >
          <div className="flex flex-col items-center space-y-5">
            {/* Branded Logo Ring */}
            <div className="relative h-20 w-20">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-l from-amber-400 via-orange-500 to-rose-500 opacity-30 blur-md"
                animate={{ opacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, transparent 0%, hsl(var(--primary)) 15%, transparent 30%, transparent 55%, hsl(var(--accent)) 70%, transparent 85%)",
                  WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 3px))",
                  mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 3px))",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-2.5 rounded-full bg-background flex items-center justify-center overflow-hidden ring-1 ring-primary/30">
                <img
                  src="/zingo-logo.png"
                  alt="زینگو"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Loading Text */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center"
            >
              <p className="text-lg font-bold text-foreground">در حال بارگذاری...</p>
              <p className="text-xs text-muted-foreground mt-1">لطفاً صبر کنید</p>
            </motion.div>

            {/* Animated Dots */}
            <div dir="ltr" className="flex space-x-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-gradient-to-l from-amber-400 to-rose-500"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}