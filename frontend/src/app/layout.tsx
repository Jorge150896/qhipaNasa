import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { defaultAppLanguage } from '@/domain/assistant/AppLanguage';
import { AppLanguageProvider } from '@/presentation/shared/language/AppLanguageProvider';
import { AppBackgroundProvider } from '@/presentation/shared/space/AppBackgroundProvider';
import { defaultAppBackground } from '@/presentation/shared/space/appBackground';
import './globals.css';
import './appearance.css';
import './app-background.css';
export const metadata: Metadata = {
  title: 'Qhipa Pacha · Mission Intelligence',
  description: 'Demo of health and habitat monitoring for space crews.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={defaultAppLanguage}
      data-appearance="dark"
      data-app-background={defaultAppBackground}
    >
      <body>
        <AppLanguageProvider>
          <AppBackgroundProvider>{children}</AppBackgroundProvider>
        </AppLanguageProvider>
      </body>
    </html>
  );
}
