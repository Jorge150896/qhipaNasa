/** Alpha-cleaned reference; vector clips animate only the existing features. */
export function TumiPortrait({ id, source }: { id: string; source: string }) {
  const crown =
    'M599 218 C715 215 831 266 895 335 Q907 349 890 365 L798 443 C687 344 509 340 390 443 L303 359 Q291 346 307 329 C380 253 487 220 599 218Z';
  return (
    <svg
      viewBox="285 210 625 440"
      role="img"
      aria-label="Tumi, personaje original dorado y turquesa"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <clipPath id={`${id}-body`}>
          <path d="M373 435 C472 337 694 334 809 442 C855 463 862 510 832 535 Q816 549 774 548 C753 611 695 640 610 640 C537 642 476 628 439 587 C395 609 346 591 315 558 C286 525 293 480 322 455 Q343 438 373 435Z" />
        </clipPath>
        <clipPath id={`${id}-crown`}>
          <path d={crown} />
        </clipPath>
        <clipPath id={`${id}-eyes`}>
          <ellipse cx="551" cy="492" rx="36" ry="24" />
          <ellipse cx="675" cy="508" rx="35" ry="23" />
        </clipPath>
        <clipPath id={`${id}-mouth`}>
          <path d="M588 520 Q609 518 638 528 C638 548 630 568 615 574 C595 578 585 551 588 520Z" />
        </clipPath>
      </defs>
      <g className="cursor-assistant-welcome">
        <g clipPath={`url(#${id}-body)`}>
          <image href={source} width="1156" height="912" />
          <g className="cursor-assistant-blink" clipPath={`url(#${id}-eyes)`}>
            <image href={source} width="1156" height="912" transform="translate(0 54)" />
          </g>
          <g className="cursor-assistant-mouth-bed" clipPath={`url(#${id}-mouth)`}>
            <image href={source} width="1156" height="912" transform="translate(0 70)" />
          </g>
          <g className="cursor-assistant-mouth">
            <g clipPath={`url(#${id}-mouth)`}>
              <image href={source} width="1156" height="912" />
            </g>
          </g>
        </g>
        <g className="cursor-assistant-crown">
          <g clipPath={`url(#${id}-crown)`}>
            <image href={source} width="1156" height="912" />
          </g>
        </g>
      </g>
    </svg>
  );
}
