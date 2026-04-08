export default function NotFoundView() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-secondary p-8 text-center">
        <div className="text-4xl font-semibold text-foreground">404</div>
        <p className="mt-4 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
        <div className="mt-8 flex justify-center">
          <a
            href="/documents"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Go to Documents
          </a>
        </div>
      </div>
    </main>
  );
}
