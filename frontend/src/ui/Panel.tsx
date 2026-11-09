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
  return (
    <section className={`panel ${className}`} aria-label={label}>
      {children}
    </section>
  );
}
export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <span className="empty-mark">✦</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
