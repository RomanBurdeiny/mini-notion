import type { Page, Workspace } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { HttpError } from '../../middlewares/http-error.js';
import { buildPageTree } from './page-tree.js';
import type { CreatePageInput, UpdatePageInput } from './pages.schema.js';

async function getOwnedWorkspace(
  workspaceId: string,
  userId: string
): Promise<Workspace> {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerId: userId },
  });
  if (workspace === null) {
    throw new HttpError(404, 'Not found');
  }
  return workspace;
}

async function getOwnedPage(pageId: string, userId: string): Promise<Page> {
  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      workspace: { ownerId: userId },
    },
  });
  if (page === null) {
    throw new HttpError(404, 'Not found');
  }
  return page;
}

async function validateParentInWorkspace(params: {
  workspaceId: string;
  parentPageId: string;
  allowArchivedParent: boolean;
}): Promise<void> {
  const parent = await prisma.page.findFirst({
    where: {
      id: params.parentPageId,
      workspaceId: params.workspaceId,
      ...(params.allowArchivedParent ? {} : { isArchived: false }),
    },
  });
  if (parent === null) {
    throw new HttpError(404, 'Not found');
  }
}

async function assertNoParentCycle(
  pageId: string,
  newParentId: string | null,
  workspaceId: string
): Promise<void> {
  if (newParentId === null) {
    return;
  }
  if (newParentId === pageId) {
    throw new HttpError(400, 'Invalid parent');
  }

  const parent = await prisma.page.findFirst({
    where: { id: newParentId, workspaceId },
  });
  if (parent === null) {
    throw new HttpError(404, 'Not found');
  }

  let cur: string | null = newParentId;
  const seen = new Set<string>();
  while (cur !== null) {
    if (cur === pageId) {
      throw new HttpError(400, 'Invalid parent');
    }
    if (seen.has(cur)) {
      break;
    }
    seen.add(cur);
    const parentRow: { parentPageId: string | null } | null = await prisma.page.findUnique({
      where: { id: cur },
      select: { parentPageId: true },
    });
    cur = parentRow?.parentPageId ?? null;
  }
}

export async function getPageTree(workspaceId: string, userId: string) {
  await getOwnedWorkspace(workspaceId, userId);

  const pages = await prisma.page.findMany({
    where: { workspaceId, isArchived: false },
    orderBy: { createdAt: 'asc' },
  });

  const tree = buildPageTree(pages);
  return tree;
}

export async function getPageById(pageId: string, userId: string): Promise<Page> {
  return getOwnedPage(pageId, userId);
}

export async function createPage(userId: string, input: CreatePageInput): Promise<Page> {
  await getOwnedWorkspace(input.workspaceId, userId);

  const parentPageId = input.parentPageId ?? null;
  if (parentPageId !== null) {
    await validateParentInWorkspace({
      workspaceId: input.workspaceId,
      parentPageId,
      allowArchivedParent: false,
    });
  }

  return prisma.page.create({
    data: {
      workspaceId: input.workspaceId,
      title: input.title.trim(),
      content: input.content ?? '',
      icon: input.icon ?? null,
      parentPageId,
      authorId: userId,
    },
  });
}

export async function updatePage(
  pageId: string,
  userId: string,
  input: UpdatePageInput
): Promise<Page> {
  const existing = await getOwnedPage(pageId, userId);

  const data: {
    title?: string;
    content?: string;
    icon?: string | null;
    parentPageId?: string | null;
  } = {};

  if (input.title !== undefined) {
    data.title = input.title.trim();
  }
  if (input.content !== undefined) {
    data.content = input.content;
  }
  if (input.icon !== undefined) {
    data.icon = input.icon;
  }

  if (input.parentPageId !== undefined) {
    const nextParentId = input.parentPageId;
    if (nextParentId !== null) {
      await validateParentInWorkspace({
        workspaceId: existing.workspaceId,
        parentPageId: nextParentId,
        allowArchivedParent: false,
      });
    }
    await assertNoParentCycle(pageId, nextParentId, existing.workspaceId);
    data.parentPageId = nextParentId;
  }

  return prisma.page.update({
    where: { id: pageId },
    data,
  });
}

export async function archivePage(pageId: string, userId: string): Promise<Page> {
  await getOwnedPage(pageId, userId);
  return prisma.page.update({
    where: { id: pageId },
    data: { isArchived: true },
  });
}

export async function restorePage(pageId: string, userId: string): Promise<Page> {
  const page = await getOwnedPage(pageId, userId);
  if (!page.isArchived) {
    throw new HttpError(400, 'Page is not archived');
  }
  let parentPageId = page.parentPageId;
  if (parentPageId !== null) {
    const parent = await prisma.page.findFirst({
      where: { id: parentPageId, workspaceId: page.workspaceId },
    });
    if (parent === null || parent.isArchived) {
      parentPageId = null;
    }
  }
  return prisma.page.update({
    where: { id: pageId },
    data: { isArchived: false, parentPageId },
  });
}

export async function softDeletePage(pageId: string, userId: string): Promise<Page> {
  return archivePage(pageId, userId);
}
