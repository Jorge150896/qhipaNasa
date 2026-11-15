export function TumiModeOptions({
  following,
  onChangeMode,
}: {
  following: boolean;
  onChangeMode(following: boolean): void;
}) {
  return (
    <div className="assistant-mode" role="group" aria-label="Modo de Tumi">
      <span>Modo</span>
      <button type="button" aria-pressed={!following} onClick={() => onChangeMode(false)}>
        Autónomo
      </button>
      <button type="button" aria-pressed={following} onClick={() => onChangeMode(true)}>
        Guía local
      </button>
    </div>
  );
}
