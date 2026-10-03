'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface DeckPhoto {
  src: string;
  alt: string;
  label: string;
}

interface Props {
  photos: DeckPhoto[];
}

/** Pointer must travel this far (px, before damping) to swap the card. */
const SENSITIVITY = 200;
/** Translation is resisted — the card moves at this fraction of the pointer. */
const ELASTIC = 0.6;
/** Applied offset (px) that produces the full 3D tilt. */
const TILT_RANGE = 100;
/** Max 3D tilt (deg). */
const TILT_MAX = 60;
/** Ignore sub-pixel jitter so a click is never read as a drag. */
const DRAG_SLOP = 6;
/** Release / settle spring (Renlenon: stiffness 400, damping 30). */
const SPRING_K = 400;
const SPRING_D = 30;
/** Rest-fan step per card (Renlenon: rotateZ +4°, scale −0.06). */
const FAN_ROT = 4;
const FAN_SCALE = 0.06;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Channels = { x: number; y: number; rx: number; ry: number };
const KEYS: (keyof Channels)[] = ['x', 'y', 'rx', 'ry'];

/**
 * A fanned photo deck that behaves like a physical stack of cards.
 *
 * Geometry and interaction mirror Renlenon's deck 1:1: a 600px perspective,
 * cards pivoting at their bottom-right corner, and a front card that resists
 * translation (elastic) while tilting up to ±60° in 3D. Pull past 200px and the
 * card tucks into the back of the deck; pull less and it springs home. The deck
 * as a whole never rotates.
 *
 * The drag transform is written straight to the DOM inside a rAF loop (no React
 * re-render per pointer event), so the motion holds 60fps.
 */
export default function CardDeck({ photos }: Props) {
  const n = photos.length;
  const [order, setOrder] = useState<number[]>(() => photos.map((_, i) => i));
  const [dragging, setDragging] = useState(false);

  const dragRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Live drag bookkeeping (refs — no re-render per move).
  const ptrStart = useRef({ x: 0, y: 0 });
  const ptrDelta = useRef({ x: 0, y: 0 });
  const sample = useRef({ x: 0, y: 0, t: 0 });
  const fling = useRef({ x: 0, y: 0 });

  const active = useRef(0); // which photo is being dragged / settling
  const cur = useRef<Channels>({ x: 0, y: 0, rx: 0, ry: 0 });
  const vel = useRef<Channels>({ x: 0, y: 0, rx: 0, ry: 0 });

  const isDragging = useRef(false);
  const moved = useRef(false);
  const raf = useRef<number | null>(null);
  const last = useRef(0);

  const front = order[0] ?? 0;
  const frontLabel = photos[front]?.label ?? '';

  useEffect(() => {
    setOrder(photos.map((_, i) => i));
    cur.current = { x: 0, y: 0, rx: 0, ry: 0 };
    vel.current = { x: 0, y: 0, rx: 0, ry: 0 };
  }, [photos]);

  /** Write the live drag pose onto the active card's drag layer. */
  const paint = useCallback(() => {
    const el = dragRefs.current[active.current];
    if (!el) return;
    const c = cur.current;
    el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0px) rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg)`;
  }, []);

  const tick = useCallback(
    (now: number) => {
      raf.current = null;
      const dt = Math.min(0.033, Math.max(0.001, (now - last.current) / 1000));
      last.current = now;

      if (isDragging.current) {
        const d = ptrDelta.current;
        // Resisted translation + 3D tilt, exactly like Renlenon.
        const ax = d.x * ELASTIC;
        const ay = d.y * ELASTIC;
        cur.current.x = ax;
        cur.current.y = ay;
        cur.current.ry = clamp((ax / TILT_RANGE) * TILT_MAX, -TILT_MAX, TILT_MAX);
        cur.current.rx = clamp((-ay / TILT_RANGE) * TILT_MAX, -TILT_MAX, TILT_MAX);
        vel.current = { x: 0, y: 0, rx: 0, ry: 0 };
        paint();
        return;
      }

      // Released: spring every channel home (stiffness 400 / damping 30).
      let settled = true;
      for (const k of KEYS) {
        const a = -SPRING_K * cur.current[k] - SPRING_D * vel.current[k];
        vel.current[k] += a * dt;
        cur.current[k] += vel.current[k] * dt;
        if (Math.abs(cur.current[k]) > 0.04 || Math.abs(vel.current[k]) > 0.04) settled = false;
      }
      if (settled) {
        for (const k of KEYS) {
          cur.current[k] = 0;
          vel.current[k] = 0;
        }
      }
      paint();
      if (!settled) raf.current = requestAnimationFrame(tick);
    },
    [paint],
  );

  const ensure = useCallback(() => {
    if (raf.current == null) {
      last.current = performance.now();
      raf.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const advance = useCallback(() => {
    setOrder((o) => (o.length ? [...o.slice(1), o[0]] : o));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    ptrStart.current = { x: e.clientX, y: e.clientY };
    ptrDelta.current = { x: 0, y: 0 };
    sample.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    fling.current = { x: 0, y: 0 };
    moved.current = false;
    active.current = order[0] ?? 0;
    isDragging.current = true;
    setDragging(true);
    ensure();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - ptrStart.current.x;
    const dy = e.clientY - ptrStart.current.y;
    ptrDelta.current = { x: dx, y: dy };
    if (Math.hypot(dx, dy) > DRAG_SLOP) moved.current = true;

    const now = performance.now();
    const dt = Math.max(1, now - sample.current.t);
    fling.current = {
      x: (e.clientX - sample.current.x) / dt,
      y: (e.clientY - sample.current.y) / dt,
    };
    sample.current = { x: e.clientX, y: e.clientY, t: now };
    ensure();
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    isDragging.current = false;
    setDragging(false);

    const d = ptrDelta.current;
    if (Math.abs(d.x) > SENSITIVITY || Math.abs(d.y) > SENSITIVITY) {
      advance(); // far enough — tuck this card into the back of the deck
    }
    // Carry the release velocity into the spring for a natural settle.
    vel.current = { x: fling.current.x * 16, y: fling.current.y * 16, rx: 0, ry: 0 };
    ensure();
  };

  const onCardClick = () => {
    if (moved.current) return;
    advance();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      advance();
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 sm:items-end">
      {/* Cards pivot near their bottom-right corner, so the fan sweeps up and to
          the right; this padding reserves that room and keeps it on-screen. */}
      <div className="pr-10 pt-12 sm:pr-12 sm:pt-8">
        <div
          role="button"
          tabIndex={0}
          aria-label={`Photo deck, ${n} photos. Drag a card away or click to see the next. Showing: ${frontLabel}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={onCardClick}
          onKeyDown={onKeyDown}
          className={`relative h-[220px] w-[220px] select-none outline-none sm:h-[250px] sm:w-[250px] ${
            dragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          // touch-action:none so the browser never steals a touch gesture over
          // the deck — dragging a card wins over page scroll (as Renlenon does).
          style={{ touchAction: 'none', perspective: '600px' }}
        >
          {photos.map((p, i) => {
            const pos = order.indexOf(i);
            // Resting pose — Renlenon's exact formula, where `iRen` is the card's
            // index in their array (front = last): rotateZ (n-i-1)*4°, scale
            // 1 + i*.06 - n*.06. `pos` is ours (front = 0), so iRen = n-1-pos.
            const iRen = n - 1 - pos;
            const baseRotZ = (n - iRen - 1) * FAN_ROT;
            const baseScale = 1 + iRen * FAN_SCALE - n * FAN_SCALE;

            return (
              <div
                key={p.src}
                ref={(el) => {
                  dragRefs.current[i] = el;
                }}
                className="absolute inset-0"
                style={{
                  zIndex: n - pos,
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
              >
                {/* Inner layer carries the resting fan pose and springs on swap. */}
                <div
                  className="h-full w-full"
                  style={{
                    transformOrigin: '90% 90%',
                    transform: `rotateZ(${baseRotZ}deg) scale(${baseScale})`,
                    transitionProperty: 'transform',
                    transitionDuration: '500ms',
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    willChange: 'transform',
                  }}
                >
                  <div className="h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] dark:border-white/[0.15] dark:bg-ink-card dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.src}
                      alt={p.alt}
                      loading={i < 3 ? 'eager' : 'lazy'}
                      draggable={false}
                      className="pointer-events-none h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[12px] font-mono text-gray-500 dark:text-gray-400 sm:pr-12">
        <span className="tracking-widest uppercase">{frontLabel}</span>
        <span className="text-gray-300 dark:text-white/20">·</span>
        <span>
          {front + 1}/{n}
        </span>
      </div>
    </div>
  );
}
