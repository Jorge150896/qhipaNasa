'use client';
export default function ErrorPage({ reset }: { reset(): void }) {
  return (
    <main className="standalone-state">
      <h1>Se interrumpió esta vista.</h1>
      <p>Vuelve a intentarlo para retomar la misión.</p>
      <button className="button primary" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
