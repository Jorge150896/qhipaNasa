import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalLaunchSitesRepository } from '@/data/launches/LocalLaunchSitesRepository';
import { LoadLaunchSites } from '@/domain/usecases/LoadLaunchSites';
import { useLaunchSitesViewModel } from '@/presentation/features/launch-sites/useLaunchSitesViewModel';
import { LaunchVideo } from '@/presentation/features/launch-sites/components/LaunchVideo';
import {
  globePosition,
  groupNearbyPlaces,
} from '@/presentation/features/launch-sites/components/globeCoordinates';
import { LaunchSitesView } from '@/presentation/features/launch-sites/components/LaunchSitesView';
import { EarthOverview } from '@/presentation/features/launch-sites/components/EarthOverview';

describe('Sitios de lanzamiento', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
  });
  it('alinea marcadores con la textura equirectangular, hemisferios y radio', () => {
    expect(globePosition(0, 0)).toEqual([1, 0, -0]);
    expect(globePosition(90, 0)[1]).toBeCloseTo(1);
    expect(globePosition(0, 90)[2]).toBeCloseTo(-1);
    expect(globePosition(0, -90)[2]).toBeCloseTo(1);
    expect(globePosition(-90, 0)[1]).toBeCloseTo(-1);
    expect(Math.hypot(...globePosition(28.627, -80.621, 1.55))).toBeCloseTo(1.55);
  });
  it('conserva el catálogo entre lecturas y respeta cancelación', async () => {
    const repository = new LocalLaunchSitesRepository();
    const first = await repository.load();
    first[0].name = 'Modificado por consumidor';
    expect((await repository.load())[0].name).toBe('Kennedy');
    const controller = new AbortController();
    controller.abort();
    await expect(repository.load(controller.signal)).rejects.toThrow();
  });
  it('recupera selección por URL y distingue un sitio inexistente', async () => {
    const dependencies = { loadSites: new LoadLaunchSites(new LocalLaunchSitesRepository()) };
    const { result, rerender } = renderHook(({ id }) => useLaunchSitesViewModel(dependencies, id), {
      initialProps: { id: 'kourou' },
    });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.selected?.mission).toBe('James Webb');
    expect(result.current.selected?.date).toContain('2021');
    expect(result.current.selected?.embedUrl).toMatch(
      /^https:\/\/www.youtube-nocookie.com\/embed\//,
    );
    rerender({ id: 'inexistente' });
    expect(result.current.selected).toBeNull();
    expect(result.current.invalidSelection).toBe(true);
  });
  it('recupera una carga fallida mediante reintento', async () => {
    let failing = true;
    const repository = new LocalLaunchSitesRepository();
    const dependencies = {
      loadSites: new LoadLaunchSites({
        load: async (signal) => {
          if (failing) throw new Error('unavailable');
          return repository.load(signal);
        },
      }),
    };
    const { result } = renderHook(() => useLaunchSitesViewModel(dependencies));
    await waitFor(() => expect(result.current.status).toBe('error'));
    failing = false;
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.sites).toHaveLength(8));
  });
  it('descarta la respuesta de una carga cancelada al cambiar dependencias', async () => {
    const oldSites = await new LocalLaunchSitesRepository().load();
    let complete!: (value: typeof oldSites) => void;
    const old = {
      loadSites: new LoadLaunchSites({
        load: () =>
          new Promise((resolve) => {
            complete = resolve;
          }),
      }),
    };
    const empty = { loadSites: new LoadLaunchSites({ load: async () => [] }) };
    const { result, rerender } = renderHook(
      ({ dependencies }) => useLaunchSitesViewModel(dependencies),
      { initialProps: { dependencies: old } },
    );
    rerender({ dependencies: empty });
    await waitFor(() => expect(result.current.status).toBe('ready'));
    await act(async () => complete(oldSites));
    expect(result.current.sites).toHaveLength(0);
  });
  it('ofrece reintento y enlace alternativo si el reproductor no carga', async () => {
    const dependencies = { loadSites: new LoadLaunchSites(new LocalLaunchSitesRepository()) };
    const hook = renderHook(() => useLaunchSitesViewModel(dependencies, 'kennedy'));
    await waitFor(() => expect(hook.result.current.selected).not.toBeNull());
    vi.useFakeTimers();
    render(<LaunchVideo site={hook.result.current.selected!} />);
    expect(screen.getByTitle(/Video del lanzamiento/)).not.toHaveAttribute(
      'allow',
      expect.stringContaining('autoplay'),
    );
    act(() => vi.advanceTimersByTime(15000));
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar');
    expect(screen.getByRole('link', { name: /abrir video original/ })).toHaveAttribute(
      'href',
      expect.stringContaining('youtube.com/watch'),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar video' }));
    fireEvent.load(screen.getByTitle(/Video del lanzamiento/));
    act(() => vi.advanceTimersByTime(15000));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('distingue las sedes de los lugares reales de despegue en la tarjeta y el video', async () => {
    const dependencies = { loadSites: new LoadLaunchSites(new LocalLaunchSitesRepository()) };
    const { result } = renderHook(() => useLaunchSitesViewModel(dependencies, 'johnson'));
    await waitFor(() => expect(result.current.selected).not.toBeNull());
    const selected = result.current.selected!;
    expect(selected.pad).toBeNull();
    expect(selected.videoLocation).toContain('Kennedy');
    render(
      <LaunchSitesView
        sites={result.current.sites}
        selected={selected}
        invalidSelection={false}
        globe={<div />}
        onSelect={() => {}}
        onCloseVideo={() => {}}
      />,
    );
    expect(screen.getByRole('article', { name: selected.fullName })).toBeInTheDocument();
    expect(screen.getByText('Esta ubicación no es una plataforma de lanzamiento.')).toBeVisible();
    expect(screen.getByTitle(/Video del lanzamiento/)).toHaveAttribute(
      'title',
      expect.stringContaining('Kennedy'),
    );
    expect(screen.getByTitle(/Video del lanzamiento/)).not.toHaveAttribute(
      'title',
      expect.stringContaining('desde Johnson'),
    );
    expect(screen.getByRole('link', { name: /Fuente de la relación/ })).toHaveAttribute(
      'href',
      selected.relationSourceUrl,
    );
  });
  it('agrupa sedes próximas sin perder lugares, identidad ni coordenadas', async () => {
    const sites = await new LocalLaunchSitesRepository().load();
    const groups = groupNearbyPlaces(sites);
    expect(groups.flat()).toHaveLength(sites.length);
    expect(new Set(groups.flat().map((site) => site.id)).size).toBe(sites.length);
    expect(
      groups.find((group) => group.some((site) => site.id === 'nasa-hq'))?.map((site) => site.id),
    ).toEqual(['nasa-hq', 'goddard']);
    expect(sites.find((site) => site.id === 'johnson')?.latitude).toBe(29.559);
    expect(
      sites.filter((site) => site.kind === 'launch-site').every((site) => site.pad !== null),
    ).toBe(true);
    expect(
      sites.filter((site) => site.kind !== 'launch-site').every((site) => site.pad === null),
    ).toBe(true);
  });
  it('la vista general muestra todas las opciones y selecciona lugar o video sin cargar reproductores', async () => {
    const dependencies = { loadSites: new LoadLaunchSites(new LocalLaunchSitesRepository()) };
    const { result } = renderHook(() => useLaunchSitesViewModel(dependencies));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const onSelect = vi.fn();
    const { container } = render(
      <EarthOverview sites={result.current.sites} onSelect={onSelect} />,
    );
    expect(container.querySelectorAll('.earth-place-card')).toHaveLength(8);
    expect(container.querySelectorAll('.earth-video-card')).toHaveLength(3);
    expect(container.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Centro Espacial Johnson/ }));
    expect(onSelect).toHaveBeenLastCalledWith('johnson');
    fireEvent.click(
      within(screen.getByRole('region', { name: 'Videos de despegue disponibles' })).getByRole(
        'button',
        { name: /InSight/ },
      ),
    );
    expect(onSelect).toHaveBeenLastCalledWith('vandenberg');
  });
  it('cada estación o sede tiene un video identificable con el origen real del despegue', async () => {
    const dependencies = { loadSites: new LoadLaunchSites(new LocalLaunchSitesRepository()) };
    const { result } = renderHook(() => useLaunchSitesViewModel(dependencies));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const origins: Record<string, string> = {
      kennedy: 'Kennedy',
      vandenberg: 'Vandenberg',
      kourou: 'Kourou',
      'nasa-hq': 'Vandenberg',
      johnson: 'Kennedy',
      goddard: 'Kourou',
      marshall: 'Kennedy',
      jpl: 'Vandenberg',
    };
    const renderView = (id: string) => (
      <LaunchSitesView
        sites={result.current.sites}
        selected={result.current.sites.find((site) => site.id === id)!}
        invalidSelection={false}
        globe={<div />}
        onSelect={() => {}}
        onCloseVideo={() => {}}
      />
    );
    const { rerender, container } = render(renderView('kennedy'));
    for (const [id, origin] of Object.entries(origins)) {
      rerender(renderView(id));
      expect(screen.getByRole('complementary', { name: 'Detalle del lugar' })).toHaveFocus();
      expect(container.querySelectorAll('iframe')).toHaveLength(1);
      expect(screen.getByTitle(/Video del lanzamiento/)).toHaveAttribute(
        'title',
        expect.stringContaining(origin),
      );
      expect(screen.getByRole('region', { name: /Video de despegue ·/ })).toHaveTextContent(
        'Despegue desde:',
      );
      const video = container.querySelector('.launch-video')!;
      const description = screen.getByRole('heading', { name: 'Sobre este lugar' });
      expect(
        video.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).not.toBe(0);
    }
  });
});
