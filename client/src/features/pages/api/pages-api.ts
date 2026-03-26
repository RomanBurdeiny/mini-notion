import type { PageDto, PageTreeNodeDto } from '@entities/page/model/types';
import { httpJson } from '@shared/api/http-client';

export async function fetchPageTree(workspaceId: string): Promise<{ tree: PageTreeNodeDto[] }> {
  const qs = new URLSearchParams({ workspaceId });
  return httpJson<{ tree: PageTreeNodeDto[] }>(`/api/pages/tree?${qs.toString()}`, {
    method: 'GET',
  });
}

export async function fetchPage(pageId: string): Promise<{ page: PageDto }> {
  return httpJson<{ page: PageDto }>(`/api/pages/${encodeURIComponent(pageId)}`, {
    method: 'GET',
  });
}

export async function createPageApi(payload: {
  workspaceId: string;
  title: string;
  content?: string;
  parentPageId?: string | null;
}): Promise<{ page: PageDto }> {
  return httpJson<{ page: PageDto }>('/api/pages', {
    method: 'POST',
    body: {
      workspaceId: payload.workspaceId,
      title: payload.title,
      content: payload.content ?? '',
      parentPageId: payload.parentPageId ?? null,
    },
  });
}

export async function patchPageApi(
  pageId: string,
  body: { title?: string; content?: string }
): Promise<{ page: PageDto }> {
  return httpJson<{ page: PageDto }>(`/api/pages/${encodeURIComponent(pageId)}`, {
    method: 'PATCH',
    body,
  });
}

export async function archivePageApi(pageId: string): Promise<{ page: PageDto }> {
  return httpJson<{ page: PageDto }>(
    `/api/pages/${encodeURIComponent(pageId)}/archive`,
    { method: 'PATCH' }
  );
}

export async function searchPagesApi(q: string): Promise<{ results: PageDto[] }> {
  const qs = new URLSearchParams({ q });
  return httpJson<{ results: PageDto[] }>(`/api/pages/search?${qs.toString()}`, {
    method: 'GET',
  });
}
