import { useId } from 'react';
import { TumiTechPortrait, type TumiEmotion } from './TumiTechPortrait';

export function TumiAvatar({ emotion = 'happy' }: { emotion?: TumiEmotion }) {
  const id = useId();
  return (
    <span className="tumi-avatar">
      <TumiTechPortrait id={id} emotion={emotion} decorative />
    </span>
  );
}
