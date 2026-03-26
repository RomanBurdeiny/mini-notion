import type { WorkspaceDto } from '@entities/workspace/model/types';
import { httpJson } from '@shared/api/http-client';

export async function fetchWorkspaces(): Promise<{ workspaces: WorkspaceDto[] }> {
  return httpJson<{ workspaces: WorkspaceDto[] }>('/api/workspaces', { method: 'GET' });
}
