import { PageEditorPage } from '@pages/dashboard/page-editor-page';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createJsonFetchMock } from '../../../test/helpers/mock-fetch';
import { renderWithProviders } from '../../../test/render-with-providers';

const page = {
  id: 'p9',
  title: 'Doc title',
  content: 'Hello body',
  icon: null,
  workspaceId: 'ws1',
  authorId: 'u1',
  parentPageId: null,
  isArchived: false,
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
};

describe('PageEditorPage', () => {
  beforeEach(() => {
    localStorage.setItem('mini-notion:access-token', 't');
  });

  it('loads page and submits PATCH when saving', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(
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
          match: (url, init) =>
            url.includes('/api/pages/p9') && init?.method === 'PATCH',
          body: { page: { ...page, title: 'Updated' } },
        },
        {
          match: (url) => url.includes('/api/pages/p9'),
          body: { page },
        },
      ])
    );
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(
      <Routes>
        <Route path="/dashboard/w/:workspaceId/p/:pageId" element={<PageEditorPage />} />
      </Routes>,
      { initialEntries: ['/dashboard/w/ws1/p/p9'] }
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Doc title')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('Hello body')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Updated');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      const patchCalls = fetchMock.mock.calls.filter(([input, init]) => {
        const url = typeof input === 'string' ? input : (input as Request).url;
        return (
          url.includes('/api/pages/p9') &&
          typeof init === 'object' &&
          init !== null &&
          (init as RequestInit).method === 'PATCH'
        );
      });
      expect(patchCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows error state when load fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        createJsonFetchMock([
          {
            match: (url) => url.includes('/api/auth/me'),
            body: { user: { id: 'u1', email: 'a@b.c', name: 'A', createdAt: '', updatedAt: '' } },
          },
          {
            match: (url) => url.includes('/api/pages/bad'),
            body: { error: 'Not found' },
            status: 404,
          },
        ])
      )
    );

    renderWithProviders(
      <Routes>
        <Route path="/dashboard/w/:workspaceId/p/:pageId" element={<PageEditorPage />} />
      </Routes>,
      { initialEntries: ['/dashboard/w/ws1/p/bad'] }
    );

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });
  });
});
