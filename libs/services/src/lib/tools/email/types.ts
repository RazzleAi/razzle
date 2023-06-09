import {
  Email as PrismaEmail,
  ContentType as PrismaContentType,
  EmailType as PrismaEmailType,
} from '@prisma/client'

export type Email = PrismaEmail

export const ContentType = PrismaContentType
export type ContentType =
  (typeof PrismaContentType)[keyof typeof PrismaContentType]

export const EmailType = PrismaEmailType
export type EmailType = (typeof PrismaEmailType)[keyof typeof PrismaEmailType]
