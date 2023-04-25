import { Injectable } from "@nestjs/common";
import { AccountUser, AccountUserInviteToken, } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';



export interface AccountUserInviteTokenGenerator {

    generateInviteToken(accountOwner: AccountUser, emailInvitee: string): AccountUserInviteToken

}


