import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { JournalForm } from '@/presentation/features/daily-check/components/JournalForm';
it('envía un chequeo explícito con la identidad y los campos accesibles', async () => {
  const save = vi.fn().mockResolvedValue(true);
  render(<JournalForm personName="Elena Torres" saving={false} onSave={save} />);
  fireEvent.change(screen.getByLabelText('Horas de sueño'), { target: { value: '7.5' } });
  fireEvent.click(screen.getByLabelText('Bien'));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar chequeo' }));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith({ sleep: '7.5', fatigue: '2', mood: 'good', note: '' }),
  );
});
