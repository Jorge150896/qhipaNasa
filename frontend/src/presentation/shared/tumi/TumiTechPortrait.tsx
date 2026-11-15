export type TumiEmotion =
  | 'angry'
  | 'neutral'
  | 'happy'
  | 'joy'
  | 'wink'
  | 'laughing'
  | 'surprised'
  | 'curious'
  | 'thinking'
  | 'understanding'
  | 'approved'
  | 'amazed'
  | 'focused'
  | 'motivated'
  | 'achieved'
  | 'doubtful'
  | 'confused'
  | 'worried'
  | 'sad'
  | 'tired'
  | 'sleeping'
  | 'error'
  | 'greeting'
  | 'searching'
  | 'writing'
  | 'processing'
  | 'loading'
  | 'online'
  | 'farewell'
  | 'shy';

/** Scalable interpretation of the supplied expression board; no raster background or halo. */
export function TumiTechPortrait({ id, emotion }: { id: string; emotion: TumiEmotion }) {
  const happy = [
    'happy',
    'joy',
    'laughing',
    'approved',
    'motivated',
    'achieved',
    'online',
    'greeting',
    'farewell',
  ].includes(emotion);
  const asleep = ['sleeping', 'tired', 'understanding', 'sad'].includes(emotion);
  const worried = ['worried', 'sad', 'doubtful', 'confused', 'error', 'angry'].includes(emotion);
  const focused = emotion === 'focused' || emotion === 'angry';
  const badge: Partial<Record<TumiEmotion, string>> = {
    curious: '?',
    doubtful: '?',
    confused: '??',
    worried: '!',
    error: '!',
    amazed: '✦',
    approved: '✓',
    achieved: '✓',
    motivated: '✦',
    thinking: '···',
    searching: '⌕',
    writing: '···',
    processing: '···',
    loading: '◌',
    sleeping: 'z',
    shy: '♡',
    greeting: '✧',
    farewell: '✧',
    surprised: '!',
  };
  const ink = '#20180f',
    cyan = emotion === 'error' ? '#ff7f86' : '#79f2ff';
  return (
    <svg
      viewBox="0 0 200 180"
      role="img"
      aria-label="Tumi IA, cabeza tecnológica dorada con visor turquesa"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id={id + 'gold'} x2=".8" y2="1">
          <stop stopColor="#fff19a" />
          <stop offset=".45" stopColor="#ffc740" />
          <stop offset="1" stopColor="#a85b18" />
        </linearGradient>
        <radialGradient id={id + 'visor'}>
          <stop stopColor="#153747" />
          <stop offset="1" stopColor="#061322" />
        </radialGradient>
      </defs>
      <g className="tumi-tech-body" stroke={ink} strokeWidth="3.2" strokeLinejoin="round">
        <g className="tumi-tech-crown">
          <path
            d="M17 68 Q43 12 100 10 Q157 12 183 68 L165 83 Q100 48 35 83Z"
            fill={'url(#' + id + 'gold)'}
          />
          <path
            d="M52 53 L71 45 L70 30 Q100 22 130 30 L129 45 L148 53 L141 64 L117 54 L117 39 L83 39 L83 54 L59 64Z"
            fill="#936027"
          />
          <path d="M24 65 Q100 -17 176 65" fill="none" stroke="#ffec90" strokeWidth="3" />
        </g>
        <ellipse cx="25" cy="111" rx="14" ry="24" fill={'url(#' + id + 'gold)'} />
        <ellipse cx="175" cy="111" rx="14" ry="24" fill={'url(#' + id + 'gold)'} />
        <path
          d="M23 95 Q17 111 23 127 M177 95 Q183 111 177 127"
          fill="none"
          stroke="#7cf0fa"
          strokeWidth="6"
        />
        <ellipse cx="100" cy="112" rx="72" ry="54" fill={'url(#' + id + 'gold)'} />
        <ellipse cx="100" cy="116" rx="59" ry="41" fill={'url(#' + id + 'visor)'} />
        <path d="M30 100 Q100 51 170 100 L164 83 Q100 41 36 83Z" fill={'url(#' + id + 'gold)'} />
        <path d="M81 71 Q100 66 119 71 L115 86 L85 86Z" fill={'url(#' + id + 'gold)'} />
        <path d="M88 74 L112 74 L110 81 L90 81Z" fill="#77eff8" strokeWidth="2" />
        <g key={emotion} className="tumi-tech-expression">
          <g
            className="tumi-tech-eyes"
            stroke={cyan}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          >
            {emotion === 'error' ? (
              <path d="M70 107l12 14m0-14l-12 14m48-14l12 14m0-14l-12 14" />
            ) : (
              <>
                {happy ? (
                  <path d="M66 115q9-15 18 0" />
                ) : emotion === 'sad' ? (
                  <path d="M66 112q9 6 18-3" />
                ) : asleep ? (
                  <path d="M66 114q9 9 18 0" />
                ) : focused ? (
                  <path d="M66 108l18 7-12 7" />
                ) : (
                  <path d="M75 108v12" />
                )}
                {emotion === 'wink' || emotion === 'curious' ? (
                  <path d="M126 106l-10 8 12 4" />
                ) : happy ? (
                  <path d="M116 115q9-15 18 0" />
                ) : emotion === 'sad' ? (
                  <path d="M116 109q9 9 18 3" />
                ) : asleep ? (
                  <path d="M116 114q9 9 18 0" />
                ) : focused ? (
                  <path d="M134 108l-18 7 12 7" />
                ) : (
                  <path d="M125 108v12" />
                )}
              </>
            )}
          </g>
          <path
            className="tumi-tech-blink"
            d="M66 114q9 7 18 0m32 0q9 7 18 0"
            fill="none"
            stroke={cyan}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <g
            className="cursor-assistant-mouth"
            stroke={cyan}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          >
            {emotion === 'surprised' ? (
              <ellipse cx="100" cy="135" rx="5" ry="7" fill={cyan} />
            ) : ['joy', 'laughing'].includes(emotion) ? (
              <path d="M89 130h22q-11 20-22 0" fill={cyan} />
            ) : worried ? (
              <path d="M93 137q7-8 14 0" />
            ) : (
              <path d="M94 132q6 5 12 0" />
            )}
          </g>
          {emotion === 'shy' && (
            <g fill="#f48ca1" stroke="none" opacity=".6">
              <ellipse cx="61" cy="130" rx="7" ry="3" />
              <ellipse cx="139" cy="130" rx="7" ry="3" />
            </g>
          )}
          {emotion === 'sad' && <path d="M133 123q-6 8 0 8q6 0 0-8" fill={cyan} stroke="none" />}
        </g>
      </g>
      {badge[emotion] && (
        <text
          className="tumi-tech-badge"
          x="169"
          y="47"
          textAnchor="middle"
          fill={cyan}
          stroke="#092134"
          strokeWidth="1"
          paintOrder="stroke"
          fontSize="25"
          fontWeight="800"
        >
          {badge[emotion]}
        </text>
      )}
    </svg>
  );
}
