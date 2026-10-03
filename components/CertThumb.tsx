'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Small clickable certificate thumbnail. Clicking opens a full-screen lightbox
 * with the full-size image. Closes on click, Esc, or the X button.
 *
 * The lightbox is portalled to <body>. It is position: fixed, and any ancestor
 * with a transform/filter/will-change creates a containing block that would
 * trap it inside that ancestor instead of covering the viewport — which is
 * exactly what happens once GSAP animates the section around it.
 */
export default function CertThumb({
  src,
  alt,
  title,
}: {
  src: string;
  alt: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  // Portals need a DOM target, which only exists after mount (not during SSR).
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const lightbox = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} certificate`}
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 cursor-zoom-out"
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full rounded-lg shadow-2xl object-contain cursor-default"
      />
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${title} certificate`}
        className="w-16 h-11 shrink-0 overflow-hidden rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] hover:border-gray-400 dark:hover:border-white/30 transition-colors cursor-zoom-in"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      </button>

      {open && mounted && createPortal(lightbox, document.body)}
    </>
  );
}
