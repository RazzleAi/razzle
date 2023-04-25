// import { INestApplication } from '@nestjs/common'
// import { Test } from '@nestjs/testing'
// import {
//   AccountRepo,
//   AccountService,
//   AppsRepo,
//   AppsService,
//   ArgsExtractorService,
//   DefaultAppsService,
//   EmbeddingSearchService,
//   EmbeddingService,
//   WorkspaceRepo,
//   WorkspaceService,
// } from '@razzle/services'
// import * as request from 'supertest'
// import { AccountModule } from '../../app/account/account.module'
// import { AccountRepoImpl } from '../../app/account/account.repo-impl'
// import { AccountServiceImpl } from '../../app/account/account.service-impl'
// import { PrismaService } from '../../app/prisma/prisma.service'
// import { WorkspaceServiceImpl } from '../../app/workspace/workspace.service-impl'
// import { TestEnvironment } from '../containers/test-environment'
// import { createMock } from '@golevelup/ts-jest'
// import { WorkspaceRepoImpl } from '../../app/workspace/workspace.repo-impl'
// import { AppsRepoImpl } from '../../app/apps/apps.repo-impl'
// import { User } from '@prisma/client'
// import { MockAuthGuard } from '../utils/mock-auth-guard.test'
// import { APP_GUARD } from '@nestjs/core'
// import { faker } from '@faker-js/faker'


// describe('AccountController', () => {
//   let app: INestApplication

//   let testEnvironment: TestEnvironment
//   let prismaService: PrismaService
//   let accountRepo: AccountRepo
//   let appsRepo: AppsRepo
//   let workspaceRepo: WorkspaceRepo
//   let embeddingSearchService: EmbeddingSearchService
//   let argsExtractorService: ArgsExtractorService
//   let embeddingService: EmbeddingService

//   let defaultAppsService: DefaultAppsService
//   let appsService: AppsService
//   let workspaceService: WorkspaceService
//   let accountService: AccountService

//   let mockAuthGuard: MockAuthGuard

//   beforeAll(async () => {
//     testEnvironment = new TestEnvironment()
//     await testEnvironment.startTestContainers()
//     prismaService = testEnvironment.getMongoClient()

//     mockAuthGuard = new MockAuthGuard(prismaService)

//     accountRepo = new AccountRepoImpl(prismaService)
//     appsRepo = new AppsRepoImpl(prismaService)
//     workspaceRepo = new WorkspaceRepoImpl(prismaService)

//     embeddingService = createMock<EmbeddingService>()
//     embeddingSearchService = createMock<EmbeddingSearchService>()
//     argsExtractorService = createMock<ArgsExtractorService>()

//     defaultAppsService = new DefaultAppsService()

//     appsService = new AppsService(appsRepo, embeddingService)
//     workspaceService = new WorkspaceService(
//       workspaceRepo,
//       embeddingSearchService,
//       argsExtractorService,
//       appsService,
//       defaultAppsService
//     )
//     accountService = new AccountService(accountRepo, workspaceService)
//   }, 20000)

//   beforeEach(async () => {
//     const module = await Test.createTestingModule({
//       imports: [AccountModule],
//     })
//       .overrideProvider(PrismaService)
//       .useValue(prismaService)
//       .overrideProvider(APP_GUARD)
//       .useValue(mockAuthGuard)
//       .overrideProvider(AccountServiceImpl)
//       .useValue(accountService)
//       .compile()

//     app = module.createNestApplication()
//     await app.init()
//   }, 20000)

//   afterAll(async () => {
//     prismaService.user.deleteMany({})
//     prismaService.workspace.deleteMany({})
//     prismaService.account.deleteMany({})

//     await testEnvironment.shutdownTestContainers()
//   })

//   it('/account (POST)', async () => {
//     const user = await createTestUser(prismaService)
//     return request(app.getHttpServer())
//       .post('/account')
//       .set('Authorization', `Bearer ${user.authUid}`)
//       .send({
//         name: 'Test Account',
//       })
//       .expect(201)
//       .expect({
//         id: expect.any(String),
//         name: 'Test Account',
//       })
//   })
// })

// function createTestUser(prismaService: PrismaService): Promise<User> {
//   return prismaService.user.create({
//     data: {
//       username: 'user123',
//       email: 'user10234@gmail.com',
//       loginType: 'google',
//       authUid: faker.datatype.uuid(),
//     },
//   })
// }
