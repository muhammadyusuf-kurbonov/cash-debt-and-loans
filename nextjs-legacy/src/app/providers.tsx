'use client';

import { animate } from 'framer-motion/dom';
import { TransitionRouter } from 'next-transition-router';
import { useRef } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null!);
  return (
    <TransitionRouter
      auto
      leave={(next) => {
        animate(
          wrapperRef.current,
          { opacity: [1, 0] },
          { duration: 0.2, onComplete: next }
        );
      }}
      enter={(next) => {
        animate(
          wrapperRef.current,
          { opacity: [0, 1] },
          { duration: 0.2, onComplete: next }
        );
      }}
    >
      <div ref={wrapperRef}>{children}</div>
    </TransitionRouter>
  );
}
