// import { faker } from '@faker-js/faker'
// import { CreateUserDto } from '@fidio/dto'
// import { StoreFront, User } from '@prisma/client'
// import { createMock } from 'ts-auto-mock'
// import { DuplicateStoreFrontException, StoreFrontService } from '../../storefront'
// import { fakeStoreFront, fakeUserEntity } from '../../testing'
// import { DuplicateUserException } from '../exceptions'
// import { UserRepo } from '../user.repo'
// import { UserService } from '../user.service'

// describe('UserServiceTests', () => {
//   let userRepo: UserRepo = createMock<UserRepo>()
//   let storeFrontService: StoreFrontService = createMock<StoreFrontService>()
//   let userService: UserService

//   beforeEach(() => {
//     userService = new UserService(userRepo, storeFrontService)
//     jest.clearAllMocks()
//   })

//   describe('createUser', () => {
//     it('calls userRepo to create user', async () => {
//       const mockEmail = 'janedoe@gmail.com'
//       const mockUser = fakeUserEntity({ email: mockEmail })
//       const createUserDto: CreateUserDto = {
//         authId: mockUser.authId,
//         email: mockUser.email,
//         fullName: 'Jane Doe',
//       }

//       userRepo = createMock<UserRepo>({
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         findByEmail: jest.fn(async (email: string): Promise<User | null> => {
//           return null
//         }),
//         createUser: jest.fn(
//           // eslint-disable-next-line @typescript-eslint/no-unused-vars
//           async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ userId: string; authId: string }> => {
//             return { userId: mockUser.id, authId: mockUser.authId }
//           }
//         ),
//       })

//       userService = new UserService(userRepo, storeFrontService)

//       const createUserRes = await userService.createUser(createUserDto)

//       expect(userRepo.findByEmail).toBeCalledWith(createUserDto.email)
//       expect(userRepo.createUser).toBeCalledWith({ authId: createUserDto.authId, email: createUserDto.email })
//       expect(createUserRes).toMatchObject({ userId: mockUser.id, authId: mockUser.authId })
//     })

//     it('throws DuplicateUserException if the user already exists', async () => {
//       const mockEmail = 'johndoe@gmail.com'
//       const mockUser = fakeUserEntity({ email: mockEmail })
//       const createUserDto: CreateUserDto = {
//         authId: mockUser.authId,
//         email: mockUser.email,
//         fullName: 'John Doe',
//       }

//       userRepo = createMock<UserRepo>({
//         findByEmail: jest.fn(async (email: string): Promise<User | null> => {
//           if (email !== mockEmail) {
//             return null
//           }
//           return mockUser
//         }),
//       })
//       userService = new UserService(userRepo, storeFrontService)

//       try {
//         await userService.createUser(createUserDto)
//       } catch (error) {
//         expect(error).toBeInstanceOf(DuplicateUserException)
//       }
//     })
//   })

//   describe('createStoreFront', () => {
//     it('creates a storefront', async () => {
//       const mockSubdomain = 'johndoe'
//       const mockEmail = 'johndoe@gmail.com'
//       const mockUserId = faker.datatype.uuid()
//       const mockUser = fakeUserEntity({ id: mockUserId, email: mockEmail })
//       const mockStoreFront = fakeStoreFront({ subdomain: mockSubdomain })

//       storeFrontService = createMock<StoreFrontService>({
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         findBySubdomain: jest.fn(async (subdomain: string): Promise<StoreFront | null> => null),
//       })
//       userRepo = createMock<UserRepo>({
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         createStoreFront: jest.fn(async (userId, subdomain): Promise<User & { storeFronts: StoreFront[] }> => {
//           return {
//             ...mockUser,
//             storeFronts: [mockStoreFront],
//           }
//         }),
//       })

//       userService = new UserService(userRepo, storeFrontService)

//       const createdStoreFront = await userService.createStoreFront(mockUserId, mockSubdomain)

//       expect(storeFrontService.findBySubdomain).toBeCalledWith(mockSubdomain)
//       expect(userRepo.createStoreFront).toBeCalledWith(mockUserId, mockSubdomain)
//       expect(createdStoreFront).toMatchObject({
//         ...mockStoreFront,
//       })
//     })

//     it('throws a DuplicateStoreFrontException if the subdomain is already in use', async () => {
//       const mockSubdomain = 'johndoe'
//       const mockUserId = faker.datatype.uuid()
//       const mockStoreFront = fakeStoreFront({ subdomain: mockSubdomain })

//       storeFrontService = createMock<StoreFrontService>({
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         findBySubdomain: jest.fn(async (subdomain: string): Promise<StoreFront | null> => mockStoreFront),
//       })

//       userService = new UserService(userRepo, storeFrontService)

//       try {
//         await userService.createStoreFront(mockUserId, mockSubdomain)
//       } catch (err) {
//         expect(err).toBeInstanceOf(DuplicateStoreFrontException)
//       }

//       expect(storeFrontService.findBySubdomain).toBeCalledWith(mockSubdomain)
//       expect(userRepo.createStoreFront).not.toBeCalled()
//     })
//   })
// })
