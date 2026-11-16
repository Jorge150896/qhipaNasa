import { useEffect, useRef } from 'react';

export function useSimulationPlaybackScroll(endsAt: number | undefined, completed: boolean) {
  const board = useRef<HTMLDivElement>(null);
  const following = useRef(false);

  useEffect(() => {
    const element = board.current;
    if (!element) return;

    const startY = window.scrollY;
    const boardY = startY + element.getBoundingClientRect().top - 40;
    const scrollTo = (top: number) => window.scrollTo({ top, behavior: 'instant' });

    if (endsAt === undefined) {
      if (completed && following.current && boardY > startY) scrollTo(boardY);
      following.current = false;
      return;
    }

    following.current = boardY > startY;
    if (!following.current) return;

    const startedAt = performance.now();
    const duration = Math.max(1, endsAt - startedAt);
    const distance = boardY - startY;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const listeners = new AbortController();
    let frame: number;
    function stopFollowing() {
      following.current = false;
      cancelAnimationFrame(frame);
    }
    function scrollFrame(now: number) {
      const progress = Math.min(1, (now - startedAt) / duration);
      scrollTo(startY + distance * progress);
      if (progress < 1) frame = requestAnimationFrame(scrollFrame);
    }

    const { signal } = listeners;
    window.addEventListener('wheel', stopFollowing, { passive: true, signal });
    window.addEventListener('touchmove', stopFollowing, { passive: true, signal });
    window.addEventListener(
      'keydown',
      (event) => {
        if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
          stopFollowing();
        }
      },
      { signal },
    );
    if (!reducedMotion) frame = requestAnimationFrame(scrollFrame);

    return () => {
      cancelAnimationFrame(frame);
      listeners.abort();
    };
  }, [endsAt, completed]);

  return board;
}
