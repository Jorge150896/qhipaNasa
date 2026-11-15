import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { DailyCheckScreen } from '@/presentation/features/daily-check/DailyCheckScreen';
import { mapMissionPresentation } from '@/presentation/features/mission/mapMissionPresentation';
import { SimulatedMissionRepository } from '@/data/mission/SimulatedMissionRepository';

it('confirma los campos de la actividad y conserva el borrador al fallar el guardado', async () => {
  const save = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  const data = mapMissionPresentation(
    await new SimulatedMissionRepository().load('baseline'),
    { checks: [], reviewedObservationIds: [] },
    'elena',
    'heartRate',
    'habitat',
    '2026-11-08',
  );
  render(<DailyCheckScreen data={data} saving={false} onSave={save} />);
  fireEvent.click(screen.getByRole('radio', { name: 'Ejercicio' }));
  fireEvent.click(screen.getByRole('radio', { name: 'Antes' }));
  fireEvent.click(screen.getByRole('button', { name: 'Continuar a autoevaluación' }));
  fireEvent.change(screen.getByLabelText('Horas de sueño'), { target: { value: '7.5' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: /Esfuerzo percibido/ }), {
    target: { value: '0' },
  });
  expect(screen.getByRole('spinbutton', { name: /Duración prevista/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Revisar chequeo' }));
  expect(save).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar chequeo' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('El borrador sigue disponible');
  expect(screen.queryByText('Chequeo guardado')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar guardado' }));
  await waitFor(() =>
    expect(save).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sleep: '7.5',
        fatigue: '',
        attachment: expect.objectContaining({ source: 'synthetic', readings: expect.any(Array) }),
        note: '',
        context: { activity: 'exercise', moment: 'before', measurements: { effort: 0 } },
        discomfortRegion: undefined,
      }),
    ),
  );
  expect(await screen.findByText('Chequeo guardado')).toBeInTheDocument();
});

it('conserva la hora de la instantánea y marca una lectura ausente sin copiar la anterior', async () => {
  const snapshot = await new SimulatedMissionRepository().load('sensor-gap');
  const data = mapMissionPresentation(
    snapshot,
    { checks: [], reviewedObservationIds: [] },
    'elena',
    'oxygen',
    'exercise',
    '2026-11-15',
  );

  expect(data.checkAttachment).toMatchObject({
    capturedAt: snapshot.capturedAt,
    source: 'synthetic',
    zone: { id: 'habitat' },
    readings: expect.arrayContaining([
      { id: 'oxygen', at: snapshot.capturedAt, value: null, unit: '%', quality: 'missing' },
      { id: 'heartRate', at: snapshot.capturedAt, value: 72, unit: 'lpm', quality: 'available' },
    ]),
  });
});
