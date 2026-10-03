'use client';

/**
 * The navbar logo, doubling as a "back to top" control.
 *
 * A plain `#top` anchor does not work here: the header is `position: sticky`,
 * so the browser treats the target as already on-screen and never scrolls.
 * Scrolling programmatically is reliable regardless of the sticky layout.
 */
export default function BackToTop({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="shrink-0 font-bold text-[15px] sm:text-[17px] tracking-wider text-gray-900 dark:text-white transition-opacity hover:opacity-70"
    >
      {children}
    </button>
  );
}
