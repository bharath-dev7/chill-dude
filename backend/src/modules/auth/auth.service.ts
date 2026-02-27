import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import prisma from '../../lib/prisma';
import { HttpError } from '../../lib/httpError';
import { AuthTokenPayload } from './auth.types';

const SALT_ROUNDS = 12;

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser(input: { email: string; password: string; name?: string | undefined }): Promise<User> {
  const normalizedEmail = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    throw new HttpError(409, 'User already exists with this email');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: input.name ?? null,
    },
  });
}

export async function loginUser(input: { email: string; password: string }): Promise<User> {
  const normalizedEmail = input.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Invalid email or password');
  }

  return user;
}

export async function getUserById(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new HttpError(401, 'User session is no longer valid');
  }

  return user;
}

export function toAuthTokenPayload(user: User): AuthTokenPayload {
  return {
    userId: user.id,
    email: user.email,
  };
}
