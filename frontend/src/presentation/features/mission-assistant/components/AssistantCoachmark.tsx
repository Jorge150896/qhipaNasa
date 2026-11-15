import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { AssistantRobot } from './AssistantRobot';

const targetPrefix = 'assistant-target-';
const targetSelector = '[id^="assistant-target-"], [data-assistant-control]';

function findControl(element: EventTarget | null) {
  if (!(element instanceof Element)) return null;
  if (element.closest('.mission-assistant, .assistant-launcher-host, .assistant-coach-tip'))
    return null;
  const control = element.closest<HTMLElement>(targetSelector);
  return control?.tagName === 'MAIN' ? null : control;
}

type Tip = { label: string; text: string; canAsk?: boolean };

export function AssistantCoachmark({
  describe,
  onExit,
  onAsk,
}: {
  describe(id: string): Tip | undefined;
  onExit(): void;
  onAsk(id: string): void;
}) {
  const robot = useRef<HTMLDivElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<{ id: string; touch: boolean; tip: Tip }>();
  const activeTip = active?.tip;
  const describeControl = useEffectEvent(describe);
  const askAbout = useEffectEvent(onAsk);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let target: HTMLElement | null = null;
    let touchControl: HTMLElement | null = null;
    let frame = 0;
    let keyboardNavigation = false;
    let dismissTimer: number | undefined;
    let hoverTimer: number | undefined;
    let candidate: HTMLElement | null = null;
    let anchor = { x: 0, y: 0 };
    let lastShownAt = -Infinity;

    function cancelHover() {
      window.clearTimeout(hoverTimer);
      candidate = null;
    }

    function describeTarget(control: HTMLElement) {
      const id = control.dataset.assistantControl ?? control.id.slice(targetPrefix.length);
      const tip = id && describeControl(id);
      return tip ? { id, tip } : undefined;
    }

    function placeRobot(x: number, y: number) {
      if (!robot.current || motion.matches) return;
      const left = Math.max(4, Math.min(window.innerWidth - 48, x + 16));
      const top = Math.max(4, Math.min(window.innerHeight - 42, y + 16));
      robot.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      robot.current.dataset.visible = 'true';
    }

    function placeTooltip() {
      if (!target?.isConnected || !tooltip.current) {
        if (target && !target.isConnected) select(null);
        return;
      }
      const rect = target.getBoundingClientRect();
      const box = tooltip.current.getBoundingClientRect();
      const width = box.width;
      const height = box.height;
      const inside = rect.bottom > 0 && rect.top < window.innerHeight;
      tooltip.current.style.visibility = inside ? 'visible' : 'hidden';
      tooltip.current.style.left = `${Math.max(8, Math.min(window.innerWidth - width - 8, rect.left))}px`;
      const preferredTop =
        rect.bottom + height + 10 <= window.innerHeight ? rect.bottom + 8 : rect.top - height - 8;
      tooltip.current.style.top = `${Math.max(8, Math.min(window.innerHeight - height - 8, preferredTop))}px`;
    }

    function select(control: HTMLElement | null, touch = false) {
      if (target === control) return;
      if (target) delete target.dataset.assistantCoach;
      target = control;
      const description = target && describeTarget(target);
      if (target && description) {
        target.dataset.assistantCoach = 'true';
        setActive({ ...description, touch });
        lastShownAt = performance.now();
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(placeTooltip);
      } else {
        setActive(undefined);
      }
    }

    function move(event: PointerEvent) {
      if (event.pointerType === 'touch') return;
      placeRobot(event.clientX, event.clientY);
      window.clearTimeout(dismissTimer);
      if (event.target instanceof Node && tooltip.current?.contains(event.target)) return;
      const control = findControl(event.target);
      if (!control || !describeTarget(control)) {
        cancelHover();
        if (target) dismissTimer = window.setTimeout(() => select(null), 280);
        return;
      }
      if (control === target) return;
      const moved = Math.hypot(event.clientX - anchor.x, event.clientY - anchor.y) > 8;
      if (candidate === control && !moved) return;
      cancelHover();
      select(null);
      candidate = control;
      anchor = { x: event.clientX, y: event.clientY };
      hoverTimer = window.setTimeout(
        () => {
          cancelHover();
          if (control.isConnected) select(control);
        },
        Math.max(900, 1800 - (performance.now() - lastShownAt)),
      );
    }

    function focus(event: FocusEvent) {
      cancelHover();
      const control = findControl(event.target);
      if (robot.current) delete robot.current.dataset.visible;
      if (event.target instanceof Node && tooltip.current?.contains(event.target)) return;
      select(control && (keyboardNavigation || control.matches(':focus-visible')) ? control : null);
    }

    function pointerDown(event: PointerEvent) {
      keyboardNavigation = false;
      cancelHover();
      if (event.target instanceof Node && tooltip.current?.contains(event.target)) return;
      if (event.pointerType !== 'touch') select(null);
    }

    function tap(event: MouseEvent) {
      if (!(event instanceof PointerEvent) || event.pointerType !== 'touch') return;
      if (event.target instanceof Node && tooltip.current?.contains(event.target)) return;
      const control = findControl(event.target);
      if (!control || !describeTarget(control) || control === touchControl) {
        touchControl = null;
        select(null);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      touchControl = control;
      select(control, true);
    }

    function hideRobot() {
      if (robot.current) delete robot.current.dataset.visible;
    }

    function leave() {
      cancelHover();
      hideRobot();
      if (!touchControl) select(null);
    }

    function scroll() {
      cancelHover();
      touchControl = null;
      select(null);
    }

    function key(event: KeyboardEvent) {
      if (event.key === 'Tab') keyboardNavigation = true;
      if (event.key === 'Escape') onExit();
      const control = findControl(event.target);
      const id = control?.dataset.assistantControl ?? control?.id.slice(targetPrefix.length);
      if (event.key === '?' && id && describeControl(id)?.canAsk) {
        event.preventDefault();
        askAbout(id);
      }
    }

    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerdown', pointerDown, { capture: true, passive: true });
    document.addEventListener('focusin', focus);
    document.addEventListener('click', tap, true);
    document.addEventListener('keydown', key);
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', scroll, { capture: true, passive: true });
    window.addEventListener('blur', leave);
    window.addEventListener('resize', placeTooltip);
    motion.addEventListener('change', hideRobot);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(dismissTimer);
      cancelHover();
      if (target) delete target.dataset.assistantCoach;
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerdown', pointerDown, true);
      document.removeEventListener('focusin', focus);
      document.removeEventListener('click', tap, true);
      document.removeEventListener('keydown', key);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('blur', leave);
      window.removeEventListener('resize', placeTooltip);
      motion.removeEventListener('change', hideRobot);
    };
  }, [onExit]);

  return (
    <>
      <div ref={robot} className="assistant-follow-robot" aria-hidden="true">
        <AssistantRobot />
      </div>
      <div ref={tooltip} className="assistant-coach-tip" role="status" hidden={!activeTip}>
        {activeTip && (
          <>
            <strong>{activeTip.label}</strong>
            <p>{activeTip.text}</p>
            {activeTip.canAsk && active && (
              <button type="button" className="text-button" onClick={() => onAsk(active.id)}>
                Preguntar por este dato
              </button>
            )}
            {activeTip.canAsk && !active?.touch && (
              <small>Teclado: pulsa ? sobre la tarjeta.</small>
            )}
            {active?.touch && <small>Toca de nuevo para usar este control.</small>}
          </>
        )}
      </div>
    </>
  );
}
