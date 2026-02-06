interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
}

export function EmptyState({ emoji, title, description }: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div
        className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center"
        role="status"
      >
        <div className="mb-4 text-4xl" aria-hidden="true">
          {emoji}
        </div>
        <h3 className="mb-2 text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
