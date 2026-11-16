import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import './tumi-portrait.css';

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

type Pose =
  | 'smile'
  | 'laugh'
  | 'delight'
  | 'blink'
  | 'wink'
  | 'neutral'
  | 'sad'
  | 'alert'
  | 'focus'
  | 'error';

const eyePaths: Record<Pose, string> = {
  smile: 'M109 203 C119 190 136 190 145 203 M181 203 C190 190 207 190 217 203',
  laugh: 'M109 203 C119 190 136 190 145 203 M181 203 C190 190 207 190 217 203',
  delight: 'M110 189 L139 201 L111 212 M215 189 L186 201 L214 212',
  blink: 'M109 198 Q127 215 145 198 M181 198 Q199 215 217 198',
  wink: 'M126 193 V206 M214 190 L189 202 L215 210',
  neutral: 'M126 192 V207 M199 192 V207',
  sad: 'M110 200 Q128 211 141 193 M185 193 Q198 211 216 200',
  alert: 'M125 194 V207 M200 194 V207',
  focus: 'M112 193 L142 202 M184 202 L214 193',
  error: 'M113 191 L139 212 M139 191 L113 212 M187 191 L213 212 M213 191 L187 212',
};

const poses: Partial<Record<TumiEmotion, Pose>> = {
  angry: 'focus',
  happy: 'smile',
  joy: 'laugh',
  wink: 'wink',
  laughing: 'delight',
  surprised: 'alert',
  curious: 'wink',
  understanding: 'blink',
  approved: 'smile',
  amazed: 'alert',
  focused: 'focus',
  motivated: 'smile',
  achieved: 'delight',
  doubtful: 'sad',
  confused: 'wink',
  worried: 'sad',
  sad: 'sad',
  tired: 'blink',
  sleeping: 'blink',
  error: 'error',
  greeting: 'smile',
  online: 'smile',
  farewell: 'smile',
};

const badges: Partial<Record<TumiEmotion, string>> = {
  curious: '?',
  doubtful: '?',
  confused: '?',
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

function Face({ pose, blush = false }: { pose: Pose; blush?: boolean }) {
  const open = pose === 'laugh' || pose === 'delight';
  const concerned = pose === 'sad' || pose === 'focus' || pose === 'error';
  return (
    <>
      <g className="tumi-tech-eyes">
        <path d={eyePaths[pose]} strokeWidth="13" opacity=".13" />
        <path d={eyePaths[pose]} strokeWidth="8" />
      </g>
      <g className="cursor-assistant-mouth" strokeWidth="5.5">
        {open ? (
          <path
            d="M151 222 Q163 224 175 222 Q174 244 163 244 Q152 244 151 222Z"
            fill="currentColor"
          />
        ) : pose === 'alert' ? (
          <ellipse cx="163" cy="228" rx="6" ry="8" fill="currentColor" />
        ) : (
          <path d={concerned ? 'M153 232 Q163 220 173 232' : 'M151 224 Q163 239 175 224'} />
        )}
      </g>
      {blush && <path d="M108 222h11m88 0h11" stroke="#f38dae" strokeWidth="4.5" opacity=".8" />}
    </>
  );
}

export function TumiTechPortrait({
  id,
  emotion,
  motion = 'subtle',
  paused = false,
  label = 'Nami IA, cabeza tecnológica dorada con visor turquesa',
  decorative = false,
}: {
  id: string;
  emotion: TumiEmotion;
  motion?: 'subtle' | 'celebrate' | 'still';
  paused?: boolean;
  label?: string;
  decorative?: boolean;
}) {
  const t = useTranslation();
  const fill = (name: string) => `url(#${id}-${name})`;
  const pose = poses[emotion] ?? 'neutral';
  const canBlink = pose === 'smile' || pose === 'neutral' || pose === 'wink';
  const badge = badges[emotion];
  return (
    <svg
      className="tumi-portrait"
      data-tumi-motion={motion}
      data-tumi-paused={paused}
      data-tumi-emotion={emotion}
      viewBox={motion === 'celebrate' ? '0 0 312 295' : '20 45 278 251'}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={t(decorative ? undefined : label)}
      focusable="false"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id={`${id}-gold`} x1="14%" y1="0%" x2="80%" y2="100%">
          <stop stopColor="#fff0a1" />
          <stop offset=".27" stopColor="#ffcd54" />
          <stop offset=".56" stopColor="#f59b23" />
          <stop offset=".78" stopColor="#db7e14" />
          <stop offset=".9" stopColor="#ffc652" />
          <stop offset="1" stopColor="#a85213" />
        </linearGradient>
        <linearGradient id={`${id}-ring`} x2="74%" y2="100%">
          <stop stopColor="#fff8c4" />
          <stop offset=".3" stopColor="#ffcf50" />
          <stop offset=".57" stopColor="#e58818" />
          <stop offset=".81" stopColor="#ffca44" />
          <stop offset="1" stopColor="#9c4e10" />
        </linearGradient>
        <linearGradient id={`${id}-bronze`} x2="12%" y2="100%">
          <stop stopColor="#cf924b" />
          <stop offset=".55" stopColor="#a76129" />
          <stop offset="1" stopColor="#714119" />
        </linearGradient>
        <linearGradient id={`${id}-cyan`} x2="25%" y2="100%">
          <stop stopColor="#d5ffff" />
          <stop offset=".28" stopColor="#74f6ff" />
          <stop offset=".72" stopColor="#19c9e8" />
          <stop offset="1" stopColor="#087997" />
        </linearGradient>
        <radialGradient id={`${id}-visor`} cx="48%" cy="42%" r="66%">
          <stop stopColor="#164459" />
          <stop offset=".58" stopColor="#0e2a42" />
          <stop offset="1" stopColor="#071322" />
        </radialGradient>
      </defs>
      <g className="tumi-portrait-body" stroke="#251710" strokeWidth="4.3" strokeLinejoin="round">
        <g className="tumi-portrait-face">
          <g className="tumi-portrait-earcups">
            <path
              d="M81 176 C56 176 39 191 39 212 C39 231 55 243 76 241 L93 226Z"
              fill={fill('gold')}
            />
            <path
              d="M241 176 C264 177 280 191 280 212 C280 231 265 243 245 241 L228 226Z"
              fill={fill('gold')}
            />
            <path
              d="M51 193 Q44 212 51 227 M267 193 Q275 212 267 227"
              stroke={fill('cyan')}
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />
          </g>
          <path
            d="M69 205 C69 160 102 140 158 139 C215 138 252 165 252 207 C252 247 219 280 161 281 C104 282 72 252 69 205Z"
            fill={fill('ring')}
          />
          <path
            d="M73 205 C73 242 104 272 155 276 C198 279 231 260 244 231"
            fill="none"
            stroke="#8c4713"
            strokeWidth="2.2"
            opacity=".7"
          />
          <path
            d="M86 204 C86 171 116 153 159 153 C204 153 236 175 236 207 C236 237 207 259 161 260 C117 261 88 238 86 204Z"
            fill={fill('visor')}
            stroke="#3c260f"
          />
          <path
            d="M90 215 C98 245 126 257 159 257 C194 257 217 246 229 224"
            fill="none"
            stroke="#ffe890"
            strokeWidth="2.3"
            opacity=".75"
          />
          <path
            d="M98 190 C122 164 196 162 219 190"
            fill="none"
            stroke="#60c0d8"
            strokeWidth="2"
            opacity=".16"
            strokeLinecap="round"
          />
          <g
            className="tumi-portrait-features"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
          >
            <g className="tumi-portrait-idle" data-blinks={canBlink}>
              <g key={emotion} className="tumi-portrait-expression">
                <Face pose={pose} blush={emotion === 'shy'} />
              </g>
            </g>
            <g className="tumi-portrait-blink">
              <Face pose="blink" />
            </g>
            {motion === 'celebrate' && (
              <>
                <g className="tumi-portrait-laugh">
                  <Face pose="laugh" />
                </g>
                <g className="tumi-portrait-delight">
                  <Face pose="delight" />
                </g>
              </>
            )}
          </g>
        </g>
        <g className="tumi-portrait-helmet">
          <path
            d="M45 147 C64 110 96 88 131 81 C186 69 244 98 271 143 C261 158 246 166 229 169 Q163 112 87 169 C67 164 54 156 45 147Z"
            fill={fill('gold')}
          />
          <path
            d="M46 146 Q63 151 80 165 M270 143 Q257 149 245 164"
            fill="none"
            stroke="#8a4a18"
            strokeWidth="5"
            opacity=".75"
          />
          <path
            d="M55 141 C71 118 92 104 117 98 M211 94 C231 105 248 120 260 138"
            stroke="#fff3ab"
            strokeWidth="3.4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M97 120 Q110 110 122 106 L112 76 C137 62 181 61 213 75 L205 106 Q220 111 231 120 L220 134 L185 117 V91 Q163 85 140 91 V117 L106 134Z"
            fill={fill('bronze')}
          />
          <path
            d="M118 78 C145 67 182 67 207 77"
            fill="none"
            stroke="#ffe0a0"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M69 181 C69 151 101 121 140 114 V94 Q162 87 186 94 V114 C226 122 253 148 253 181 Q253 190 247 191 C221 158 188 151 160 152 C130 151 95 159 74 192 Q68 188 69 181Z"
            fill={fill('gold')}
          />
          <path
            d="M75 172 C93 142 123 130 158 129 C196 128 227 142 246 171"
            fill="none"
            stroke="#321c10"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M79 163 C99 137 126 125 155 123 C192 121 225 136 243 163"
            fill="none"
            stroke="#fff1a2"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {motion === 'celebrate' && (
            <path
              className="tumi-portrait-underside"
              d="M74 181 C95 152 126 146 158 146 C194 146 231 155 248 181 C236 196 86 198 74 181Z"
              fill={fill('visor')}
            />
          )}
          <path d="M127 130 Q162 116 197 129 L186 161 Q162 156 139 161Z" fill={fill('ring')} />
          <path
            d="M140 134 Q161 128 185 134 L179 151 Q162 147 146 151Z"
            fill={fill('cyan')}
            stroke="#47311a"
            strokeWidth="2.4"
          />
          <path
            d="M145 135 Q162 132 180 135"
            fill="none"
            stroke="#ddffff"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      </g>
      {motion === 'celebrate' && (
        <path
          className="tumi-portrait-sparkles"
          d="M38 143q4 12 15 15q-11 4-15 16q-3-12-15-16q12-3 15-15ZM273 133q4 11 15 15q-11 4-15 15q-4-11-15-15q11-4 15-15Z"
          fill="#ffe188"
          stroke="#b87526"
          strokeWidth="1.2"
        />
      )}
      {motion !== 'celebrate' && badge && (
        <text
          key={emotion}
          className="tumi-portrait-badge"
          x="258"
          y="99"
          textAnchor="middle"
          fontSize="28"
          fontWeight="750"
          fill={emotion === 'error' ? '#ff979e' : '#90f5ff'}
          stroke="#102638"
          strokeWidth="1.8"
          paintOrder="stroke"
        >
          {t(badge)}
        </text>
      )}
    </svg>
  );
}
