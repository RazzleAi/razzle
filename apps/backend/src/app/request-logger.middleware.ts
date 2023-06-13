import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { IncomingMessage, ServerResponse } from "http";

@Injectable()
export class RequestLogger implements NestMiddleware {
    private readonly logger = new Logger(RequestLogger.name)
    use(req: IncomingMessage, res: ServerResponse, next: (error?: unknown) => void) {
        this.logger.log(`Request: ${req.method} ${req.url}`)
        next()
    }
}