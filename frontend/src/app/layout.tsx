import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { appearanceStorageKey } from '@/ui/appAppearance';
import './globals.css';
import './appearance.css';
export const metadata: Metadata = {
  title: 'Qhipa Pacha · Mission Intelligence',
  description:
    'Prototipo de monitorización de salud y entorno para tripulaciones espaciales. Datos de demostración.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem(${JSON.stringify(appearanceStorageKey)})==='dark')document.documentElement.dataset.appearance='dark'}catch{}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
