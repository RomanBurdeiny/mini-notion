import { LoginPage } from '@pages/login/login-page';
import { RegisterPage } from '@pages/register/register-page';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createJsonFetchMock } from '../../../test/helpers/mock-fetch';
import { renderWithProviders } from '../../../test/render-with-providers';

describe('auth login flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        createJsonFetchMock([
          {
            match: (url) => url.includes('/api/auth/me'),
            body: {
              user: {
                id: 'u1',
                email: 'who@example.com',
                name: 'Who',
                createdAt: '2020-01-01T00:00:00.000Z',
                updatedAt: '2020-01-01T00:00:00.000Z',
              },
            },
          },
          {
            match: (url, init) =>
              url.includes('/api/auth/login') && init?.method === 'POST',
            body: {
              accessToken: 'test-access-token',
              user: {
                id: 'u1',
                email: 'who@example.com',
                name: 'Who',
                createdAt: '2020-01-01T00:00:00.000Z',
                updatedAt: '2020-01-01T00:00:00.000Z',
              },
            },
          },
        ])
      )
    );
  });

  it('submits credentials and stores access token', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard home</div>} />
      </Routes>,
      { initialEntries: ['/login'] }
    );

    await user.type(screen.getByLabelText('Email'), 'who@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem('mini-notion:access-token')).toBe('test-access-token');
    });
  });
});

describe('auth register flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        createJsonFetchMock([
          {
            match: (url, init) =>
              url.includes('/api/auth/register') && init?.method === 'POST',
            body: {
              accessToken: 'register-token',
              user: {
                id: 'u2',
                email: 'new@example.com',
                name: 'New User',
                createdAt: '2020-01-01T00:00:00.000Z',
                updatedAt: '2020-01-01T00:00:00.000Z',
              },
            },
          },
          {
            match: (url) => url.includes('/api/auth/me'),
            body: {
              user: {
                id: 'u2',
                email: 'new@example.com',
                name: 'New User',
                createdAt: '2020-01-01T00:00:00.000Z',
                updatedAt: '2020-01-01T00:00:00.000Z',
              },
            },
          },
        ])
      )
    );
  });

  it('submits registration, stores token, and navigates to dashboard', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard/*" element={<div>Dashboard home</div>} />
      </Routes>,
      { initialEntries: ['/register'] }
    );

    await user.type(screen.getByLabelText('Name'), 'New User');
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(localStorage.getItem('mini-notion:access-token')).toBe('register-token');
      expect(screen.getByText('Dashboard home')).toBeInTheDocument();
    });
  });
});
