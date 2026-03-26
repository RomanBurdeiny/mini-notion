import { ProtectedRoute } from '@app/providers/protected-route';
import { screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test/render-with-providers';

describe('ProtectedRoute', () => {
  it('redirects to login when there is no session', async () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Secret area</div>} />
        </Route>
        <Route path="/login" element={<div>Login screen</div>} />
      </Routes>,
      { initialEntries: ['/dashboard'] }
    );

    await waitFor(() => {
      expect(screen.getByText('Login screen')).toBeInTheDocument();
    });
    expect(screen.queryByText('Secret area')).not.toBeInTheDocument();
  });
});
