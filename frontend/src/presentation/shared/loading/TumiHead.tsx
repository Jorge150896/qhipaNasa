'use client';
import { useId } from 'react';

/** Original reference pixels, revealed in independently animated SVG layers. */
export function TumiHead() {
  const id = useId();
  return (
    <svg className="tumi-head" viewBox="-25 -80 630 650" aria-hidden="true" focusable="false">
      <defs>
        <image
          id={`${id}-original`}
          href="/brand/tumi-head-reference.png"
          width="576"
          height="498"
        />
        {/* The crown ends above the decorated forehead band. The base overlaps this seam
            slightly so a small secondary bounce never splits the face or exposes a gap. */}
        <clipPath id={`${id}-hat`}>
          <path d="M20 46 C121 -21 432 7 561 270 Q575 291 576 316 L490 344 Q456 332 435 337 L436 329 C368 178 158 128 94 187 L87 190 L57 134 L25 73Z" />
        </clipPath>
        <clipPath id={`${id}-head`}>
          <path d="M85 165 C47 157 16 182 13 215 C8 253 39 287 82 286 C77 319 85 351 110 381 C156 428 218 455 275 456 Q332 460 377 436 C390 483 429 503 473 491 C515 480 542 431 527 390 C514 351 475 331 435 337 L436 325 C368 174 158 124 94 183Z" />
        </clipPath>
        <clipPath id={`${id}-mouth`}>
          <path d="M184 317 L252 332 L246 369 L220 388 L190 381 L179 353Z" />
        </clipPath>
        <filter id={`${id}-soft-edge`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <mask
          id={`${id}-calm-blend`}
          maskUnits="userSpaceOnUse"
          x="168"
          y="305"
          width="96"
          height="100"
        >
          <path
            d="M184 317 L252 332 L246 369 L220 388 L190 381 L179 353Z"
            fill="white"
            filter={`url(#${id}-soft-edge)`}
          />
        </mask>
      </defs>
      <ellipse className="tumi-ground-shadow" cx="288" cy="528" rx="122" ry="13" />
      <g className="tumi-jump">
        <g clipPath={`url(#${id}-head)`}>
          <use href={`#${id}-original`} />
        </g>
        <g className="tumi-mouth-calm" mask={`url(#${id}-calm-blend)`}>
          <use href={`#${id}-original`} transform="translate(-336 -570) scale(2 2.5)" />
          <path
            d="M198 347 Q210 358 227 352"
            fill="none"
            stroke="#47251c"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
        <g className="tumi-mouth-smile" clipPath={`url(#${id}-mouth)`}>
          <use href={`#${id}-original`} />
        </g>
        <g className="tumi-hat" clipPath={`url(#${id}-hat)`}>
          <use href={`#${id}-original`} />
        </g>
      </g>
      <g className="tumi-tech-glints" fill="#ffe2a3">
        <path d="M37 328 l4 8 8 4 -8 4 -4 8 -4 -8 -8 -4 8 -4Z" />
        <path d="M530 210 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3Z" />
      </g>
    </svg>
  );
}
