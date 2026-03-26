import { QueryProvider } from './providers/query-provider';

export function App() {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <main className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-2xl font-semibold">mini-notion</h1>
          <p className="mt-2 text-neutral-600">Client scaffold — add pages and routes next.</p>
        </main>
      </div>
    </QueryProvider>
  );
}
