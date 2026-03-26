import { PublicRoute } from '@app/providers/public-route';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render-with-providers';

const userFixture = {
  id: 'u1',
  email: 'tester@example.com',
  name: 'Tester',
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
};

describe('PublicRoute redirect when authenticated', () => {
  beforeEach(() => {
    localStorage.setItem('mini-notion:access-token', 'fake-token');
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (url.includes('/api/auth/me')) {
          return Promise.resolve(
            new Response(JSON.stringify({ user: userFixture }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          );
        }
        return Promise.resolve(new Response(null, { status: 404 }));
      })
    );
  });

  it('redirects away from login to dashboard', async () => {
    renderWithProviders(
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<div>Login form</div>} />
        </Route>
        <Route path="/dashboard" element={<div>Dashboard home</div>} />
      </Routes>,
      { initialEntries: ['/login'] }
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard home')).toBeInTheDocument();
    });
    expect(screen.queryByText('Login form')).not.toBeInTheDocument();
  });
});
