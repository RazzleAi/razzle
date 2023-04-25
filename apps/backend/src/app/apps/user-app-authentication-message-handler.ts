import { Injectable } from "@nestjs/common";
import { UserAppAuthentication } from "@prisma/client";
import { UserAppAuthenticationRepoImpl } from "./user-app-authentication.repo";


export interface UserAppAuthenticationHandler {


    handleUserAppAuthenticationUpdate(userId: string, appId: string );


}


@Injectable()
export default class UserAppAuthenticationHandlerImpl implements UserAppAuthenticationHandler {


    constructor(private userAppAuthenticationRepo: UserAppAuthenticationRepoImpl) { }


    async handleUserAppAuthenticationUpdate(userId: string, appId: string ):  Promise<UserAppAuthentication> {
        const existingAuthentication = await this.userAppAuthenticationRepo
            .findByUserIdAndAppIdAuthenticated(userId, appId)
        
        if (existingAuthentication) {
            return
        }

        return this.userAppAuthenticationRepo.save(
            {
                appId,
                userId,
                authenticated: true
            } as UserAppAuthentication
        );
    }

    
}

