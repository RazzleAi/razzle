export interface AppDto {
  id: string
  name: string
  appId: string
  iconUrl: string | null
  description: string
  isDefault: boolean
  isPublic: boolean
  handle: string | null
}

export interface AppDtoWithApiKey extends AppDto {
  apiKey: string
}
