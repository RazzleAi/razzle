import { Injectable, Logger, NestMiddleware } from "@nestjs/common";

@Injectable()
export class RequestLogger implements NestMiddleware {
    private readonly logger = new Logger(RequestLogger.name)
    use(req: any, res: any, next: (error?: any) => void) {
        this.logger.log(`Request: ${req.method} ${req.url} Headers: ${req.rawHeaders} `)
        next()
    }
}