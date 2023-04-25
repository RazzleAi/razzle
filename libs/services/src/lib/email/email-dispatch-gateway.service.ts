import { Email } from "@prisma/client";



export interface EmailDispatchGateway {


    dispatchEmail(map: Map<string, unknown>): Promise<Email>


}
