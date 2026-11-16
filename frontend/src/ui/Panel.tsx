import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import type { ReactNode } from 'react';
export function Panel({
  children,
  className = '',
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const t = useTranslation();
  return (
    <section className={`panel ${className}`} aria-label={t(label)}>
      {children}
    </section>
  );
}
export function EmptyState({ title, description }: { title: string; description: string }) {
  const t = useTranslation();
  return (
    <div className="empty-state">
      <span className="empty-mark">✦</span>
      <h3>{t(title)}</h3>
      <p>{t(description)}</p>
    </div>
  );
}
