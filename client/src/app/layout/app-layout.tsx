import { useAuth } from '@features/auth/model/auth-context';
import { Link, Outlet } from 'react-router-dom';

export function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold text-neutral-900">
            mini-notion
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {isAuthenticated ? (
              <>
                <span className="text-neutral-600">{user?.email}</span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-neutral-700 underline decoration-neutral-400"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-neutral-700">
                  Log in
                </Link>
                <Link to="/register" className="text-neutral-700">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
