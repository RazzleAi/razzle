
import { Email, Prisma } from '@prisma/client';


export interface EmailRepo {


    saveEmail(email: Email): Promise<Email>;

    existsByReference(emailReference: string): Promise<boolean>;

    findByReference(emailReference: string): Promise<Email | null>;

    fetchUnsentEmailsPaginated(page: number, pageSize: number): Promise<Email[]>;

    updateSentEmails(emails: Email[]): Promise<{count: number}>;

}



