import { createAppQueryClient } from '@shared/lib/query-client';
import { AuthProvider } from '@features/auth/model/auth-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

type ProviderOpts = {
  queryClient?: QueryClient;
  initialEntries?: MemoryRouterProps['initialEntries'];
};

function Providers({
  children,
  queryClient,
  initialEntries,
}: {
  children: ReactNode;
  queryClient: QueryClient;
  initialEntries?: MemoryRouterProps['initialEntries'];
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries ?? ['/']}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & ProviderOpts
) {
  const { queryClient, initialEntries, ...renderOptions } = options ?? {};
  const client = queryClient ?? createAppQueryClient();
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers queryClient={client} initialEntries={initialEntries}>
        {children}
      </Providers>
    ),
    ...renderOptions,
  });
}
