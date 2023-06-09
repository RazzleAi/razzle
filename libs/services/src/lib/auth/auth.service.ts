import {
  ThirdPartyAuthAccountInviteDto,
  ThirdPartyAuthDto,
  ThirdPartyAuthResponseDto,
} from '@razzle/dto'
import { AccountInvitationRepo, AccountService } from '../account'
import { UserService } from '../user'
import { AuthPrincipal, AuthRepo } from './auth.repo'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

export class AuthService {
  constructor(
    private authRepo: AuthRepo,
    private userService: UserService,
    private accountService: AccountService,
    private accountInviteRepo: AccountInvitationRepo
  ) {}

  async thirdPartyAuth(
    dto: ThirdPartyAuthDto
  ): Promise<ThirdPartyAuthResponseDto> {
    const result = await this.createOrUpdateThirdPartyUser({
      authUid: dto.authUid,
      email: dto.email,
      loginType: dto.providerId,
      profilePictureUrl: dto.profilePictureUrl,
    })
    return result
  }

  private async createOrUpdateThirdPartyUser(user: {
    authUid: string
    email: string
    profilePictureUrl?: string
    loginType: string
  }): Promise<{ authUid: string; userId: string }> {
    const existingUser = await this.userService.getUserByAuthUid(user.authUid)
    if (existingUser) {
      return { authUid: existingUser.authUid, userId: existingUser.id }
    }

    const username = await this.generateUniqueUsernameFromEmail(user.email)
    const usr = await this.userService.createUser({
      authUid: user.authUid,
      email: user.email,
      loginType: user.loginType,
      username: username,
      profilePictureUrl: user.profilePictureUrl || null,
    })

    const emailDomain = this.getEmailDomain(user.email)
    if (this.isCommonEmailDomain(user.email)) {
      return usr
    }

    const account = await this.accountService.getAccountByMatchDomain(
      emailDomain
    )
    if (!account || !account.enableDomainMatching) {
      return usr
    }

    await this.accountService.addUserToAccount(usr.userId, account.id)

    return usr
  }

  private async generateUniqueUsernameFromEmail(
    email: string
  ): Promise<string> {
    const emailParts = email.split('@')
    const username = emailParts[0]
    const existing = await this.userService.findByUsername(username)
    if (!existing) {
      return username
    }

    // generate random 4 digit number
    let exists = true
    let newUsername = null
    let count = 0
    while (exists && count < 10) {
      const random = Math.floor(1000 + Math.random() * 9000)
      newUsername = `${username}${random}`
      const existing = await this.userService.findByUsername(newUsername)
      exists = !!existing
      count++
    }

    if (newUsername) {
      return newUsername
    }

    // generate random username independent of email
    newUsername = faker.internet.userName(newUsername || undefined)
    return newUsername
  }

  async thirdPartyAuthWithAccountInvite(
    dto: ThirdPartyAuthAccountInviteDto
  ): Promise<ThirdPartyAuthResponseDto> {
    const result = await this.acceptAccountInvite(dto)
    return result
  }

  private async acceptAccountInvite(dto: ThirdPartyAuthAccountInviteDto) {
    const invitations = await this.accountInviteRepo.findAccountInvitation({
      token: dto.token,
    })
    if (invitations.length === 0) {
      throw new Error(`Token ${dto.token} not found`)
    }

    const invitation = invitations[0]
    const now = DateTime.now()
    const expiry = DateTime.fromJSDate(invitation.expiryDate)
    if (now > expiry) {
      throw new Error(`Token ${dto.token} has expired`)
    }

    const account = await this.accountService.getById(invitation.accountId)
    if (!account) {
      throw new Error(`Account ${invitation.accountId} not found`)
    }

    const user = await this.createOrUpdateThirdPartyUser({
      authUid: dto.authUid,
      email: dto.email,
      loginType: dto.providerId,
      profilePictureUrl: dto.profilePictureUrl,
    })
    this.accountService.addUserToAccount(user.userId, account.id)

    await this.accountInviteRepo.deleteAccountInvitation(invitation.id)
    return user
  }

  private getEmailDomain(email: string): string {
    const emailParts = email.split('@')
    return emailParts[emailParts.length - 1]
  }

  private isCommonEmailDomain(email: string): boolean {
    const emailDomain = this.getEmailDomain(email)
    const commonEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com']
    return commonEmailDomains.includes(emailDomain)
  }

  async verifyAuthToken(token: string): Promise<AuthPrincipal> {
    return this.authRepo.verifyAuthToken(token)
  }
}
