
import { Injectable } from '@nestjs/common';
import { Email, Prisma } from '@prisma/client';
import { EmailRepo } from '@razzle/services'
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class EmailRepoImpl implements EmailRepo {

    
    private prisma: PrismaService['app']


    constructor(private readonly prismaService: PrismaService) {
        this.prisma = prismaService.app
    }
    

    async saveEmail(email: Email): Promise<Email> {
        return this.prismaService.email.create({
            data: email
        })
    }


    async existsByReference(reference: string): Promise<boolean> {
        return await this.prismaService.email.count({
            where: {
                reference,
            }
        }) > 0
    }


    async findByReference(reference: string): Promise<Email> {
        return this.prismaService.email.findFirst({
            where: {
                reference,
            }
        })
    }


    async fetchUnsentEmailsPaginated(page: number, pageSize: number): Promise<Email[]> {
        return this.prismaService.email.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            where: {
                sent: false,
            }
        })
    }


    updateSentEmails(emails: Email[]): Promise<{count: number}> {
        return this.prismaService.email.updateMany({
            where: {
                id: {
                    in: emails.map(email => email.id)
                }
            },
            data: {
                sent: true,
                sentOn: new Date(),
            },
        })
    }


}

