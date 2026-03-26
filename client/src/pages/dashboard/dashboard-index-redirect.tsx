import { fetchWorkspaces } from '@features/workspaces/api/workspaces-api';
import { workspaceQueryKeys } from '@features/workspaces/model/query-keys';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function DashboardIndexRedirect() {
  const navigate = useNavigate();
  const q = useQuery({
    queryKey: workspaceQueryKeys.all,
    queryFn: fetchWorkspaces,
  });

  useEffect(() => {
    if (q.data?.workspaces[0] !== undefined) {
      navigate(`/dashboard/w/${q.data.workspaces[0].id}`, { replace: true });
    }
  }, [q.data?.workspaces, navigate]);

  if (q.isPending) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white px-4 py-12 text-center text-neutral-600">
        Loading workspaces
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-12 text-center text-red-800">
        {q.error instanceof Error ? q.error.message : 'Failed to load workspaces'}
      </div>
    );
  }

  if (q.data?.workspaces.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white px-4 py-12 text-center text-neutral-600">
        No workspaces found. Try registering again or create a workspace from the API.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-12 text-center text-neutral-600">
      Redirecting
    </div>
  );
}
