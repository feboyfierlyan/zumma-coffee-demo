import { useEffect, useState } from 'react';

/*
 * Shared motion language for the Zumma QR menu.
 * Golden rule: only animate transform / opacity / clip-path.
 */

// Easing curves (cubic-bezier control points)
export const EASE = {
  smoothOut: [0.16, 1, 0.3, 1],
  spring: [0.34, 1.56, 0.64, 1],
  snappy: [0.25, 0.46, 0.45, 0.94],
  swift: [0.4, 0, 0.2, 1],
};

// CSS string variants for inline transitions
export const EASE_CSS = {
  smoothOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  snappy: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  swift: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

// Duration guide (seconds)
export const DUR = {
  tap: 0.1,
  micro: 0.18,
  component: 0.3,
  sheet: 0.4,
  page: 0.45,
  celebrate: 0.8,
};

// Framer Motion spring presets
export const SPRING = {
  soft: { type: 'spring', stiffness: 300, damping: 30 },
  pop: { type: 'spring', stiffness: 500, damping: 18 },
  bar: { type: 'spring', stiffness: 400, damping: 28 },
};

// Tap feedback for interactive elements
export const TAP = { scale: 0.94 };

/**
 * Detect whether decorative motion should be suppressed.
 * True when the user prefers reduced motion OR the device is low-memory.
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  const lowMemory = typeof navigator !== 'undefined' && navigator.deviceMemory && navigator.deviceMemory < 4;
  return Boolean((mq && mq.matches) || lowMemory);
}

/**
 * React hook variant that stays in sync with the media query.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(prefersReducedMotion());
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  return reduced;
}
