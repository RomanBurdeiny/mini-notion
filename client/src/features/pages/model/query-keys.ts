export const pageQueryKeys = {
  tree: (workspaceId: string) => ['pages', 'tree', workspaceId] as const,
  detail: (pageId: string) => ['pages', 'detail', pageId] as const,
  search: (q: string) => ['pages', 'search', q] as const,
};
