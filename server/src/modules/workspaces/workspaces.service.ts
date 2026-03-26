import type { Workspace } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { HttpError } from '../../middlewares/http-error.js';
import type { CreateWorkspaceInput } from './workspaces.schema.js';

export async function listWorkspaces(ownerId: string): Promise<Workspace[]> {
  return prisma.workspace.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getWorkspaceById(
  workspaceId: string,
  ownerId: string
): Promise<Workspace> {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerId },
  });
  if (workspace === null) {
    throw new HttpError(404, 'Not found');
  }
  return workspace;
}

export async function createWorkspace(
  ownerId: string,
  input: CreateWorkspaceInput
): Promise<Workspace> {
  return prisma.workspace.create({
    data: {
      title: input.title.trim(),
      ownerId,
    },
  });
}
