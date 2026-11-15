import type { ExplorerPanel } from '../types';

export function ExplorerTabs({
  active,
  onSelect,
}: {
  active: ExplorerPanel;
  onSelect(panel: ExplorerPanel): void;
}) {
  const tabs = [
    { id: 'network', label: 'Mapa espacial' },
    { id: 'launches', label: 'Despegues de la Tierra' },
    { id: 'mars', label: 'Mapa de Marte' },
    { id: 'earth', label: 'Todo de la Tierra' },
  ] as const;
  return (
    <div className="explorer-tabs" role="tablist" aria-label="Vistas del explorador">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          id={`explorer-tab-${tab.id}`}
          role="tab"
          aria-selected={active === tab.id}
          aria-controls="explorer-panel"
          tabIndex={active === tab.id ? 0 : -1}
          onClick={() => onSelect(tab.id)}
          onKeyDown={(event) => {
            if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? tabs.length - 1
                  : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
            event.currentTarget.parentElement?.querySelectorAll('button')[next]?.focus();
            onSelect(tabs[next].id);
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
