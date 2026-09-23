'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type PerfMode = 'auto' | 'high' | 'low';

interface PerfContextType {
  mode: PerfMode;
  low: boolean;
  setMode: (mode: PerfMode) => void;
}

const PerfContext = createContext<PerfContextType | undefined>(undefined);

export function usePerf(): PerfContextType {
  const ctx = useContext(PerfContext);
  if (!ctx) throw new Error('usePerf must be used within PerfProvider');
  return ctx;
}

function detectLowEnd(): boolean {
  try {
    if (typeof navigator === 'undefined') return false;
    const cores = navigator.hardwareConcurrency || 8;
    const mem = (navigator as any).deviceMemory || 8;
    const saveData = !!(navigator as any).connection?.saveData;
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return cores <= 4 || mem <= 4 || saveData || reduced;
  } catch {
    return false;
  }
}

const KEY = 'zingo-perf';

export function PerfProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<PerfMode>('auto');
  const [low, setLow] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as PerfMode | null;
      if (saved === 'high' || saved === 'low' || saved === 'auto') {
        setModeState(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const effective = mode === 'low' || (mode === 'auto' && detectLowEnd());
    setLow(effective);
    try {
      if (effective) {
        document.documentElement.dataset.perf = 'low';
      } else {
        delete document.documentElement.dataset.perf;
      }
    } catch {}
  }, [mode]);

  const setMode = useCallback((m: PerfMode) => {
    setModeState(m);
    try {
      localStorage.setItem(KEY, m);
    } catch {}
  }, []);

  return <PerfContext.Provider value={{ mode, low, setMode }}>{children}</PerfContext.Provider>;
}
