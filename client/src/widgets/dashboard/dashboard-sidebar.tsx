import { createPageApi, fetchPageTree } from '@features/pages/api/pages-api';
import { pageQueryKeys } from '@features/pages/model/query-keys';
import { fetchWorkspaces } from '@features/workspaces/api/workspaces-api';
import { workspaceQueryKeys } from '@features/workspaces/model/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageTree } from './page-tree';

export function DashboardSidebar({ workspaceId }: { workspaceId: string }) {
  const navigate = useNavigate();
  const params = useParams<{ pageId?: string }>();
  const activePageId = params.pageId as string | undefined;
  const qc = useQueryClient();

  const workspacesQuery = useQuery({
    queryKey: workspaceQueryKeys.all,
    queryFn: fetchWorkspaces,
  });

  const treeQuery = useQuery({
    queryKey: pageQueryKeys.tree(workspaceId),
    queryFn: () => fetchPageTree(workspaceId),
  });

  const workspaceOptions = useMemo(
    () => workspacesQuery.data?.workspaces ?? [],
    [workspacesQuery.data?.workspaces]
  );

  const createMut = useMutation({
    mutationFn: (parentPageId: string | null) =>
      createPageApi({ workspaceId, title: 'Untitled', parentPageId }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: pageQueryKeys.tree(workspaceId) });
      navigate(`/dashboard/w/${workspaceId}/p/${res.page.id}`);
    },
  });

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 p-3">
        <label htmlFor="workspace-select" className="block text-xs font-medium text-neutral-500">
          Workspace
        </label>
        <select
          id="workspace-select"
          className="mt-1 w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          value={workspaceId}
          onChange={(e) => navigate(`/dashboard/w/${e.target.value}`)}
          disabled={workspacesQuery.isPending || workspaceOptions.length === 0}
        >
          {workspaceOptions.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Pages</span>
        <button
          type="button"
          className="rounded bg-neutral-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
          disabled={createMut.isPending}
          onClick={() => createMut.mutate(null)}
        >
          New page
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {treeQuery.isPending ? (
          <p className="px-1 text-sm text-neutral-500">Loading pages</p>
        ) : treeQuery.isError ? (
          <p className="px-1 text-sm text-red-600">
            {treeQuery.error instanceof Error ? treeQuery.error.message : 'Failed to load tree'}
          </p>
        ) : treeQuery.data?.tree.length === 0 ? (
          <p className="px-1 text-sm text-neutral-500">No pages yet. Create one above.</p>
        ) : (
          <PageTree
            workspaceId={workspaceId}
            nodes={treeQuery.data?.tree ?? []}
            depth={0}
            onAddChild={(pid) => createMut.mutate(pid)}
            activePageId={activePageId}
          />
        )}
      </div>
    </aside>
  );
}
