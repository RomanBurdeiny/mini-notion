import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-neutral-900">Page not found</h1>
      <p className="mt-2 text-neutral-600">
        <Link to="/" className="text-neutral-900 underline">
          Go home
        </Link>
      </p>
    </div>
  );
}
