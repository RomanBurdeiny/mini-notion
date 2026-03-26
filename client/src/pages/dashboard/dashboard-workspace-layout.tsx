import { DashboardSearchBar } from '@widgets/dashboard/dashboard-search-bar';
import { DashboardSidebar } from '@widgets/dashboard/dashboard-sidebar';
import { Outlet, useParams } from 'react-router-dom';

export function DashboardWorkspaceLayout() {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  if (workspaceId === undefined) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full">
      <DashboardSidebar workspaceId={workspaceId} />
      <div className="flex min-w-0 flex-1 flex-col bg-neutral-50">
        <DashboardSearchBar />
        <div className="flex-1 overflow-auto p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
