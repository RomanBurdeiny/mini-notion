import { useAuth } from '@features/auth/model/auth-context';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mt-2 text-neutral-600">
        Signed in as <span className="font-medium text-neutral-900">{user?.name}</span>
      </p>
    </div>
  );
}
