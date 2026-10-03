'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface AvatarImage {
  src: string;
  /** CSS object-position for this image (e.g. 'center 20%'). */
  position?: string;
}

// 12x12 grid, same as the reference implementation.
const GRID = 12;
const PIXELS = GRID * GRID;
const CELL_PCT = 100 / GRID;

// One "pass" = every pixel toggling once, in random order, over this window.
// Kept a little shorter than the swap so the card is fully covered first.
const PASS_MS = 400;
const SWAP_AT = PASS_MS; // image swaps here, while fully masked
const CYCLE_MS = PASS_MS * 2; // cover pass + reveal pass

/**
 * Random per-pixel delays. Capped below the pass length so every pixel has
 * finished before the image swaps (no half-covered frame).
 */
function makeDelays(): number[] {
  return Array.from({ length: PIXELS }, () => Math.random() * PASS_MS * 0.9);
}

// Deterministic all-zero delays: the server and the first client render must
// agree, so the random order cannot be generated during render. It is set on
// mount, before the first animation can run.
const NO_DELAYS: number[] = Array.from({ length: PIXELS }, () => 0);

/**
 * Pixelated avatar swap, modelled on renlenon.vercel.app.
 *
 * A grid of white pixels pops in — one at a time, in random order, with no
 * fade (the reference tweens `display` with a 0ms duration) — the image swaps
 * while the card is fully masked, then the pixels pop out the same way. The
 * crisp instant toggles are what make it read as a pixel dissolve rather than
 * a blurry fade.
 *
 * Triggered by hover/focus (desktop), tap (touch) and an auto-cycle timer.
 * Pure CSS transitions — no animation library.
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
  const [active, setActive] = useState(0);
  const [masked, setMasked] = useState(false);
  const [delays, setDelays] = useState<number[]>(NO_DELAYS);
  const [isTouch, setIsTouch] = useState(false);

  const busy = useRef(false);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches,
    );
  }, []);

  useEffect(
    () => () => {
      if (swapTimer.current) clearTimeout(swapTimer.current);
      if (endTimer.current) clearTimeout(endTimer.current);
    },
    [],
  );

  const trigger = useCallback(() => {
    // Ignore re-triggers mid-animation so a cycle always plays out in full.
    if (busy.current || images.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive((i) => (i + 1) % images.length);
      return;
    }

    busy.current = true;

    // Cover pass: fresh random order, pixels pop on.
    setDelays(makeDelays());
    setMasked(true);

    swapTimer.current = setTimeout(() => {
      // Swap while fully covered, then start the reveal pass with a new
      // random order so the two passes do not mirror each other.
      setActive((i) => (i + 1) % images.length);
      setDelays(makeDelays());
      setMasked(false);
    }, SWAP_AT);

    endTimer.current = setTimeout(() => {
      busy.current = false;
    }, CYCLE_MS);
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
            willChange: 'opacity',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
      ))}

      {/* Pixel mask: each cell toggles instantly after its own random delay. */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{ transform: 'translateZ(0)' }}
      >
        {Array.from({ length: PIXELS }).map((_, i) => (
          <span
            key={i}
            className="absolute bg-white"
            style={{
              width: `${CELL_PCT}%`,
              height: `${CELL_PCT}%`,
              left: `${(i % GRID) * CELL_PCT}%`,
              top: `${Math.floor(i / GRID) * CELL_PCT}%`,
              opacity: masked ? 1 : 0,
              transition: `opacity 1ms linear ${delays[i].toFixed(0)}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
