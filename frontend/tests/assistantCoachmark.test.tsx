import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssistantCoachmark } from '@/presentation/features/mission-assistant/components/AssistantCoachmark';

function mountGuide() {
  return render(
    <>
      <main data-assistant-control="crew" data-assistant-section="crew">
        <button id="assistant-target-metric-heartRate">Pulso</button>
        <button id="assistant-target-compare">Comparar</button>
        <button>Actualizar registros</button>
        <p>Contenido del apartado</p>
      </main>
      <AssistantCoachmark
        describe={(id) => ({ label: id, text: `Ayuda para ${id}` })}
        onExit={vi.fn()}
        onAsk={vi.fn()}
      />
    </>,
  );
}

function advance(ms: number) {
  act(() => vi.advanceTimersByTime(ms));
}

function hover(element: HTMLElement, x = 100) {
  fireEvent.pointerMove(element, { pointerType: 'mouse', clientX: x, clientY: 100 });
}

describe('Ayuda discreta de Tumi', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('espera una pausa del puntero y no interrumpe al recorrer un control', () => {
    mountGuide();
    const tip = screen.getByRole('status', { hidden: true });
    const pulse = screen.getByRole('button', { name: 'Pulso' });
    hover(pulse);
    advance(700);
    expect(tip).not.toBeVisible();
    hover(pulse, 130);
    advance(700);
    expect(tip).not.toBeVisible();
    advance(200);
    expect(tip).toBeVisible();
    expect(tip).toHaveTextContent('Ayuda para metric-heartRate');
  });

  it('omite fondo y controles corrientes y cancela ayuda pendiente al salir, hacer clic o desplazar', () => {
    mountGuide();
    const tip = screen.getByRole('status', { hidden: true });
    const pulse = screen.getByRole('button', { name: 'Pulso' });
    hover(pulse);
    advance(400);
    hover(screen.getByText('Contenido del apartado'));
    advance(2000);
    expect(tip).not.toBeVisible();
    hover(screen.getByRole('button', { name: 'Actualizar registros' }));
    advance(2000);
    expect(tip).not.toBeVisible();
    hover(pulse);
    fireEvent.pointerDown(pulse, { pointerType: 'mouse' });
    advance(2000);
    expect(tip).not.toBeVisible();
    hover(pulse);
    fireEvent.scroll(window);
    advance(2000);
    expect(tip).not.toBeVisible();
  });

  it('deja un intervalo entre sugerencias en distintos controles', () => {
    mountGuide();
    const tip = screen.getByRole('status', { hidden: true });
    hover(screen.getByRole('button', { name: 'Pulso' }));
    advance(900);
    expect(tip).toBeVisible();
    hover(screen.getByRole('button', { name: 'Comparar' }));
    advance(1000);
    expect(tip).not.toBeVisible();
    advance(800);
    expect(tip).toBeVisible();
    expect(tip).toHaveTextContent('Ayuda para compare');
  });
});
