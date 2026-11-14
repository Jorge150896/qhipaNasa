import './space-background.css';

export function SpaceBackground({ paused = false }: { paused?: boolean }) {
  return (
    <div className="space-background" aria-hidden="true" data-paused={paused || undefined}>
      <span className="space-background__nebula" />
      <span className="space-background__distant" />
      <span className="space-background__near" />
    </div>
  );
}
