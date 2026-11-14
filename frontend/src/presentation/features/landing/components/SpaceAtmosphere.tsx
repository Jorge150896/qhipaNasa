export function SpaceAtmosphere() {
  return (
    <div className="qhipa-atmosphere" aria-hidden="true">
      <div className="qhipa-parallax qhipa-parallax-far">
        <div className="qhipa-background-art" />
      </div>
      <div className="qhipa-vignette" />
      <div className="qhipa-starfield qhipa-parallax qhipa-parallax-mid" />
      <div className="qhipa-parallax qhipa-parallax-near">
        <div className="qhipa-near-planet">
          <span />
        </div>
      </div>
    </div>
  );
}
