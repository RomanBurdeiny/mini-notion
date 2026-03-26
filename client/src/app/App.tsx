import { AuthProvider } from '@features/auth/model/auth-context';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { QueryProvider } from './providers/query-provider';

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}
