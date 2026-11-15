'use client';
import { isTumiMobile } from '@/presentation/shared/tumi/tumiViewport';
import { useEffect, useRef, type Dispatch, type RefObject } from 'react';
import { clampPoint, isFree, type Point, type Rect, type TumiEvent } from './behavior';
import type { TumiEmotion } from './types';

/** Visual motion only. Geometry is read on events/decisions, never on every frame. */
export function useTumiMotion(
  actor: RefObject<HTMLDivElement | null>,
  options: {
    stopped: boolean;
    open: boolean;
    hidden: boolean;
    dispatch: Dispatch<TumiEvent>;
    react(emotion: TumiEmotion): void;
  },
) {
  const position = useRef<Point | null>(null);
  const { stopped, open, hidden, dispatch, react } = options;
  useEffect(() => {
    const element = actor.current;
    if (!element || hidden) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let current = position.current ?? { x: innerWidth - 110, y: innerHeight - 160 };
    let target = current;
    let frame = 0,
      previous = 0,
      timer: ReturnType<typeof setTimeout>;
    let lastActivity = performance.now(),
      heldUntil = 0,
      dragging = false;
    let dragStart: Point | null = null,
      dragOrigin = current,
      dragged = false;
    let obstacles: Rect[] = [];
    const panel = open ? document.querySelector<HTMLElement>('.cursor-assistant-panel') : null;
    const dialogue = panel?.querySelector<HTMLElement>('.tumi-dialogue');
    const viewport = window.visualViewport;
    const dimensions = () => ({ w: element.offsetWidth, h: element.offsetHeight });
    const clamp = (p: Point) => {
      const { w, h } = dimensions();
      return clampPoint(p, { x: innerWidth, y: innerHeight }, w, h, 20);
    };
    const free = (p: Point) => {
      const { w, h } = dimensions();
      return isFree(p, w, h, obstacles);
    };
    const scan = () => {
      obstacles = Array.from(
        document.querySelectorAll(
          'button,a,input,textarea,select,h1,h2,h3,h4,h5,h6,p,label,nav,header,form,[contenteditable="true"],[role="button"],[role="menu"],[role="dialog"],[data-tumi-avoid]',
        ),
      )
        .filter(
          (node) =>
            !node.closest('.cursor-assistant,.cursor-assistant-panel,.cursor-assistant-restore') &&
            getComputedStyle(node).visibility !== 'hidden',
        )
        .map((node) => node.getBoundingClientRect())
        .filter(
          (r) =>
            r.width > 0 &&
            r.height > 0 &&
            r.bottom > 0 &&
            r.top < innerHeight &&
            r.right > 0 &&
            r.left < innerWidth,
        );
    };
    const paint = () => {
      position.current = current;
      if (isTumiMobile()) element.style.removeProperty('transform');
      else element.style.transform = 'translate3d(' + current.x + 'px,' + current.y + 'px,0)';
      element.dataset.bubbleSide = current.x < 240 ? 'right' : 'left';
      if (panel && dialogue) {
        const top = viewport?.offsetTop ?? 0;
        const left = viewport?.offsetLeft ?? 0;
        const height = viewport?.height ?? innerHeight;
        const right = left + (viewport?.width ?? innerWidth);
        panel.style.setProperty('--tumi-viewport-height', height + 'px');
        const pw = panel.offsetWidth;
        const ph = panel.offsetHeight;
        const anchor = element.getBoundingClientRect();
        const centerX = (anchor.left + anchor.right) / 2;
        const centerY = (anchor.top + anchor.bottom) / 2;
        const side =
          anchor.left - 12 - pw >= left + 8
            ? 'left'
            : anchor.right + 12 + pw <= right - 8
              ? 'right'
              : anchor.top - top > top + height - anchor.bottom
                ? 'above'
                : 'below';
        const x =
          side === 'left'
            ? anchor.left - pw - 12
            : side === 'right'
              ? anchor.right + 12
              : centerX - pw / 2;
        const y =
          side === 'above'
            ? anchor.top - ph - 12
            : side === 'below'
              ? anchor.bottom + 12
              : centerY - dialogue.offsetHeight / 2;
        const bubbleX = Math.max(left + 8, Math.min(right - pw - 8, x));
        const bubbleY = Math.max(top + 8, Math.min(top + height - ph - 8, y));
        panel.dataset.side = side;
        panel.style.left = bubbleX + 'px';
        panel.style.top = bubbleY + 'px';
        panel.style.setProperty('--tumi-anchor-x', centerX - bubbleX + 'px');
        panel.style.setProperty('--tumi-anchor-y', centerY - bubbleY + 'px');
      }
      // An open panel always takes precedence; the character itself never blocks a control.
      element.dataset.obstructed = String(!isTumiMobile() && !open && !free(current));
    };
    const rest = () => {
      element.dataset.moving = 'false';
      element.style.setProperty('--look', '0deg');
      element.style.setProperty('--turn', '0deg');
      dispatch('REST');
    };
    const tick = (time: number) => {
      if (document.hidden || dragging || stopped || open || reduced.matches) {
        rest();
        return;
      }
      const dt = Math.min(0.05, Math.max(0, (time - (previous || time)) / 1000));
      previous = time;
      const next = {
        x: current.x + (target.x - current.x) * (1 - Math.exp(-2.6 * dt)),
        y: current.y + (target.y - current.y) * (1 - Math.exp(-2.6 * dt)),
      };
      if (!free(next)) {
        target = current;
        rest();
        return;
      }
      current = next;
      paint();
      if (Math.hypot(target.x - current.x, target.y - current.y) < 1) {
        current = target;
        paint();
        rest();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    const decide = () => {
      clearTimeout(timer);
      timer = setTimeout(decide, 9000 + Math.random() * 11000);
      if (
        document.hidden ||
        isTumiMobile() ||
        stopped ||
        open ||
        dragging ||
        reduced.matches ||
        element.querySelector(
          '.cursor-assistant-bubble:hover, .cursor-assistant-bubble:focus-within',
        ) ||
        performance.now() < heldUntil ||
        performance.now() - lastActivity < 1700
      )
        return;
      scan();
      const { w, h } = dimensions();
      const candidates: Point[] = [];
      for (let i = 0; i < 24; i++) {
        const edge = Math.floor(Math.random() * 4);
        candidates.push(
          clamp(
            edge === 0
              ? { x: 20, y: Math.random() * innerHeight }
              : edge === 1
                ? { x: innerWidth - w - 20, y: Math.random() * innerHeight }
                : edge === 2
                  ? { x: Math.random() * innerWidth, y: 28 }
                  : { x: Math.random() * innerWidth, y: innerHeight - h - 28 },
          ),
        );
      }
      candidates.push(
        clamp({ x: current.x, y: current.y - 120 }),
        clamp({ x: current.x, y: current.y + 120 }),
      );
      const destination = candidates.find(
        (p) =>
          free(p) &&
          Math.hypot(p.x - current.x, p.y - current.y) > 60 &&
          Array.from({ length: 12 }, (_, i) => ({
            x: current.x + ((p.x - current.x) * (i + 1)) / 12,
            y: current.y + ((p.y - current.y) * (i + 1)) / 12,
          })).every(free),
      );
      if (!destination) {
        react(performance.now() - lastActivity > 45000 ? 'sleeping' : 'curious');
        return;
      }
      target = destination;
      react('curious');
      dispatch('MOVE');
      element.dataset.moving = 'true';
      element.style.setProperty('--look', target.x > current.x ? '3deg' : '-3deg');
      cancelAnimationFrame(frame);
      previous = 0;
      frame = requestAnimationFrame(tick);
    };
    const relocate = () => {
      if (isTumiMobile()) {
        const { w, h } = dimensions();
        current = target = {
          x: Math.max(0, innerWidth - w - 8),
          y: Math.max(0, (innerHeight - h) / 2),
        };
        cancelAnimationFrame(frame);
        paint();
        return;
      }
      scan();
      current = clamp(current);
      target = current;
      cancelAnimationFrame(frame);
      if (!open && !free(current)) {
        const { w, h } = dimensions();
        const spots: Point[] = [];
        for (let y = 20; y < innerHeight - h - 16; y += 40)
          for (const x of [20, innerWidth - w - 20]) spots.push({ x, y });
        const spot = spots
          .sort(
            (a, b) =>
              Math.hypot(a.x - current.x, a.y - current.y) -
              Math.hypot(b.x - current.x, b.y - current.y),
          )
          .find(free);
        if (spot) current = target = spot;
      }
      paint();
    };
    const activity = (event: Event) => {
      lastActivity = performance.now();
      if (event instanceof PointerEvent && !dragging) {
        const dx = event.clientX - current.x - element.offsetWidth / 2;
        element.style.setProperty('--turn', Math.max(-5, Math.min(5, dx / 60)) + 'deg');
        if (
          !open &&
          !stopped &&
          !reduced.matches &&
          Math.hypot(dx, event.clientY - current.y) < 110 &&
          event.target instanceof Element &&
          !event.target.closest('.cursor-assistant')
        ) {
          heldUntil = performance.now() + 2500;
          cancelAnimationFrame(frame);
          relocate();
        }
      }
    };
    const down = (e: PointerEvent) => {
      if (isTumiMobile() || open || stopped || e.button !== 0) return;
      dragging = true;
      dragged = false;
      dragStart = { x: e.clientX, y: e.clientY };
      dragOrigin = current;
      cancelAnimationFrame(frame);
      (e.target as Element).setPointerCapture(e.pointerId);
      scan();
    };
    const drag = (e: PointerEvent) => {
      if (!dragging || !dragStart) return;
      const dx = e.clientX - dragStart.x,
        dy = e.clientY - dragStart.y;
      if (Math.hypot(dx, dy) > 6) {
        dragged = true;
        react('curious');
        dispatch('DRAG');
      }
      if (!dragged) return;
      const next = clamp({ x: dragOrigin.x + dx, y: dragOrigin.y + dy });
      current = next;
      paint();
    };
    const release = () => {
      if (!dragging) return;
      dragging = false;
      dragStart = null;
      if (dragged) {
        heldUntil = performance.now() + 30000;
        relocate();
        rest();
      }
    };
    const suppressClick = (e: MouseEvent) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      }
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      element.dataset.sleeping = String(document.hidden);
      if (!document.hidden) {
        relocate();
      }
    };
    const button = element.querySelector('button')!;
    let rescanTimer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver((records) => {
      if (
        records.every(
          (record) =>
            record.target instanceof Element &&
            record.target.closest(
              '.cursor-assistant,.cursor-assistant-panel,.cursor-assistant-restore',
            ),
        )
      )
        return;
      clearTimeout(rescanTimer);
      rescanTimer = setTimeout(relocate, 100);
    });
    observer.observe(document.body, { subtree: true, childList: true });
    const panelResize = panel ? new ResizeObserver(paint) : undefined;
    if (panel) panelResize?.observe(panel);
    viewport?.addEventListener('resize', paint);
    viewport?.addEventListener('scroll', paint);
    relocate();
    timer = setTimeout(decide, 9000);
    window.addEventListener('pointermove', activity, { passive: true });
    window.addEventListener('keydown', activity, { passive: true });
    window.addEventListener('resize', relocate);
    window.addEventListener('scroll', relocate, { passive: true });
    document.addEventListener('focusin', relocate);
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', relocate);
    button.addEventListener('pointerdown', down);
    button.addEventListener('pointermove', drag);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('click', suppressClick, true);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      clearTimeout(rescanTimer);
      observer.disconnect();
      panelResize?.disconnect();
      viewport?.removeEventListener('resize', paint);
      viewport?.removeEventListener('scroll', paint);
      window.removeEventListener('pointermove', activity);
      window.removeEventListener('keydown', activity);
      window.removeEventListener('resize', relocate);
      window.removeEventListener('scroll', relocate);
      document.removeEventListener('focusin', relocate);
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', relocate);
      button.removeEventListener('pointerdown', down);
      button.removeEventListener('pointermove', drag);
      button.removeEventListener('pointerup', release);
      button.removeEventListener('pointercancel', release);
      button.removeEventListener('click', suppressClick, true);
    };
  }, [actor, stopped, open, hidden, dispatch, react]);
}
