import { UserRepo } from '@razzle/services'
import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserRepoImpl implements UserRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    user: Omit<User, 'id' | ' createdAt' | 'updatedAt'>
  ): Promise<{ userId: string; authUid: string }> {
    const { id, authUid } = await this.prismaService.user.create({
      data: user,
      select: { authUid: true, id: true },
    })
    return { userId: id, authUid: authUid }
  }

  async upsertUser(
    authUid: string,
    user: Partial<Omit<User, 'updatedAt' | 'createdAt'>>
  ): Promise<{ userId: string; authUid: string }> {
    const result = await this.prismaService.user.upsert({
      where: {
        authUid: authUid,
      },
      update: {
        email: user.email,
        username: user.username,
        loginType: user.loginType,
      },
      create: {
        authUid: authUid,
        email: user.email,
        username: user.username,
        loginType: user.loginType,
      },
      select: {
        authUid: true,
        id: true,
      },
    })
    return {
      authUid: result.authUid,
      userId: result.id,
    }
  }

  findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { id: id } })
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    })
  }

  findByUsername(username: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        username: username,
      },
    })
  }

  searchInAccountByEmailOrUsername(query: string): Promise<User[]> {
    return this.prismaService.user.findMany({
      where: {
        OR: [
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            username: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        AND: [
          {            
            loginType: {
              not: {
                equals: 'default',
              },
            },
          },
        ],
      },
    })
  }

  findByAuthUid(authUid: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { authUid: authUid } })
  }

  // TODO: MAKE THIS PRIVATE AFTER USERNAME CLEANUP IN PROD
  async getAllUsers(): Promise<User[]> {
    return this.prismaService.user.findMany()
  }

  async deleteUser(userId: string): Promise<void> {
    await this.prismaService.user.delete({
      where: {
        id: userId,
      },
    })
  }
}
