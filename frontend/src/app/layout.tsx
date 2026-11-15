import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppBackgroundProvider } from '@/presentation/shared/space/AppBackgroundProvider';
import { defaultAppBackground } from '@/presentation/shared/space/appBackground';
import './globals.css';
import './appearance.css';
import './app-background.css';
export const metadata: Metadata = {
  title: 'Qhipa Pacha · Mission Intelligence',
  description:
    'Prototipo de monitorización de salud y entorno para tripulaciones espaciales. Datos de demostración.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-appearance="dark" data-app-background={defaultAppBackground}>
      <body>
        <AppBackgroundProvider>{children}</AppBackgroundProvider>
      </body>
    </html>
  );
}
