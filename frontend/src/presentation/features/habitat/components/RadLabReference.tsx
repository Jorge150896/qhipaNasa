import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useId, useState } from 'react';
import { useTumiViewContext } from '../../mission-assistant/useTumiViewContext';
import series from './radlab-dostel1.json';

const readings = series.readings.map(([at, value]) => ({
  at: String(at),
  value: typeof value === 'number' ? value : null,
}));
const values = readings.flatMap(({ value }) => (value === null ? [] : [value]));
const max = Math.max(...values);
const min = Math.min(...values);
const number = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 3 });
const start = Date.parse(series.query.from);
const interval = Date.parse(series.query.to) - start;
const path = readings
  .map(({ at, value }, index) => {
    if (value === null) return '';
    const x = 15 + 610 * ((Date.parse(at) - start) / interval);
    const y = 125 - 105 * ((value - min) / Math.max(max - min, 1));
    return `${index === 0 || readings[index - 1].value === null ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  })
  .join(' ');

export function RadLabReference() {
  const t = useTranslation();
  const id = useId();
  const [open, setOpen] = useState(false);
  useTumiViewContext(
    open ? 'Radiación histórica en la ISS' : undefined,
    [
      `NASA RadLab, módulo Columbus de la ISS, DosTel1. Serie histórica (separada de la simulación) de ${series.query.from} a ${series.query.to}: ${series.count} registros. Rango ${number.format(min)} a ${number.format(max)} µGy/h. UTC asumido para el archivo original.`,
    ],
    1,
  );
  return (
    <details
      className="panel radlab-reference"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>{t('Radiación histórica en la ISS · NASA RadLab')}</summary>
      <p>{t('DosTel1 · Módulo Columbus · 1 de marzo de 2022 · 00:00 a 01:00 UTC')}</p>
      <p className="sub">
        {series.count}
        {t(
          ' registros archivados · Tasa de dosis absorbida en µGy/h · UTC asumido para la serie original',
        )}
      </p>
      <svg viewBox="0 0 640 150" role="img" aria-labelledby={id}>
        <title id={id}>{t('Tendencia de radiación ambiental histórica en Columbus')}</title>
        <path d="M15 15 V125 H625" fill="none" stroke="currentColor" opacity="0.3" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <p className="sub">
        {t('Rango de las lecturas disponibles ·')}
        {t(number.format(min))} a {t(number.format(max))} µGy/h
      </p>
      <details>
        <summary>{t('Consultar lecturas')}</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t('Hora (UTC)')}</th>
                <th>{t('Tasa (µGy/h)')}</th>
              </tr>
            </thead>
            <tbody>
              {readings.map(({ at, value }) => (
                <tr key={at}>
                  <td>{t(at.slice(11, 19))}</td>
                  <td>
                    {t(
                      value === null
                        ? 'Sin lectura'
                        : new Intl.NumberFormat('es-PE', { maximumFractionDigits: 3 }).format(
                            value,
                          ),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <a href={series.source.requestUrl} target="_blank" rel="noreferrer">
        {t('Consultar la serie original en NASA RadLab')}
      </a>
    </details>
  );
}
