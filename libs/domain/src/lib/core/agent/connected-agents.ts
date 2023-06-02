import { Agent } from './agent'

export class ConnectedAgents {
  private agentsById = new Map<string, Agent>()
  private agentsPerAppID = new Map<string, string[]>()

  async addAgent(agent: Agent, appId: string) {
    this.agentsById.set(agent.id, agent)
    const agentIds = this.agentsPerAppID.get(appId) || []
    const newAgentIds = [...agentIds, agent.id]
    this.agentsPerAppID.set(appId, newAgentIds)
  }

  removeAgent(agent: Agent) {
    const agentId = agent.id
    const appId = agent.razzleAppId

    this.agentsById.delete(agentId)
    const newAgentIds = (this.agentsPerAppID.get(appId) || []).filter(
      (id) => id !== agentId
    )
    if (newAgentIds.length > 0) {
      this.agentsPerAppID.set(appId, newAgentIds)
    } else {
      this.agentsPerAppID.delete(appId)
    }
  }

  public getAgentForAppId(razzleAppId: string): Agent | undefined {
    const agentsForAppId = this.agentsPerAppID.get(razzleAppId) || []
    if (agentsForAppId.length === 0) {
      return undefined
    }

    const idx = this.generateRandomInteger(agentsForAppId.length - 1)
    const agentId = agentsForAppId[idx - 1]
    const agent = this.agentsById.get(agentId)
    return agent
  }

  public getAgents(): Agent[] {
    return Array.from(this.agentsById.values())
  }

  private generateRandomInteger(max: number) {
    return Math.floor(Math.random() * max) + 1
  }
}
