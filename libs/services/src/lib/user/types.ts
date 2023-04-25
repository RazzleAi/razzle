import { User as PrismaUser } from '@prisma/client'

export type CreateUserData = Omit<PrismaUser, 'id' | 'createdAt' | 'updatedAt'>
export type UpsertUserData = Partial<
  Omit<PrismaUser, 'createdAt' | 'updatedAt'>
>
export type User = PrismaUser
