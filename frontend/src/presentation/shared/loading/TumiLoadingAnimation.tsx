'use client';

import { useEffect, useRef } from 'react';
import { publicAsset } from '../publicAsset';
import { removeLoadingBackdrop } from './removeLoadingBackdrop';

export function TumiLoadingAnimation({ paused }: { paused: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = video.current;
    const surface = canvas.current;
    const context = surface?.getContext('2d', { willReadFrequently: true });
    if (!element || !surface || !context) return;
    let frame = 0;
    let disposed = false;
    const poster = new Image();
    function draw(source: CanvasImageSource) {
      if (!context || !surface || disposed) return;
      context.clearRect(0, 0, 308, 308);
      context.drawImage(source, 0, 0, 308, 308);
      const image = context.getImageData(0, 0, 308, 308);
      removeLoadingBackdrop(image.data, 308, 308);
      context.putImageData(image, 0, 0);
    }
    poster.onload = () => {
      if (element.readyState < 2 || motion.matches) draw(poster);
    };
    poster.src = publicAsset('/brand/tumi-loading-spin-poster.png');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function renderFrame() {
      if (disposed) return;
      if (element && element.readyState >= 2) draw(element);
      if (element && !element.paused) frame = requestAnimationFrame(renderFrame);
    }
    function startRendering() {
      cancelAnimationFrame(frame);
      renderFrame();
    }
    function updatePlayback() {
      if (!element) return;
      if (paused || motion.matches || document.hidden) {
        element.pause();
        cancelAnimationFrame(frame);
        if (motion.matches && poster.complete && poster.naturalWidth) draw(poster);
      } else {
        void element.play().catch(() => {
          // The poster remains visible when the browser prevents playback.
        });
      }
    }
    updatePlayback();
    element.addEventListener('playing', startRendering);
    element.addEventListener('seeked', startRendering);
    motion.addEventListener('change', updatePlayback);
    document.addEventListener('visibilitychange', updatePlayback);
    return () => {
      element.pause();
      disposed = true;
      cancelAnimationFrame(frame);
      poster.onload = null;
      element.removeEventListener('playing', startRendering);
      element.removeEventListener('seeked', startRendering);
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
      <canvas ref={canvas} className="tumi-loading-cutout" width={308} height={308} />
    </div>
  );
}
