import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
export const metadata: Metadata = {
  title: 'Qhipa Pacha · Mission Intelligence',
  description:
    'Prototipo de monitorización de salud y entorno para tripulaciones espaciales. Datos de demostración.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
