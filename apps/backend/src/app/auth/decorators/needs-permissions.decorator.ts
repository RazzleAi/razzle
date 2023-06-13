import { SetMetadata } from "@nestjs/common"

// TODO: Revisit roles and permissions
export const PERMISSIONS_KEY = 'permissions'
export const NeedsPermissions = (...permissions: unknown[]) => SetMetadata(PERMISSIONS_KEY, permissions)