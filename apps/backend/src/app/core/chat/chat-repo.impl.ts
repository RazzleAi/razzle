import { Injectable } from '@nestjs/common'
import { ChatRepo } from '@razzle/services'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ChatRepoImpl extends ChatRepo {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService)
  }
}
