import { DashboardSearchBar } from '@widgets/dashboard/dashboard-search-bar';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createJsonFetchMock } from '../../../test/helpers/mock-fetch';
import { renderWithProviders } from '../../../test/render-with-providers';

describe('DashboardSearchBar', () => {
  beforeEach(() => {
    localStorage.setItem('mini-notion:access-token', 't');
    vi.stubGlobal(
      'fetch',
      vi.fn(
        createJsonFetchMock([
          {
            match: (url) => url.includes('/api/auth/me'),
            body: {
              user: {
                id: 'u1',
                email: 'a@b.c',
                name: 'A',
                createdAt: '',
                updatedAt: '',
              },
            },
          },
          {
            match: (url) => url.includes('/api/pages/search'),
            body: {
              results: [
                {
                  id: 's1',
                  title: 'MatchTitle',
                  content: 'snippet',
                  icon: null,
                  workspaceId: 'ws1',
                  authorId: 'u1',
                  parentPageId: null,
                  isArchived: false,
                  createdAt: '',
                  updatedAt: '',
                },
              ],
            },
          },
        ])
      )
    );
  });

  it('fetches and lists results after debounced input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardSearchBar />, { initialEntries: ['/'] });

    const input = screen.getByPlaceholderText(/search pages/i);
    await user.type(input, 'Ma');

    await waitFor(
      () => {
        expect(screen.getByText('MatchTitle')).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('shows empty state when no matches', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        createJsonFetchMock([
          {
            match: (url) => url.includes('/api/auth/me'),
            body: {
              user: {
                id: 'u1',
                email: 'a@b.c',
                name: 'A',
                createdAt: '',
                updatedAt: '',
              },
            },
          },
          {
            match: (url) => url.includes('/api/pages/search'),
            body: { results: [] },
          },
        ])
      )
    );

    const user = userEvent.setup();
    renderWithProviders(<DashboardSearchBar />, { initialEntries: ['/'] });

    await user.type(screen.getByPlaceholderText(/search pages/i), 'zz');

    await waitFor(
      () => {
        expect(screen.getByText(/no matches/i)).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });
});
