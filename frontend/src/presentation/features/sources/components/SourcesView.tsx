import { Icon } from '@/ui/Icon';
import { Panel } from '@/ui/Panel';
export function SourcesView() {
  return (
    <>
      <Panel>
        <div className="panel-heading">
          <Icon name="book" />
          <div>
            <span className="eyebrow">TRANSPARENCIA DEL PROTOTIPO</span>
            <h3>Qué representa esta aplicación</h3>
          </div>
        </div>
        <div className="source-list">
          <article>
            <span className="badge">Consumidor configurable</span>
            <h3>Sesiones de monitoreo asistido</h3>
            <p>
              Preparación, captura, repetición, revisión y guardado local. El modo API exige una URL
              y un sujeto propios; no sustituye errores por datos simulados. El contrato es
              provisional y todavía no hay proveedor conectado. El modo demo conserva el origen
              sintético. Los indicadores no determinan diagnóstico ni aptitud para una actividad.
            </p>
          </article>
          <article>
            <span className="badge">Referencia educativa</span>
            <h3>Salud por sistemas · NASA HHC</h3>
            <p>
              Explicaciones de riesgos cardiovasculares, ejercicio, visión, equilibrio, nutrición,
              inmunidad y EVA. Los autorregistros, comparaciones y revisiones son funciones de
              demostración del equipo; no son un protocolo clínico de NASA. No hay telemetría real
              ni diagnóstico automático.
            </p>
            <a
              href="https://www.nasa.gov/hrp/human-health-countermeasures/"
              target="_blank"
              rel="noreferrer"
            >
              Consultar Human Health Countermeasures
              <Icon name="arrow" size={14} />
            </a>
          </article>
          <article>
            <span className="badge">Implementado</span>
            <h3>Lecturas y escenarios sintéticos</h3>
            <p>
              Tripulación ficticia por hábitat, cuatro indicadores corporales, tres zonas
              ambientales y ocho muestras por indicador. El explorador reúne 12 personas únicas en
              cuatro hábitats. Todos usan el mismo generador de escenarios sintéticos; no son
              misiones reales. La fecha y el origen se muestran en la interfaz.
            </p>
          </article>
          <article>
            <span className="badge">Implementado</span>
            <h3>Modelo visual del astronauta</h3>
            <p>
              “Astronaut” de Poly by Google, licencia CC BY 2.0, distribuido en model-viewer.
              Textura optimizada; geometría sin cambios. Servido desde esta aplicación. No
              representa la anatomía ni las características reales de los tripulantes.
            </p>
            <a
              href="https://github.com/google/model-viewer/tree/v3.5.0/packages/shared-assets/models"
              target="_blank"
              rel="noreferrer"
            >
              Consultar colección de origen <Icon name="arrow" size={14} />
            </a>
          </article>
          <article>
            <span className="badge amber">Pendiente</span>
            <h3>Datasets y reglas clínicas</h3>
            <p>
              Las explicaciones enlazan fuentes educativas de NASA. La integración de datasets y
              criterios clínicos validados sigue pendiente. Los números de la demo son sintéticos y
              no constituyen umbrales médicos.
            </p>
            <a
              href="https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/"
              target="_blank"
              rel="noreferrer"
            >
              Consultar el reto de salud de astronautas <Icon name="arrow" size={14} />
            </a>
          </article>
          <article>
            <span className="badge amber">Pendiente</span>
            <h3>Backend e inteligencia artificial</h3>
            <p>
              Java con Spring Boot será la autoridad de datos y operaciones. El copiloto actual usa
              textos de escenario, sin llamadas a modelos de IA, diagnóstico ni prescripción.
            </p>
          </article>
          <article>
            <span className="badge">Solo navegador</span>
            <h3>Persistencia del diario</h3>
            <p>
              Los registros ficticios permanecen en el almacenamiento local de este navegador. No
              hay sincronización ni modo offline completo: una visita nueva necesita cargar la
              aplicación.
            </p>
          </article>
        </div>
      </Panel>
    </>
  );
}
