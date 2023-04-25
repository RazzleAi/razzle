export interface UserDto {
  id: string
  authUid: string
  email: string
  username: string | null
  createdAt: Date
  updatedAt: Date
  loginType: string
  profilePictureUrl: string | null
}
