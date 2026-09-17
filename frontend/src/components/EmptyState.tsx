import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="blueprint-grid-fine rounded-2xl border-2 border-dashed border-line-700 px-6 py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-trace">En construction</p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-paper">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-paper-muted">{description}</p>
      {children}
    </div>
  );
}
