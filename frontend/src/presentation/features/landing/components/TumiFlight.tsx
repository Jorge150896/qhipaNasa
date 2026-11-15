import { publicAsset } from '@/presentation/shared/publicAsset';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

const sprite = publicAsset('/brand/tumi-landing-frames.webp');
const duration = 5200;
const poses = [0, 1450, 1590, 1740, 1920, 2110, 2290, 2460, 2670, 3650, 3810, 4000, 4900];

function poseTransform(frame: number) {
  const column = frame % 4;
  const row = Math.floor(frame / 4);
  return `translate3d(${column * -25}%, ${(row * -100) / 3}%, 0)`;
}

function spriteKeyframes(layer: number): Keyframe[] {
  let transform = poseTransform(layer);
  const frames: Keyframe[] = [{ offset: 0, opacity: 1 - layer, transform }];
  for (let index = 1; index < poses.length; index++) {
    const incoming = index % 2 === layer;
    if (incoming) transform = poseTransform(index % 12);
    const time = poses[index];
    frames.push(
      {
        offset: (time - 50) / duration,
        opacity: incoming ? 0 : 1,
        transform,
        easing: 'ease-in-out',
      },
      { offset: (time + 50) / duration, opacity: incoming ? 1 : 0, transform },
    );
  }
  frames.push({ offset: 1, opacity: 1 - layer, transform });
  return frames;
}

const layerKeyframes = [spriteKeyframes(0), spriteKeyframes(1)];

export function TumiFlight({ motionActive }: { motionActive: boolean }) {
  const still = useRef<HTMLImageElement>(null);
  const transition = useRef<HTMLImageElement>(null);
  const animations = useRef<Animation[]>([]);

  useEffect(() => {
    const base = still.current;
    const overlay = transition.current;
    if (!base?.animate || !overlay?.animate) return;
    const running = [base, overlay].map((layer, index) =>
      layer.animate(layerKeyframes[index], { duration, iterations: Infinity }),
    );
    animations.current = running;
    return () => {
      running.forEach((animation) => animation.cancel());
      animations.current = [];
    };
  }, []);

  useEffect(() => {
    for (const animation of animations.current) {
      if (motionActive) animation.play();
      else animation.pause();
    }
  }, [motionActive]);
  return (
    <div className="qhipa-flight">
      <div className="qhipa-flight-orbit" aria-hidden="true" />
      <div className="qhipa-flight-halo" aria-hidden="true" />
      <div className="qhipa-flight-shadow" aria-hidden="true" />
      <div className="qhipa-tumi-float">
        <div className="qhipa-tumi-frames">
          <Image
            ref={still}
            src={sprite}
            alt="Tumi dorado sonriente que flota y levanta su casco"
            width={1728}
            height={1296}
            unoptimized
            preload
            className="qhipa-tumi-image"
          />
          <Image
            ref={transition}
            src={sprite}
            alt=""
            width={1728}
            height={1296}
            unoptimized
            className="qhipa-tumi-image qhipa-tumi-transition"
          />
        </div>
      </div>
      <span className="qhipa-spark qhipa-spark-one" aria-hidden="true">
        ✦
      </span>
      <span className="qhipa-spark qhipa-spark-two" aria-hidden="true">
        ✧
      </span>
      <span className="qhipa-spark qhipa-spark-three" aria-hidden="true">
        ✦
      </span>
      <div className="qhipa-flight-caption">
        <span /> Un pequeño paso hacia tu bienestar.
      </div>
    </div>
  );
}
