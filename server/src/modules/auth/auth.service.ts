import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db.js';
import type { Env } from '../../config/env.js';
import { HttpError } from '../../middlewares/http-error.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';
import { signAccessToken } from './token.js';

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

function toPublicUser(row: {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const BCRYPT_COST = 10;

export async function registerUser(
  input: RegisterInput,
  env: Pick<Env, 'JWT_SECRET' | 'JWT_EXPIRES_IN'>
): Promise<{ accessToken: string; user: PublicUser }> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
        },
      });

      await tx.workspace.create({
        data: {
          title: 'My workspace',
          ownerId: created.id,
        },
      });

      return created;
    });

    const accessToken = signAccessToken({
      userId: user.id,
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    });

    return {
      accessToken,
      user: toPublicUser({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new HttpError(409, 'Email already in use');
    }
    throw e;
  }
}

export async function loginUser(
  input: LoginInput,
  env: Pick<Env, 'JWT_SECRET' | 'JWT_EXPIRES_IN'>
): Promise<{ accessToken: string; user: PublicUser }> {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const match = await bcrypt.compare(input.password, user.passwordHash);
  if (!match) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const accessToken = signAccessToken({
    userId: user.id,
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return {
    accessToken,
    user: toPublicUser({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }),
  };
}

export async function getUserById(id: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new HttpError(401, 'Unauthorized');
  }

  return toPublicUser({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}
