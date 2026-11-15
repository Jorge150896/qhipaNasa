const source =
  'https://atmos.nmsu.edu/PDS/data/PDS4/msl_rems_bundle/data_calibrated/SOL_00001_00089/SOL00010/';

export function MarsWeatherReference() {
  return (
    <section className="fleet-habitat" aria-label="Condiciones exteriores del cráter Gale">
      <h3>Condiciones exteriores · Cráter Gale</h3>
      <p>Archivo histórico · Curiosity REMS · sol 10, 23:06 hora solar media local</p>
      <div className="fleet-status-grid">
        <div>
          <strong>−62,9 °C</strong>
          <span>Temperatura estimada del aire</span>
        </div>
        <div>
          <strong>755,08 Pa</strong>
          <span>Presión exterior</span>
        </div>
      </div>
      <a href={source}>Consultar la muestra de NASA PDS</a>
    </section>
  );
}
