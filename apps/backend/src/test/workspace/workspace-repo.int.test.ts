import { faker } from '@faker-js/faker'
import ObjectID from 'bson-objectid'
import { PrismaService } from '../../app/prisma/prisma.service'
import { WorkspaceRepoImpl } from '../../app/workspace/workspace.repo-impl'
import { TestEnvironment } from '../containers/test-environment'

describe('WorkspaceRepoImpl', () => {
  let workspaceRepo: WorkspaceRepoImpl
  let prismaService: PrismaService
  let testEnvironment: TestEnvironment

  beforeAll(async () => {
    testEnvironment = new TestEnvironment()
    await testEnvironment.startTestContainers()
    prismaService = testEnvironment.getMongoClient()
    workspaceRepo = new WorkspaceRepoImpl(prismaService)
  }, 20000)

  afterEach(async () => {
    await prismaService.workspace.deleteMany({})
    await prismaService.workspaceApp.deleteMany({})
    await prismaService.app.deleteMany({})
    await prismaService.user.deleteMany({})
    await prismaService.account.deleteMany({})
  }, 20000)

  afterAll(async () => {
    await testEnvironment.shutdownTestContainers()
  })

  it('Can add an app to a workspace', async () => {
    const user = await prismaService.user.create({
      data: {
        authUid: faker.datatype.uuid(),
        email: faker.internet.email(),
        loginType: 'google',
        username: faker.internet.userName(),
      },              
    })

    const createdWorkspaceUser = await workspaceRepo.createWorkspaceWithUser({
      accountId: new ObjectID().toHexString(),
      name: faker.datatype.string(),
      description: faker.datatype.string(),
    }, user.id)
    const {workspace: createdWorkspace} = createdWorkspaceUser
    const createdApp = await prismaService.app.create({
      data: {
        apiKey: faker.datatype.uuid(),
        appId: faker.datatype.uuid(),
        name: faker.random.word(),
        description: faker.random.words(5),
        creator: {
          create: {
            name: faker.random.word(),
          },
        },
      },
    })

    await workspaceRepo.addAppToWorkspace(createdWorkspace.id, createdApp.id)
    const workspaces = await workspaceRepo.getAppsInWorkspace(
      createdWorkspace.id
    )
    expect(workspaces).toHaveLength(1)
    expect(workspaces[0].id).toEqual(createdApp.id)
    expect(workspaces[0].name).toEqual(createdApp.name)
  })

  it('can check if an app is in a workspace', async () => {
    const user = await prismaService.user.create({
      data: {
        authUid: faker.datatype.uuid(),
        email: faker.internet.email(),
        loginType: 'google',
        username: faker.internet.userName(),
      },              
    })
    const createdWorkspaceUser = await workspaceRepo.createWorkspaceWithUser({
      accountId: new ObjectID().toHexString(),
      name: faker.datatype.string(),
      description: faker.datatype.string(),      
    }, user.id)
    const {workspace: createdWorkspace} = createdWorkspaceUser

    const createdApp = await prismaService.app.create({
      data: {
        apiKey: faker.datatype.uuid(),
        appId: faker.datatype.uuid(),
        name: faker.random.word(),
        description: faker.random.words(5),
        creator: {
          create: {
            name: faker.random.word(),
          },
        },
      },
    })

    let isAppInWorkspace = await workspaceRepo.isAppInWorkspace(
      createdWorkspace.id,
      createdApp.id
    )
    expect(isAppInWorkspace).toEqual(false)

    await workspaceRepo.addAppToWorkspace(createdWorkspace.id, createdApp.id)
    isAppInWorkspace = await workspaceRepo.isAppInWorkspace(
      createdWorkspace.id,
      createdApp.id
    )
    expect(isAppInWorkspace).toEqual(true)
  })

  it('can add a user to a workspace', async () => {
    const user = await prismaService.user.create({
      data: {
        authUid: faker.datatype.uuid(),
        email: faker.internet.email(),
        loginType: 'google',
        username: faker.internet.userName(),
      },              
    })
    const createdWorkspaceUser = await workspaceRepo.createWorkspaceWithUser({
      accountId: new ObjectID().toHexString(),
      name: faker.datatype.string(),
      description: faker.datatype.string(),
    }, user.id)
    const {workspace: createdWorkspace} = createdWorkspaceUser
    
    const workspaceUser = await prismaService.workspaceUser.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: createdWorkspace.id,
          userId: user.id,
        },
      },
    })

    expect(workspaceUser).not.toBeNull()
    expect(workspaceUser?.userId).toEqual(user.id)
    expect(workspaceUser?.workspaceId).toEqual(createdWorkspace.id)
  })

  it('can find users in a workspace', async () => {
    const user = await prismaService.user.create({
      data: {
        authUid: faker.datatype.uuid(),
        email: faker.internet.email(),
        loginType: 'google',
        username: faker.internet.userName(),
      },              
    })

    const createdWorkspaceUser = await workspaceRepo.createWorkspaceWithUser({
      accountId: new ObjectID().toHexString(),
      name: faker.datatype.string(),
      description: faker.datatype.string(),
    }, user.id)
    const {workspace: createdWorkspace} = createdWorkspaceUser

    const users = await workspaceRepo.getAllUsersInWorkspace(
      createdWorkspace.id
    )
    expect(users).toHaveLength(1)
    expect(users[0].user.id).toEqual(user.id)
    expect(users[0].user.username).toEqual(user.username)
  })

  it('can return a paginated list of users in a workspace', async () => {
    const user = await prismaService.user.create({
      data: {
        authUid: faker.datatype.uuid(),
        email: faker.internet.email(),
        loginType: 'google',
        username: faker.internet.userName(),
      },              
    })
    const createdWorkspaceUser = await workspaceRepo.createWorkspaceWithUser({
      accountId: new ObjectID().toHexString(),
      name: faker.datatype.string(),
      description: faker.datatype.string(),
    }, user.id)
    const {workspace: createdWorkspace} = createdWorkspaceUser
   
    for (let i = 0; i < 19; i++) {
      const user = await prismaService.user.create({
        data: {
          authUid: faker.datatype.uuid(),
          email: faker.internet.email(),
          username: faker.internet.userName(),
          loginType: 'email',
        },
      })

      await workspaceRepo.addUserToWorkspace(createdWorkspace.id, user.id)
    }

    const users = await workspaceRepo.getUsersInWorkspace(createdWorkspace.id, {
      limit: 10,
    })
    expect(users.items).toHaveLength(10)
    expect(users.nextOffsetId).not.toBeNull()
    expect(users.nextOffsetId.length).toBeGreaterThan(0)

    const secondPage = await workspaceRepo.getUsersInWorkspace(
      createdWorkspace.id,
      { limit: 10, cursor: users.nextOffsetId }
    )
    expect(secondPage.items).toHaveLength(9)
    expect(secondPage.nextOffsetId).toBeNull()
  })
  
  it('can count users in workspace', async () => {
    const user = await prismaService.user.create({
      data: {
        authUid: faker.datatype.uuid(),
        email: faker.internet.email(),
        loginType: 'google',
        username: faker.internet.userName(),
      },              
    })
    const createdWorkspaceUser = await workspaceRepo.createWorkspaceWithUser({
      accountId: new ObjectID().toHexString(),
      name: faker.datatype.string(),
      description: faker.datatype.string(),
    }, user.id)
    const {workspace: createdWorkspace} = createdWorkspaceUser

    const secondWorkspaceUser = await workspaceRepo.createWorkspaceWithUser({
      accountId: new ObjectID().toHexString(),
      name: faker.datatype.string(),
      description: faker.datatype.string(),
    }, user.id)
    const {workspace: secondWorkspace} = secondWorkspaceUser

    for (let i = 0; i < 20; i++) {
      const user = await prismaService.user.create({
        data: {
          authUid: faker.datatype.uuid(),
          email: faker.internet.email(),
          username: faker.internet.userName(),
          loginType: 'email',
        },
      })

      await workspaceRepo.addUserToWorkspace(createdWorkspace.id, user.id)
    }

    const count = await workspaceRepo.countUsersInWorkspace(createdWorkspace.id)
    expect(count).toEqual(21)

    const countInSecondWorkspace = await workspaceRepo.countUsersInWorkspace(
      secondWorkspace.id
    )
    expect(countInSecondWorkspace).toEqual(1)
  })
})
