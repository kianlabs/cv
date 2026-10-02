'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface AvatarImage {
  src: string;
  /** CSS object-position for this image (e.g. 'center 20%'). */
  position?: string;
}

const CELLS = 12; // 12x12 grid, same as renlenon

/**
 * Pixelated image card, modelled on renlenon.vercel.app: a random grid of
 * white pixels flashes over the image, the image swaps while it is covered,
 * then the pixels flash away. Triggered by hover/focus (desktop) or tap
 * (touch), and also auto-cycles on a timer. Pure CSS transitions, no GSAP.
 */
export default function AvatarSwap({
  images,
  alt,
  autoSwapMs = 12000,
  className = '',
}: {
  images: AvatarImage[];
  alt: string;
  autoSwapMs?: number;
  className?: string;
}) {
  const [active, setActive] = useState(0); // which image is showing
  const [covered, setCovered] = useState(false); // pixels visible
  const [isTouch, setIsTouch] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const trigger = useCallback(() => {
    if (busy.current || images.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive((i) => (i + 1) % images.length);
      return;
    }
    busy.current = true;
    setCovered(true); // pixels flash on (random stagger via inline delay)
    // Mask fully opaque at ~0.45s stagger + 0.2s fade = ~0.65s; swap after that.
    window.setTimeout(() => setActive((i) => (i + 1) % images.length), 700);
    window.setTimeout(() => setCovered(false), 950); // pixels flash off
    window.setTimeout(() => {
      busy.current = false;
    }, 1400);
  }, [images.length]);

  // Auto-cycle so it animates even without hover (and on touch devices).
  useEffect(() => {
    if (images.length < 2 || autoSwapMs <= 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(trigger, autoSwapMs);
    return () => window.clearInterval(id);
  }, [images.length, autoSwapMs, trigger]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={isTouch ? undefined : trigger}
      onFocus={isTouch ? undefined : trigger}
      onClick={isTouch ? trigger : undefined}
      role={isTouch ? 'button' : undefined}
      tabIndex={0}
      aria-label={alt}
    >
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

      {/* Pixel overlay: random white squares that flash to mask the swap. */}
      <div className="pointer-events-none absolute inset-0 z-[3]">
        {Array.from({ length: CELLS * CELLS }).map((_, i) => (
          <span
            key={i}
            className="absolute bg-white transition-opacity duration-200 ease-out"
            style={{
              width: `${100 / CELLS}%`,
              height: `${100 / CELLS}%`,
              left: `${(i % CELLS) * (100 / CELLS)}%`,
              top: `${Math.floor(i / CELLS) * (100 / CELLS)}%`,
              opacity: covered ? 1 : 0,
              transitionDelay: covered ? `${(Math.random() * 0.45).toFixed(3)}s` : '0s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
