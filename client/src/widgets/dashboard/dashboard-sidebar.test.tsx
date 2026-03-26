import { DashboardWorkspaceLayout } from '@pages/dashboard/dashboard-workspace-layout';
import { NoPageSelected } from '@pages/dashboard/no-page-selected';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createJsonFetchMock } from '../../../test/helpers/mock-fetch';
import { renderWithProviders } from '../../../test/render-with-providers';

const user = {
  id: 'u1',
  email: 'a@b.c',
  name: 'A',
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
};

const workspace = {
  id: 'ws1',
  title: 'Main WS',
  ownerId: 'u1',
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
};

const pageNode = {
  id: 'p1',
  title: 'TreePage',
  content: '',
  icon: null,
  workspaceId: 'ws1',
  authorId: 'u1',
  parentPageId: null,
  isArchived: false,
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
  children: [],
};

describe('DashboardSidebar integration', () => {
  beforeEach(() => {
    localStorage.setItem('mini-notion:access-token', 't');
    vi.stubGlobal(
      'fetch',
      vi.fn(
        createJsonFetchMock([
          { match: (url) => url.includes('/api/auth/me'), body: { user } },
          { match: (url) => url.includes('/api/workspaces'), body: { workspaces: [workspace] } },
          {
            match: (url) => url.includes('/api/pages/tree'),
            body: { tree: [pageNode] },
          },
        ])
      )
    );
  });

  it('renders workspace selector and page tree', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/dashboard/w/:workspaceId" element={<DashboardWorkspaceLayout />}>
          <Route index element={<NoPageSelected />} />
        </Route>
      </Routes>,
      { initialEntries: ['/dashboard/w/ws1'] }
    );

    await waitFor(() => {
      expect(screen.getByText('TreePage')).toBeInTheDocument();
    });
    expect(screen.getByRole('combobox', { name: /workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new page/i })).toBeInTheDocument();
  });

  it('shows empty tree message when there are no pages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        createJsonFetchMock([
          { match: (url) => url.includes('/api/auth/me'), body: { user } },
          { match: (url) => url.includes('/api/workspaces'), body: { workspaces: [workspace] } },
          { match: (url) => url.includes('/api/pages/tree'), body: { tree: [] } },
        ])
      )
    );

    renderWithProviders(
      <Routes>
        <Route path="/dashboard/w/:workspaceId" element={<DashboardWorkspaceLayout />}>
          <Route index element={<NoPageSelected />} />
        </Route>
      </Routes>,
      { initialEntries: ['/dashboard/w/ws1'] }
    );

    await waitFor(() => {
      expect(screen.getByText(/no pages yet/i)).toBeInTheDocument();
    });
  });

  it('creates a root page and navigates to the editor route', async () => {
    const user = userEvent.setup();
    const created = {
      ...pageNode,
      id: 'p-new',
      title: 'Untitled',
      parentPageId: null,
    };
    const fetchMock = vi.fn(
      createJsonFetchMock([
        { match: (url) => url.includes('/api/auth/me'), body: { user } },
        { match: (url) => url.includes('/api/workspaces'), body: { workspaces: [workspace] } },
        {
          match: (url, init) =>
            init?.method === 'POST' &&
            new URL(url, 'http://localhost').pathname === '/api/pages',
          body: { page: created },
        },
        {
          match: (url) => url.includes('/api/pages/tree'),
          body: { tree: [pageNode] },
        },
      ])
    );
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(
      <Routes>
        <Route path="/dashboard/w/:workspaceId" element={<DashboardWorkspaceLayout />}>
          <Route index element={<NoPageSelected />} />
          <Route path="p/:pageId" element={<div>Editor outlet</div>} />
        </Route>
      </Routes>,
      { initialEntries: ['/dashboard/w/ws1'] }
    );

    await waitFor(() => {
      expect(screen.getByText('TreePage')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /new page/i }));

    await waitFor(() => {
      expect(screen.getByText('Editor outlet')).toBeInTheDocument();
    });

    const postCalls = fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');
    expect(postCalls.length).toBeGreaterThanOrEqual(1);
  });
});
