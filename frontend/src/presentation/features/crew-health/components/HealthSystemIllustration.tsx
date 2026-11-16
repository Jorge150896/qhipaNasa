import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useId, useState } from 'react';
import type { HealthSystemContent } from '../types';

/** Conceptual drawings: no measurements, patient-specific anatomy or clinical simulation. */
function SystemDrawing({ system }: { system: HealthSystemContent['id'] }) {
  const t = useTranslation();
  switch (system) {
    case 'cardio':
      return (
        <>
          <path
            className="health-flow"
            d="M213 134 C120 78 98 204 160 229 C210 253 288 224 282 160 C280 112 244 96 213 134Z"
          />
          <path
            className="health-organ health-beat"
            d="M210 137 C172 92 133 137 157 174 L210 222 L263 174 C287 137 248 92 210 137Z"
          />
          <path
            className="health-trace"
            d="M50 274 H133 L147 255 L160 292 L178 265 L188 274 H370"
          />
          <text x="210" y="65">
            {t('CIRCULACIÓN')}
          </text>
          <text x="210" y="321">
            {t('Pulso · oxigenación · respiración')}
          </text>
        </>
      );
    case 'vision':
      return (
        <>
          <path className="health-organ" d="M63 180 Q210 52 357 180 Q210 308 63 180Z" />
          <circle className="health-eye" cx="210" cy="180" r="52" />
          <circle className="health-pupil health-breathe" cx="210" cy="180" r="23" />
          <path className="health-flow" d="M80 180 H157 M263 180 H339" />
          <path className="health-guide" d="M210 234 V279" />
          <text x="210" y="65">
            {t('SISTEMA NEUROOCULAR')}
          </text>
          <text x="210" y="312">
            {t('Observación visual ≠ examen ocular')}
          </text>
        </>
      );
    case 'fitness':
      return (
        <>
          <g className="health-exercise">
            <path
              className="health-organ"
              d="M137 119 Q175 150 162 197 L134 249 Q181 282 233 241 L266 190 Q273 164 251 149 L232 175 Q202 204 188 170 L184 116Z"
            />
            <path className="health-bone" d="M154 129 L177 207 L239 183" />
            <path className="health-guide" d="M145 235 Q190 246 218 217" />
          </g>
          <path className="health-flow" d="M294 238 Q344 183 306 127" />
          <text x="210" y="65">
            {t('MOVIMIENTO Y CARGA')}
          </text>
          <text x="210" y="321">
            {t('Actividad registrada ≠ fuerza medida')}
          </text>
        </>
      );
    case 'balance':
      return (
        <>
          <g className="health-sway">
            <circle className="health-organ" cx="210" cy="119" r="29" />
            <path
              className="health-bone"
              d="M210 154 V224 M148 180 L210 160 L272 180 M210 224 L172 276 M210 224 L248 276"
            />
          </g>
          <ellipse className="health-guide" cx="210" cy="202" rx="135" ry="39" />
          <path className="health-flow" d="M83 212 Q65 111 152 98 M337 192 Q356 274 279 282" />
          <text x="210" y="49">
            {t('ORIENTACIÓN Y COORDINACIÓN')}
          </text>
          <text x="210" y="330">
            {t('Cambios de gravedad · contexto de actividad')}
          </text>
        </>
      );
    case 'nutrition':
      return (
        <>
          <path
            className="health-organ"
            d="M188 103 V152 C255 121 289 176 263 224 C244 267 151 268 146 221 C142 194 158 183 188 186 V103Z"
          />
          <path className="health-flow" d="M205 89 V162 Q278 156 246 212 Q212 249 169 226" />
          <circle className="health-particle" cx="205" cy="118" r="7" />
          <text x="210" y="53">
            {t('REGISTRO ALIMENTARIO')}
          </text>
          <text x="210" y="321">
            {t('Anotar ingesta · conservar contexto')}
          </text>
        </>
      );
    case 'immune':
      return (
        <>
          <path
            className="health-organ"
            d="M210 100 L280 130 V195 Q274 245 210 276 Q146 245 140 195 V130Z"
          />
          <circle className="health-eye health-breathe" cx="210" cy="184" r="37" />
          <path className="health-bone" d="M195 184 H225 M210 169 V199" />
          {[
            [-94, 3],
            [103, -30],
            [99, 72],
          ].map(([x, y], index) => (
            <circle key={index} className="health-particle" cx={210 + x} cy={160 + y} r="13" />
          ))}
          <text x="210" y="53">
            {t('RESPUESTA INMUNITARIA')}
          </text>
          <text x="210" y="326">
            {t('Temperatura ≠ función inmunitaria')}
          </text>
        </>
      );
    case 'eva':
      return (
        <>
          <circle className="health-organ" cx="210" cy="119" r="36" />
          <path
            className="health-organ"
            d="M180 158 H240 L269 218 L249 230 L236 204 V274 H214 V227 H206 V274 H184 V204 L171 230 L151 218Z"
          />
          <path className="health-eye" d="M185 112 Q210 97 235 112 V131 Q210 144 185 131Z" />
          <ellipse className="health-flow" cx="210" cy="179" rx="132" ry="112" />
          <text x="210" y="40">
            {t('PERSONA · TRAJE · ENTORNO')}
          </text>
          <text x="210" y="327">
            {t('Datos del hábitat ≠ sensores del traje')}
          </text>
        </>
      );
  }
}

export function HealthSystemIllustration({ system }: { system: HealthSystemContent }) {
  const t = useTranslation();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const captionId = useId();
  const steps = [
    { title: 'En el espacio', text: system.overview },
    { title: 'Qué observar', text: system.explanation },
    { title: 'Qué no concluye', text: system.limitation },
  ];
  return (
    <div className={`health-visual ${paused ? 'is-paused' : ''}`} data-step={step}>
      <div className="health-visual-toolbar">
        <span>
          {t('EXPLORADOR VISUAL / ')}
          {t(system.shortLabel.toUpperCase())}
        </span>
        <button className="text-button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {t(paused ? 'Reanudar ilustración' : 'Pausar ilustración')}
        </button>
      </div>
      <svg
        viewBox="0 0 420 355"
        role="img"
        aria-label={t(`Esquema conceptual: ${system.label}`)}
        aria-describedby={captionId}
      >
        <g className="health-visual-grid" fill="none">
          <circle cx="210" cy="180" r="135" />
          <circle cx="210" cy="180" r="109" />
          <path d="M30 180 H390 M210 25 V335" />
        </g>
        <SystemDrawing system={system.id} />
      </svg>
      <div className="health-visual-steps" role="group" aria-label={t('Pasos de la explicación')}>
        {steps.map((item, index) => (
          <button
            key={item.title}
            aria-pressed={step === index}
            aria-controls={captionId}
            onClick={() => setStep(index)}
          >
            <span>0{index + 1}</span>
            {t(item.title)}
          </button>
        ))}
      </div>
      <p className="health-visual-caption" id={captionId} aria-live="polite">
        {t(steps[step].text)}
      </p>
      <small>
        {t(
          'Esquema educativo, anatomía simplificada. Movimiento ilustrativo, independiente de los sensores.',
        )}
      </small>
    </div>
  );
}
