import { SetMetadata } from "@nestjs/common"

// TODO: Revisit roles and permissions
export const PERMISSIONS_KEY = 'permissions'
export const NeedsPermissions = (...permissions: any[]) => SetMetadata(PERMISSIONS_KEY, permissions)