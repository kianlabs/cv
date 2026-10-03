'use client';

import { useEffect, useRef, useState } from 'react';

/** Minimal shape of the View Transitions API we rely on. */
type ViewTransitionLike = {
  ready: Promise<void>;
  finished: Promise<void>;
  skipTransition: () => void;
};

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    const root = document.documentElement;

    const apply = () => {
      root.classList.toggle('dark', next);
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light');
      } catch {
        /* ignore */
      }
    };

    setDark(next);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startViewTransition = (
      document as Document & {
        startViewTransition?: (cb: () => void) => ViewTransitionLike;
      }
    ).startViewTransition;

    // No View Transitions support (Firefox today) or the user asked for less
    // motion: switch instantly, same as before.
    if (!startViewTransition || reduce) {
      apply();
      return;
    }

    // The new theme wipes in as a circle growing from the toggle button,
    // instead of the whole page hard-swapping colours.
    const transition = startViewTransition.call(document, apply);

    transition.ready
      .then(() => {
        const rect = buttonRef.current?.getBoundingClientRect();
        const cx = rect ? rect.left + rect.width / 2 : window.innerWidth - 28;
        const cy = rect ? rect.top + rect.height / 2 : 28;
        const radius = Math.hypot(
          Math.max(cx, window.innerWidth - cx),
          Math.max(cy, window.innerHeight - cy),
        );

        root.animate(
          {
            clipPath: [
              `circle(0px at ${cx}px ${cy}px)`,
              `circle(${radius}px at ${cx}px ${cy}px)`,
            ],
          },
          {
            duration: 560,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      })
      .catch(() => {
        /* transition was skipped — nothing to animate */
      });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
    >
      {/*
        Both icons stay in the DOM; the `.dark` class on <html> drives which one
        is visible, so the swap is a pure CSS crossfade (rotate + scale) rather
        than a hard mount/unmount. That also avoids any hydration mismatch.
      */}
      <span className="relative inline-block w-[18px] h-[18px]" aria-hidden="true">
        {/* sun — visible in dark mode (click to go light) */}
        <svg
          className="absolute inset-0 w-full h-full transition-all duration-500 ease-out rotate-90 scale-0 opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
        {/* moon — visible in light mode (click to go dark) */}
        <svg
          className="absolute inset-0 w-full h-full transition-all duration-500 ease-out rotate-0 scale-100 opacity-100 dark:-rotate-90 dark:scale-0 dark:opacity-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  );
}
