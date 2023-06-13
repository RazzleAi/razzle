import {
  Prisma,
  App as PrismaApp,
  UserAppAuthentication as PrismaUserAppAuthentication,
} from '@prisma/client'

export type NewAppDetails = Pick<
  PrismaApp,
  | 'name'
  | 'appId'
  | 'iconUrl'
  | 'description'
  | 'apiKey'
  | 'isDefault'
  | 'isPublic'
  | 'handle'
>

export type UpdateAppInput = Partial<
  Omit<PrismaApp, 'id' | 'createdAt' | 'updatedAt' | 'appId' | 'creatorId'>
>

export type App = Omit<PrismaApp, 'data'> & { data?: AppData }
export type AppData = {
  sdkVersion: string
  actions?: Array<AppAction>
  requiresAuth: boolean
}
export type AppAction = {
  name: string
  description: string
  descriptionEmbedding: number[]
  stealth: boolean
  paged: boolean
  parameters: Array<AppActionParameter>
}
export type AppActionParameter = { name: string; type: string }

export type UserAppAuthentication = PrismaUserAppAuthentication

export async function appFromPrisma(
  app: PrismaApp | null | undefined | Promise<PrismaApp | null | undefined>
): Promise<App | null> {
  if (!app) {
    return null
  }

  // check if promise
  if (app instanceof Promise) {
    return appFromPrisma(await app)
  }

  if (!app.data) {
    return {
      ...app,
      data: undefined,
    }
  }

  const appJsonObj = app.data as Prisma.JsonObject
  const actionsJsonArr = (appJsonObj.actions as Prisma.JsonArray) ?? []
  const actions: AppAction[] = actionsJsonArr.map(
    (action: Prisma.JsonValue) => {
      const actionObj = action as Exclude<
        Prisma.JsonValue,
        null | string | number | boolean | Prisma.JsonArray
      >

      return {
        name: actionObj.name as string,
        description: actionObj.description as string,
        descriptionEmbedding: actionObj.descriptionEmbedding as number[],
        stealth: actionObj.stealth as boolean,
        paged: actionObj.paged as boolean,
        parameters: actionObj.parameters as AppActionParameter[],
      }
    }
  )
  return {
    ...app,
    data: !app.data
      ? undefined
      : {
          requiresAuth: (appJsonObj.requiresAuth as boolean) ?? false,
          sdkVersion: (appJsonObj.sdkVersion as string) ?? '',
          actions: actions,
        },
  }
}
