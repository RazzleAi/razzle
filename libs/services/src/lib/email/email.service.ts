import { Email } from "@prisma/client";



export interface EmailService {

    saveEmail(email: Email): Promise<Email>

    fetchEmailsPaginated(page: number, pageSize: number): Promise<Email[]>

    updateEmails(emails: Email[]): Promise<{count: number}>

}

