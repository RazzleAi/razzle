import { Injectable } from '@nestjs/common'
import { ClientHistoryItem, Prisma } from '@prisma/client'
import {
  ClientHistoryItemDto,
  ClientMessage,
  ClientMessageV2,
  ClientMessageV3,
  ServerMessage,
  ServerMessageV2,
} from '@razzle/dto'
import { PrismaService } from '../../prisma/prisma.service'

type MessageTypes =
  | ClientMessage
  | ServerMessage
  | ClientMessageV2
  | ClientMessageV3
  | ServerMessageV2
export type ClientHistoryItemWithMessage = ClientHistoryItem & {
  messageVal: MessageTypes
}

@Injectable()
export class ClientHistoryRepoImpl {
  private prisma: PrismaService['clientHistoryItem']
  constructor(prismaService: PrismaService) {
    this.prisma = prismaService.clientHistoryItem
  }

  async createClientHistoryItem(
    clientId: string,
    item: ClientHistoryItemDto
  ): Promise<ClientHistoryItemWithMessage> {
    const created = await this.prisma.create({
      data: {
        clientId: clientId,
        hash: item.hash,
        isFramed: item.isFramed || false,
        message: this.itemMessageToJson(item.message),
        timestampMillis: item.timestampMillis,
      },
    })
    return { ...created, messageVal: this.itemMessageFromJson(created.message) }
  }

  async getAllByClientId(
    clientId: string,
    count?: number
  ): Promise<ClientHistoryItemWithMessage[]> {
    const res = await this.prisma.findMany({
      where: {
        clientId: clientId,
      },
      orderBy: {
        timestampMillis: 'desc',
      },
      take: count,
    })
    const items = res.map((item) => {
      return { ...item, messageVal: this.itemMessageFromJson(item.message) }
    })
    return items
  }

  async getAllFramedByClientId(
    clientId: string
  ): Promise<ClientHistoryItemWithMessage[]> {
    const res = await this.prisma.findMany({
      where: {
        clientId: clientId,
        isFramed: true,
      },
      orderBy: {
        timestampMillis: 'desc',
      },
    })
    const items = res.map((item) => {
      return { ...item, messageVal: this.itemMessageFromJson(item.message) }
    })
    return items
  }

  async updateClientHistoryItem(
    id: string,
    updates: ClientHistoryItemDto
  ): Promise<ClientHistoryItemWithMessage> {
    const updated = await this.prisma.update({
      where: { id: id },
      data: {
        hash: updates.hash,
        isFramed: updates.isFramed,
        message: this.itemMessageToJson(updates.message),
        timestampMillis: updates.timestampMillis,
      },
    })
    return { ...updated, messageVal: this.itemMessageFromJson(updated.message) }
  }

  itemMessageToJson(message: any): Record<string, string | any> {
    const json: Record<string, any> = {}
    for (const key in message) {
      if (Array.isArray(message[key])) {
        json[key] = []
        for (const item of message[key]) {
          if (typeof item === 'object') {
            json[key].push(this.itemMessageToJson(item))
          } else {
            json[key].push(item)
          }
        }
      } else if (typeof message[key] === 'object') {
        json[key] = this.itemMessageToJson(message[key])
      } else {
        json[key] = message[key]
      }
    }
    return json
  }

  itemMessageFromJson(json: Prisma.JsonValue): MessageTypes {
    const itemMessage: Record<string, any> = {}
    for (const key in json as Prisma.JsonObject) {
      if (Array.isArray(json[key])) {
        itemMessage[key] = []
        for (const item of json[key]) {
          if (typeof item === 'object') {
            itemMessage[key].push(this.itemMessageFromJson(item))
          } else {
            itemMessage[key].push(item)
          }
        }
      } else if (typeof json[key] === 'object') {
        itemMessage[key] = this.itemMessageFromJson(json[key])
      } else {
        itemMessage[key] = json[key]
      }
    }
    return itemMessage as MessageTypes
  }
}
