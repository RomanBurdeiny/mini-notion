export type PageTreeNode<
  T extends { id: string; parentPageId: string | null; createdAt: Date },
> = T & { children: PageTreeNode<T>[] };

export function buildPageTree<
  T extends { id: string; parentPageId: string | null; createdAt: Date },
>(pages: T[]): PageTreeNode<T>[] {
  const nodes = new Map<string, PageTreeNode<T>>();
  for (const p of pages) {
    nodes.set(p.id, { ...p, children: [] });
  }

  const roots: PageTreeNode<T>[] = [];

  for (const p of pages) {
    const node = nodes.get(p.id);
    if (node === undefined) {
      continue;
    }
    const parentId = p.parentPageId;
    if (parentId === null || !nodes.has(parentId)) {
      roots.push(node);
    } else {
      const parent = nodes.get(parentId);
      if (parent !== undefined) {
        parent.children.push(node);
      }
    }
  }

  const sortRecursive = (list: PageTreeNode<T>[]) => {
    list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    for (const n of list) {
      sortRecursive(n.children);
    }
  };

  sortRecursive(roots);
  return roots;
}
