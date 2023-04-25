import { Injectable } from "@nestjs/common"
import { Email } from "@prisma/client"
import { EmailRepo, EmailService } from "@razzle/services"
import { EmailRepoImpl } from "./email.repo-impl"



@Injectable()
export class EmailServiceImpl implements EmailService {


    constructor(private readonly emailRepo: EmailRepoImpl) { }
    


    async saveEmail(email: Email): Promise<Email> {
        if (await this.emailRepo.existsByReference(email.reference)) {
            throw new Error(`Reference ${email.reference} already exists`)
        }
        
        return this.emailRepo.saveEmail(email)
    }
    

    fetchEmailsPaginated(page: number, pageSize: number): Promise<Email[]> {
        return this.emailRepo.fetchUnsentEmailsPaginated(page, pageSize)
    }


    updateEmails(emails: Email[]): Promise<{ count: number }> {
        return this.emailRepo.updateSentEmails(emails);
    }


}


