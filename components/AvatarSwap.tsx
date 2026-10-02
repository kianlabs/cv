'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface AvatarImage {
  src: string;
  /** CSS object-position for this image (e.g. 'center 20%'). */
  position?: string;
}

const CELLS = 12; // 12x12 grid, same as renlenon

// --- Timing (ms) — tuned so the image swap happens while fully masked ---
const COVER_MS = 150; // pixel fade-in duration
const COVER_STAGGER = 110; // max random delay while covering
const HOLD_MS = 90; // fully covered hold before the swap
const REVEAL_MS = 260; // pixel fade-out duration
const REVEAL_STAGGER = 70; // max random delay while revealing
const IMG_FADE_MS = 320; // image crossfade duration

const SWAP_AT = COVER_MS + COVER_STAGGER + HOLD_MS; // ~350ms — image swaps here
const DONE_AT = SWAP_AT + REVEAL_MS + REVEAL_STAGGER + 60; // ~740ms — idle again
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

/**
 * Pixelated image card, modelled on renlenon.vercel.app: a random grid of
 * white pixels flashes over the image, the image crossfades while it is
 * covered, then the pixels flash away. Triggered by hover/focus (desktop) or
 * tap (touch), and also auto-cycles on a timer. Pure CSS transitions.
 *
 * Smoothness notes:
 * - Per-cell random delays are computed ONCE (useMemo) — never in render — so
 *   the stagger is stable and no jitter is introduced on re-render.
 * - Images crossfade (opacity transition) so even a partial mask never shows a
 *   hard cut.
 * - The overlay is promoted to its own compositor layer (translateZ) and the
 *   images hint `will-change: opacity` for GPU-composited, tear-free fades.
 */
export default function AvatarSwap({
  images,
  alt,
  autoSwapMs = 7000,
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

  // Stable per-cell stagger, computed once — avoids re-randomising on render.
  const cellDelays = useMemo(
    () =>
      Array.from({ length: CELLS * CELLS }, () => ({
        in: Math.random() * COVER_STAGGER,
        out: Math.random() * REVEAL_STAGGER,
      })),
    [],
  );

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
        window.matchMedia('(pointer: coarse)').matches,
    );
  }, []);

  const trigger = useCallback(() => {
    if (busy.current || images.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive((i) => (i + 1) % images.length);
      return;
    }
    busy.current = true;
    setCovered(true); // pixels fade in (random stagger via stable delays)
    window.setTimeout(() => setActive((i) => (i + 1) % images.length), SWAP_AT);
    window.setTimeout(() => setCovered(false), SWAP_AT + 20); // pixels fade out
    window.setTimeout(() => {
      busy.current = false;
    }, DONE_AT);
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
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.src}
          src={img.src}
          alt={i === active ? alt : ''}
          aria-hidden={i === active ? undefined : true}
          draggable={false}
          decoding="async"
          loading="eager"
          style={{
            objectPosition: img.position ?? 'center top',
            opacity: i === active ? 1 : 0,
            transition: `opacity ${IMG_FADE_MS}ms ${EASE}`,
            willChange: 'opacity',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
      ))}

      {/* Pixel overlay: random white squares that flash to mask the swap. */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{ transform: 'translateZ(0)' }}
      >
        {Array.from({ length: CELLS * CELLS }).map((_, i) => (
          <span
            key={i}
            className="absolute bg-white"
            style={{
              width: `${100 / CELLS}%`,
              height: `${100 / CELLS}%`,
              left: `${(i % CELLS) * (100 / CELLS)}%`,
              top: `${Math.floor(i / CELLS) * (100 / CELLS)}%`,
              opacity: covered ? 1 : 0,
              transition: `opacity ${covered ? COVER_MS : REVEAL_MS}ms ${EASE}`,
              transitionDelay: covered
                ? `${cellDelays[i].in.toFixed(0)}ms`
                : `${cellDelays[i].out.toFixed(0)}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
