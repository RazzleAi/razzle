import { Injectable } from '@nestjs/common'
import { ConnectedClients } from '@razzle/domain'

@Injectable()
export class ConnectedClientsImpl extends ConnectedClients {}
