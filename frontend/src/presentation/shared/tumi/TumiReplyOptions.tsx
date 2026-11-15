import type { TumiReplyFormat } from './useTumiReplyAudio';

export function TumiReplyOptions({
  format,
  onChange,
}: {
  format: TumiReplyFormat;
  onChange(format: TumiReplyFormat): void;
}) {
  return (
    <div className="assistant-mode" role="group" aria-label="Formato de respuesta de Tumi">
      <span>Respuesta</span>
      <button type="button" aria-pressed={format === 'text'} onClick={() => onChange('text')}>
        Texto
      </button>
      <button type="button" aria-pressed={format === 'audio'} onClick={() => onChange('audio')}>
        Audio
      </button>
    </div>
  );
}
