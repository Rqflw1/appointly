interface ComponentProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: ComponentProps) {
  return (
    <div className="rounded-xl border border-dashed bg-white p-8 text-center">
      <div className="text-sm font-semibold">{title}</div>
      {description ? (
        <div className="mt-2 text-sm text-muted-foreground">{description}</div>
      ) : null}
    </div>
  );
}
