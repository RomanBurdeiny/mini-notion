import { createAppQueryClient } from '@shared/lib/query-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

type QueryProviderProps = {
  children: ReactNode;
  client?: QueryClient;
};

export function QueryProvider({ children, client }: QueryProviderProps) {
  const [defaultClient] = useState(() => createAppQueryClient());
  const activeClient = client ?? defaultClient;
  return <QueryClientProvider client={activeClient}>{children}</QueryClientProvider>;
}
