import { Injectable } from '@nestjs/common'
import { ConnectedAgents } from '@razzle/services'

@Injectable()
export class ConnectedAgentsImpl extends ConnectedAgents {}
