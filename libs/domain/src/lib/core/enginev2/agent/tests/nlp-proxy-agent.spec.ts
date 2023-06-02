import { PromptResolverService, Step } from '../../../../ml'
import { createSandbox, SinonSandbox } from 'sinon'
import { NlpProxyAgent } from '../nlp-proxy-agent'
import { App } from '../../../../apps'
import { Sequencer } from '../../../engine/sequencer'
import { NlpProxyAgentAcceptParams } from '../agent'
import { AgentCaller } from '../../../engine/agent-caller'
import { IRazzleText } from '@razzle/widgets'
jest.mock('../../../engine/sequencer')

describe('NlpProxyAgent', () => {
  let sandbox: SinonSandbox
  let promptResolverService: jest.Mocked<PromptResolverService>
  let nlpProxyAgent: NlpProxyAgent
  let app: App
  let sequencer: jest.Mocked<Sequencer>
  let agentCaller: jest.Mocked<AgentCaller>

  beforeEach(() => {
    sandbox = createSandbox()
    promptResolverService = jest.mocked<PromptResolverService>(
      new PromptResolverService()
    )
    app = {
      id: 'test',
      name: 'test',
      description: 'test',
      apiKey: 'test',
      appId: 'test',
      creatorId: 'test',
      handle: 'test',
      isDefault: false,
      isPublic: false,
      infoUrl: 'test',
      updatedAt: new Date(),
      createdAt: new Date(),
      deleted: false,
      iconUrl: 'test',
      data: {
        actions: [
          {
            name: 'test',
            parameters: [],
            description: 'test',
            descriptionEmbedding: [],
            paged: false,
            stealth: false,
          },
        ],
        requiresAuth: false,
        sdkVersion: 'test',
      },
    }

    sequencer = jest.mocked<Sequencer>(
      new Sequencer(agentCaller, promptResolverService)
    )

    nlpProxyAgent = new NlpProxyAgent(app, promptResolverService, sequencer)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('accept', () => {
    it('Calls the prompt resolver service handle message', () => {
      const prompt = 'Hello'
      const handleSpy = jest.spyOn(promptResolverService, 'handleMessage')
      const params: NlpProxyAgentAcceptParams = {
        prompt,
        accountId: 'accountId',
        workspaceId: 'workspaceId',
        clientId: 'clientId',
        userId: 'userId',
      }
      nlpProxyAgent.accept(params)
      expect(handleSpy).toHaveBeenCalledWith(prompt, [app])
    })

    it('Executes the sequencer correctly', async () => {
      const prompt = 'Hello'
      const params: NlpProxyAgentAcceptParams = {
        prompt,
        accountId: 'accountId',
        workspaceId: 'workspaceId',
        clientId: 'clientId',
        userId: 'userId',
      }

      const steps = [
        {
          thought: 'I need to say hello back',
          actionDescription: 'Say hello back',
          actionName: 'echo',
          appId: 'test',
          appName: 'test',
          id: 1,
          razzleAppId: 'test',
          appDescription: 'test',
          containsOutputHallucination: false,
          errorMessage: '',
          isError: false,
          actionInput: [
            {
              name: 'message',
              value: 'Hello',
              type: 'text',
            },
          ],
        },
      ]

      jest
        .spyOn(promptResolverService, 'handleMessage')
        .mockResolvedValue(steps)

      jest.spyOn(sequencer, 'execute')
      await nlpProxyAgent.accept(params)

      expect(sequencer.execute).toHaveBeenCalledWith({
        accountId: params.accountId,
        workspaceId: params.workspaceId,
        userId: params.userId,
        appsInWorkspace: [app],
        promptSteps: {
          prompt: params.prompt,
          steps,
        },
      })
    })

    it('returns returns the output of the execute function', async () => {
      const prompt = 'Hello'
      const params: NlpProxyAgentAcceptParams = {
        prompt,
        accountId: 'accountId',
        workspaceId: 'workspaceId',
        clientId: 'clientId',
        userId: 'userId',
      }

      const steps = [
        {
          thought: 'I need to say hello back',
          actionDescription: 'Say hello back',
          actionName: 'echo',
          appId: 'test',
          appName: 'test',
          id: 1,
          razzleAppId: 'test',
          appDescription: 'test',
          containsOutputHallucination: false,
          errorMessage: '',
          isError: false,
          actionInput: [
            {
              name: 'message',
              value: 'Hello',
              type: 'text',
            },
          ],
        },
      ]

      jest
        .spyOn(promptResolverService, 'handleMessage')
        .mockResolvedValue(steps)

      const executeResponse: Step = {
        action: steps[0].actionName,
        actionInput: steps[0].actionInput.map((input) => input.value),
        id: steps[0].id,
        thought: steps[0].thought,
        containsOutputHallucination: steps[0].containsOutputHallucination,
        output: {
          ui: {
            getType: () => 'text',
            toJSON: () => ({ text: 'Hello!' } as IRazzleText),
          },
        },
      }

      jest.spyOn(sequencer, 'execute').mockResolvedValue(executeResponse)

      const response = await nlpProxyAgent.accept(params)

      expect(response).toStrictEqual(executeResponse.output)
    })
  })
})
