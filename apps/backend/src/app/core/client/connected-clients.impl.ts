import { Injectable } from '@nestjs/common'
import { ConnectedClients } from '@razzle/services'

@Injectable()
export class ConnectedClientsImpl extends ConnectedClients {}
