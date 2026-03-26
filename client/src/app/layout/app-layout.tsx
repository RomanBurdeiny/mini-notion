import { useAuth } from '@features/auth/model/auth-context';
import { Link, Outlet, useLocation } from 'react-router-dom';

export function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="shrink-0 border-b border-neutral-200 bg-white">
        <div
          className={`flex items-center justify-between px-4 py-3 ${isDashboard ? '' : 'mx-auto max-w-3xl'}`}
        >
          <Link to="/" className="font-semibold text-neutral-900">
            mini-notion
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {isAuthenticated ? (
              <>
                <span className="hidden text-neutral-600 sm:inline">{user?.email}</span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded border border-neutral-200 px-2 py-1 text-neutral-700 hover:bg-neutral-50"
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
      <main className={`flex min-h-0 flex-1 flex-col ${isDashboard ? 'w-full' : 'mx-auto w-full max-w-3xl px-4 py-8'}`}>
        <Outlet />
      </main>
    </div>
  );
}
