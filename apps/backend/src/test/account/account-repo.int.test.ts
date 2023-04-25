import { CreateAccountData } from '@razzle/services'
import { AccountRepoImpl } from '../../app/account/account.repo-impl'
import { PrismaService } from '../../app/prisma/prisma.service'
import { TestEnvironment } from '../containers/test-environment'

describe('AccountRepoImpl', () => {
  let accountRepo: AccountRepoImpl
  let prismaService: PrismaService
  let testEnvironment: TestEnvironment

  beforeAll(async () => {
    testEnvironment = new TestEnvironment()
    await testEnvironment.startTestContainers()
    prismaService = testEnvironment.getMongoClient()
    accountRepo = new AccountRepoImpl(prismaService)
  }, 20000)

  afterEach(async () => {
    await prismaService.account.deleteMany({})
    await prismaService.user.deleteMany({})
  }, 20000)

  afterAll(async () => {
    await testEnvironment.shutdownTestContainers()
  })

  it('can create an account', async () => {
    // const testOwnerId = new ObjectID().toHexString()
    const user = await prismaService.user.create({
      data: {
        email: 'user@gmail.com',
        authUid: 'auth-uid',
        loginType: 'google',
        username: 'user',
      },
    })

    expect(user).toBeDefined()
    expect(user).not.toBeNull()
    expect(user.id).toBeDefined()

    const data: CreateAccountData = {
      name: 'test-account',
      ownerId: user.id,
      enableDomainMatching: true,
      matchDomain: 'test.com',
    }

    const created = await accountRepo.createAccount(data)
    expect(created).toBeDefined()
    expect(created).not.toBeNull()
    expect(created.id).toBeDefined()
    expect(created.name).toEqual(data.name)
    expect(created.owner).not.toBeNull()
    expect(created.owner.id).toEqual(user.id)
    expect(created.owner.username).toEqual(user.username)
    expect(created.enableDomainMatching).toEqual(data.enableDomainMatching)
    expect(created.matchDomain).toEqual(data.matchDomain)

    const accountUser = await prismaService.accountUser.findUnique({
      where: {
        accountId_userId_isOwner: {
          accountId: created.id,
          userId: user.id,
          isOwner: true,
        },
      },
    })
    expect(accountUser).toBeDefined()
    expect(accountUser).not.toBeNull()
    expect(accountUser.accountId).toEqual(created.id)
    expect(accountUser.userId).toEqual(user.id)
    expect(accountUser.isOwner).toEqual(true)
  })

  it('can find an account by owner id', async () => {
    const user = await prismaService.user.create({
      data: {
        email: 'email@gmail.com',
        authUid: 'test-auth-uid',
        loginType: 'google',
        username: 'user1',
      },
    })

    const data: CreateAccountData = {
      name: 'test-account',
      ownerId: user.id,
      enableDomainMatching: true,
      matchDomain: 'test.com',
    }
    const data2 = {
      name: 'test-account-2',
      ownerId: user.id,
      enableDomainMatching: false,
    }

    const account1 = await accountRepo.createAccount(data)
    const account2 = await accountRepo.createAccount(data2)

    const accounts = await accountRepo.getAccountsByOwnerId(user.id)
    expect(accounts).toBeDefined()
    expect(accounts).not.toBeNull()
    expect(accounts.length).toEqual(2)

    expect(accounts[0].id).toEqual(account1.id)
    expect(accounts[0].name).toEqual(account1.name)
    expect(accounts[0].owner).toBeDefined()
    expect(accounts[0].owner).not.toBeNull()
    expect(accounts[0].owner.id).toEqual(user.id)
    expect(accounts[0].owner.username).toEqual(user.username)
    expect(accounts[0].enableDomainMatching).toEqual(data.enableDomainMatching)
    expect(accounts[0].matchDomain).toEqual(data.matchDomain)

    expect(accounts[1].id).toEqual(account2.id)
    expect(accounts[1].name).toEqual(account2.name)
    expect(accounts[1].owner).toBeDefined()
    expect(accounts[1].owner).not.toBeNull()
    expect(accounts[1].owner.id).toEqual(user.id)
    expect(accounts[1].owner.username).toEqual(user.username)
    expect(accounts[1].enableDomainMatching).toEqual(data2.enableDomainMatching)
    expect(accounts[1].matchDomain).toBeNull()
  })

  it('can add a user to an account', async () => {
    const user = await prismaService.user.create({
      data: {
        email: 'email@gmail.com',
        authUid: 'test-auth-uid',
        loginType: 'google',
        username: 'user1',
      },
    })

    const data: CreateAccountData = {
      name: 'test-account',
      ownerId: user.id,
    }

    const account = await accountRepo.createAccount(data)

    const user2 = await prismaService.user.create({
      data: {
        email: 'email2@gmail.com',
        authUid: 'test-auth-uid-2',
        loginType: 'google',
        username: 'user2',
      },
    })

    const accountUser = await accountRepo.addUserToAccount(user2.id, account.id)

    expect(accountUser).toBeDefined()
    expect(accountUser).not.toBeNull()
    expect(accountUser.accountId).toEqual(account.id)
    expect(accountUser.userId).toEqual(user2.id)
  })

  it('Adding a user to an account twice does nothing', async () => {
    const user = await prismaService.user.create({
      data: {
        email: 'email@gmail.com',
        authUid: 'test-auth-uid',
        loginType: 'google',
        username: 'user1',
      },
    })

    const data: CreateAccountData = {
      name: 'test-account',
      ownerId: user.id,
    }

    const account = await accountRepo.createAccount(data)

    const user2 = await prismaService.user.create({
      data: {
        email: 'email2@gmail.com',
        authUid: 'test-auth-uid-2',
        loginType: 'google',
        username: 'user2',
      },
    })

    await accountRepo.addUserToAccount(user2.id, account.id)

    const secondAttempt = async () => {
      await accountRepo.addUserToAccount(user2.id, account.id)
    }
    secondAttempt()

    const results = await prismaService.accountUser.findMany({where: {accountId: account.id, userId: user2.id}})
    expect(results.length).toEqual(1)
  })

  it('can check if a user is in an account', async () => {
    const user = await prismaService.user.create({
      data: {
        email: 'email@gmail.com',
        authUid: 'test-auth-uid',
        loginType: 'google',
        username: 'user1',
      },
    })

    const user2 = await prismaService.user.create({
      data: {
        email: 'email2@gmail.com',
        authUid: 'test-auth-uid-2',
        loginType: 'google',
        username: 'user2',
      },
    })

    const data: CreateAccountData = {
      name: 'test-account',
      ownerId: user.id,
    }

    const account = await accountRepo.createAccount(data)

    let isUserInAccount = await accountRepo.isUserInAccount(user.id, account.id)
    expect(isUserInAccount).toEqual(true)

    isUserInAccount = await accountRepo.isUserInAccount(user2.id, account.id)
    expect(isUserInAccount).toEqual(false)

    await accountRepo.addUserToAccount(user2.id, account.id)
    isUserInAccount = await accountRepo.isUserInAccount(user2.id, account.id)
    expect(isUserInAccount).toEqual(true)
  })

  it('can get all the accounts a user belongs to', async () => {
    const user = await prismaService.user.create({
      data: {
        email: 'email@gmail.com',
        authUid: 'test-auth-uid',
        loginType: 'google',
        username: 'user1',
      },
    })

    const user2 = await prismaService.user.create({
      data: {
        email: 'email2@gmail.com',
        authUid: 'test-auth-uid-2',
        loginType: 'google',
        username: 'user2',
      },
    })

    const data: CreateAccountData = {
      name: 'test-account',
      ownerId: user.id,
    }

    const data2: CreateAccountData = {
      name: 'test-account-2',
      ownerId: user.id,
    }

    const account1 = await accountRepo.createAccount(data)
    const account2 = await accountRepo.createAccount(data2)
    await accountRepo.addUserToAccount(user2.id, account1.id)
    await accountRepo.addUserToAccount(user2.id, account2.id)

    const accounts = await accountRepo.getUserAccounts(user2.id)
    expect(accounts).toBeDefined()
    expect(accounts).not.toBeNull()
    expect(accounts.length).toEqual(2)
    expect(accounts[0].id).toEqual(account1.id)
    expect(accounts[1].id).toEqual(account2.id)
  })
})
