import { DashboardIndexRedirect } from '@pages/dashboard/dashboard-index-redirect';
import { DashboardWorkspaceLayout } from '@pages/dashboard/dashboard-workspace-layout';
import { NoPageSelected } from '@pages/dashboard/no-page-selected';
import { PageEditorPage } from '@pages/dashboard/page-editor-page';
import { LoginPage } from '@pages/login/login-page';
import { NotFoundPage } from '@pages/not-found/not-found-page';
import { RegisterPage } from '@pages/register/register-page';
import { Outlet, Route, Routes } from 'react-router-dom';
import { IndexRedirect } from './index-redirect';
import { AppLayout } from './layout/app-layout';
import { ProtectedRoute } from './providers/protected-route';
import { PublicRoute } from './providers/public-route';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<IndexRedirect />} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Outlet />}>
            <Route index element={<DashboardIndexRedirect />} />
            <Route path="w/:workspaceId" element={<DashboardWorkspaceLayout />}>
              <Route index element={<NoPageSelected />} />
              <Route path="p/:pageId" element={<PageEditorPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
