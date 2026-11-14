import { SpaceBackground } from '@/presentation/shared/space/SpaceBackground';

export function SpaceAtmosphere({ paused }: { paused: boolean }) {
  return (
    <>
      <SpaceBackground paused={paused} />
      <div className="qhipa-atmosphere" aria-hidden="true">
        <div className="qhipa-parallax qhipa-parallax-near">
          <div className="qhipa-near-planet">
            <span />
          </div>
        </div>
      </div>
    </>
  );
}
