'use client';

import { useEffect, useRef } from 'react';
import { publicAsset } from '../publicAsset';

export function TumiLoadingAnimation({ paused }: { paused: boolean }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function updatePlayback() {
      if (!element) return;
      if (paused || motion.matches || document.hidden) {
        element.pause();
      } else {
        void element.play().catch(() => {
          // The poster remains visible when the browser prevents playback.
        });
      }
    }
    updatePlayback();
    motion.addEventListener('change', updatePlayback);
    document.addEventListener('visibilitychange', updatePlayback);
    return () => {
      element.pause();
      motion.removeEventListener('change', updatePlayback);
      document.removeEventListener('visibilitychange', updatePlayback);
    };
  }, [paused]);

  return (
    <div className="tumi-loading-animation" aria-hidden="true">
      <video
        ref={video}
        className="tumi-loading-video"
        src={publicAsset('/brand/tumi-loading-spin.mp4')}
        poster={publicAsset('/brand/tumi-loading-spin-poster.png')}
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
      />
      <svg className="tumi-loading-still" viewBox="0 0 308 308" focusable="false">
        <image href={publicAsset('/brand/tumi-loading-spin-poster.png')} width={308} height={308} />
      </svg>
    </div>
  );
}
