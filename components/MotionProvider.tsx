'use client';

import { useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// useLayoutEffect runs before paint (no flash), but React warns about it during
// SSR. This component only ever has work to do in the browser, so fall back to
// useEffect on the server render pass.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Site-wide GSAP motion.
 *
 * One intro timeline on load for the hero, then scroll-triggered reveals wired
 * to the `data-*` hooks marked up in the server components:
 *
 *   data-nav            navbar — slides down on load
 *   data-hero           hero elements — staggered rise on load
 *   data-avatar         profile picture — pops in on load
 *   data-reveal         standalone element — fades up as it enters the viewport
 *   data-reveal-group   container whose direct children stagger in on scroll
 *
 * The `.gsap-init` class (added by an inline script in the layout) hides these
 * before paint so nothing flashes in its final position; it is removed once
 * GSAP has taken over, and a failsafe timer in the layout removes it anyway if
 * this never runs.
 */
export default function MotionProvider() {
  useIsoLayoutEffect(() => {
    const root = document.documentElement;

    // Respect users who asked for less motion: show everything, animate nothing.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.remove('gsap-init');
      return;
    }

    const ctx = gsap.context(() => {
      const nav = gsap.utils.toArray<HTMLElement>('[data-nav]');
      const hero = gsap.utils.toArray<HTMLElement>('[data-hero]');
      const avatar = gsap.utils.toArray<HTMLElement>('[data-avatar]');

      // --- Hero: intro timeline on load ---------------------------------
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(nav, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6 })
        .fromTo(
          avatar,
          { opacity: 0, scale: 0.7, rotate: -8 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.6)' },
          '-=0.25',
        )
        .fromTo(
          hero,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 },
          '-=0.45',
        );

      // --- Scroll reveals ------------------------------------------------
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
        const items = Array.from(group.children) as HTMLElement[];
        if (!items.length) return;

        gsap.fromTo(
          items,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: { trigger: group, start: 'top 85%', once: true },
          },
        );
      });
    });

    // GSAP owns the initial state now, so the pre-paint hide can go.
    root.classList.remove('gsap-init');

    // Images and the async heatmap change layout after first paint; refresh so
    // trigger positions stay accurate.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const t = window.setTimeout(refresh, 1200);

    return () => {
      window.removeEventListener('load', refresh);
      window.clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return null;
}
