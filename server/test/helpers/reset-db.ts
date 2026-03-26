import { prisma } from '../../src/config/db.js';

export async function resetDatabase(): Promise<void> {
  await prisma.page.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
}
