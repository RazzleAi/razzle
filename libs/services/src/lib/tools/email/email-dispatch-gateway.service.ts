import { Email } from "./types";

export interface EmailDispatchGateway {
  dispatchEmail(map: Map<string, unknown>): Promise<Email>
}
