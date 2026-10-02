'use client';

import { useEffect, useState } from 'react';

export interface AvatarImage {
  src: string;
  /** CSS object-position for this image (e.g. 'center 20%'). */
  position?: string;
}

/**
 * Profile avatar that auto-swaps between images every `intervalMs` with a
 * short pixel-glitch transition. Respects prefers-reduced-motion.
 */
export default function AvatarSwap({
  images,
  alt,
  intervalMs = 7000,
  className = '',
}: {
  images: AvatarImage[];
  alt: string;
  intervalMs?: number;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => {
      setGlitching(true);
      // switch at the middle of the glitch burst, then clear the effect
      window.setTimeout(() => setActive((i) => (i + 1) % images.length), 220);
      window.setTimeout(() => setGlitching(false), 620);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <div className={`relative overflow-hidden ${className} ${glitching ? 'avatar-glitch' : ''}`}>
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.src}
          src={img.src}
          alt={i === active ? alt : ''}
          aria-hidden={i === active ? undefined : true}
          style={{ objectPosition: img.position ?? 'center top' }}
          className={`absolute inset-0 h-full w-full object-cover ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}
    </div>
  );
}
