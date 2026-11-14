import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="standalone-state">
      <span className="eyebrow">ASTRA / 404</span>
      <h1>Fuera de la ruta de misión.</h1>
      <p>Esta sección no existe.</p>
      <Link className="button primary" href="/mission/overview">
        Volver al centro de misión
      </Link>
    </main>
  );
}
