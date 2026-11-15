import Link from 'next/link';
import { Icon } from '@/ui/Icon';
import { Panel } from '@/ui/Panel';

const research = [
  {
    title: 'Cinco peligros del vuelo espacial',
    description: 'Contexto para relacionar la misión, el entorno y la salud de la tripulación.',
    url: 'https://www.nasa.gov/hrp/hazards/',
  },
  {
    title: 'Riesgos de salud del vuelo espacial',
    description: 'Fundamento para explicar áreas como visión, ejercicio y salud cardiovascular.',
    url: 'https://www.nasa.gov/hrp/risks/',
  },
  {
    title: 'Investigaciones de NASA en el espacio',
    description: 'Incluye ARCHeR, referencia para los registros de sueño, actividad y bienestar.',
    url: 'https://www.nasa.gov/hrp/ongoing-hrp-research/',
  },
  {
    title: 'Human Health Countermeasures',
    description: 'Referencia educativa que acompaña la autoevaluación por sistemas.',
    url: 'https://www.nasa.gov/hrp/human-health-countermeasures/',
  },
  {
    title: 'Monitoreo de radiación de la Agencia Espacial Canadiense',
    description: 'Describe CANS, un instrumento para medir radiación de neutrones.',
    url: 'https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp',
  },
  {
    title: 'Por qué se hacen experimentos en el espacio',
    description: 'Explica cómo la investigación en órbita prepara misiones a la Luna y Marte.',
    url: 'https://www.csa-asc.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp',
  },
];

export function SourcesView({ nasaHistoryHref }: { nasaHistoryHref: string }) {
  return (
    <>
      <Panel label="Origen de los datos">
        <div className="panel-heading">
          <Icon name="book" />
          <h2>Origen de los datos</h2>
        </div>
        <div className="source-list">
          <article>
            <span className="badge">Consumidor configurable</span>
            <h3>Sesiones de monitoreo asistido</h3>
            <p>
              Las lecturas de demostración son sintéticas. El modo API requiere una URL y un sujeto
              configurados. Los indicadores no determinan diagnóstico ni aptitud.
            </p>
          </article>
          <article>
            <span className="badge">Datos históricos reales</span>
            <h3>Inspiration4 · OSD-575</h3>
            <p>
              Historial muestra medianas por fase de glucosa, sodio y potasio de cuatro
              participantes del estudio de Inspiration4, publicado en NASA Open Science Data
              Repository. Es una referencia de laboratorio independiente de las lecturas de Odyssey
              01.
            </p>
            <p>DOI 10.26030/mc5d-p710 · CC0 1.0</p>
            <p>
              <Link href={nasaHistoryHref}>
                Ver datos de Inspiration4 en Historial <Icon name="arrow" size={14} />
              </Link>
            </p>
            <a href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-575">
              Abrir el estudio OSD-575 <Icon name="arrow" size={14} />
            </a>
          </article>
          <article>
            <span className="badge">Archivo NASA</span>
            <h3>Radiación histórica de NASA RadLab</h3>
            <p>
              En Entorno puedes consultar la radiación ambiental de DosTel1 en Columbus y el
              historial de cabina de la ISS. El mapa de Marte muestra una lectura exterior de
              Curiosity en el cráter Gale.
            </p>
          </article>
          <article>
            <span className="badge">Datos simulados</span>
            <h3>Lecturas de la misión</h3>
            <p>
              El escenario genera el pulso, la temperatura corporal, la SpO₂, la respiración y las
              condiciones ambientales. Tripulación e Historial muestran su fecha, unidad y origen.
            </p>
          </article>
          <article>
            <span className="badge">Entrada manual</span>
            <h3>Chequeo diario y autorregistros</h3>
            <p>
              El usuario introduce observaciones y datos de demostración, como horas de sueño,
              fatiga o duración del ejercicio. Se guardan en este navegador.
            </p>
          </article>
        </div>
      </Panel>

      <Panel label="Investigación de referencia">
        <div className="panel-heading">
          <h2>Investigación de referencia</h2>
          <a href="https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/?tab=resources">
            Recursos del reto Space Apps
          </a>
        </div>
        <ul className="source-list" role="list">
          {research.map(({ title, description, url }) => (
            <li key={url}>
              <article>
                <h3>
                  <a href={url}>
                    {title} <Icon name="arrow" size={14} />
                  </a>
                </h3>
                <p>{description}</p>
              </article>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel label="Alcance del prototipo">
        <h2>Alcance del prototipo</h2>
        <p>
          Tumi explica los datos de demostración con contenido del proyecto. La conexión a sensores
          e IA y la validación de criterios clínicos quedan pendientes. El diario se conserva
          localmente y la aplicación requiere conexión para una primera visita.
        </p>
        <p>
          Modelo “Astronaut” de Poly by Google, con licencia CC BY 2.0.{' '}
          <a href="https://github.com/google/model-viewer/blob/v3.5.0/packages/shared-assets/models/Astronaut.glb">
            Consultar el modelo original <Icon name="arrow" size={14} />
          </a>
        </p>
      </Panel>
    </>
  );
}
