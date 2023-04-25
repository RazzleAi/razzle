import {
  AuthRepo,
  UserAuthRecord,
  UserService,
  AuthService,
  SignupException,
  CreateAuthUserReq,
  fakeUserRecord,
} from '@fidio/usecase'
import { jest } from '@jest/globals'
import { createMock } from 'ts-auto-mock'
import { On, method } from 'ts-auto-mock/extension'
import { CreateUserResponseDto, SignupDto } from '@fidio/dto'
import { faker } from '@faker-js/faker'

describe('AuthServiceTests', () => {
  let authRepo: AuthRepo = createMock<AuthRepo>()
  let userService: UserService = createMock<UserService>()
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService(authRepo, userService)
  })

  describe('isEmailTaken', () => {
    it('should call authRepo to check if record for user exists', async () => {
      const testEmail = 'email@host.com'
      authRepo = createMock<AuthRepo>({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getUserByEmail: jest.fn(async (email: string): Promise<UserAuthRecord> => {
          return fakeUserRecord({ email: testEmail })
        }),
      })

      authService = new AuthService(authRepo, userService)

      const isEmailTaken = await authService.isEmailTaken(testEmail)

      expect(authRepo.getUserByEmail).toBeCalledWith(testEmail)
      expect(isEmailTaken).toBe(true)
    })

    it('should return false if record for user does not exist', async () => {
      const testEmail = 'email@host.com'
      authRepo = createMock<AuthRepo>({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getUserByEmail: jest.fn(async (email: string): Promise<UserAuthRecord> => {
          throw new Error('User not found')
        }),
      })

      authService = new AuthService(authRepo, userService)

      const isEmailTaken = await authService.isEmailTaken(testEmail)

      expect(authRepo.getUserByEmail).toBeCalledWith(testEmail)
      expect(isEmailTaken).toBe(false)
    })
  })

  describe('signup', () => {
    it('creates a user using the auth repo and the user service', async () => {
      const mockEmail = 'johndoe@gmail.com'
      const signupRequest: SignupDto = {
        email: mockEmail,
        fullname: 'John Doe',
        password: '12345678',
      }
      const mockAuthUser = fakeUserRecord({ email: signupRequest.email })
      const mockAuthToken = faker.datatype.uuid()

      authRepo = createMock<AuthRepo>({
        createUser: jest.fn(async (): Promise<{ user: UserAuthRecord; authToken: string }> => {
          return { user: mockAuthUser, authToken: mockAuthToken }
        }),
      })

      const mockUserId = faker.datatype.uuid()
      userService = createMock<UserService>({
        createUser: jest.fn(async (): Promise<CreateUserResponseDto> => {
          return {
            authId: mockAuthUser.uid,
            userId: mockUserId,
          }
        }),
      })

      authService = new AuthService(authRepo, userService)
      const signupResponse = await authService.signup(signupRequest)

      expect(authRepo.createUser).toBeCalledWith({
        email: signupRequest.email,
        displayName: signupRequest.fullname,
        password: signupRequest.password,
      })
      expect(userService.createUser).toBeCalledWith({
        authId: mockAuthUser.uid,
        email: mockAuthUser.email,
        fullName: mockAuthUser.displayName,
      })

      expect(signupResponse).toMatchObject({ authId: mockAuthUser.uid, userId: mockUserId, token: mockAuthToken })
    })

    it('throws SignupException if authRepo.createUser fails', async () => {
      const mockEmail = 'johndoe@gmail.com'
      const signupRequest: SignupDto = {
        email: mockEmail,
        fullname: 'John Doe',
        password: '12345678',
      }

      authRepo = createMock<AuthRepo>({
        createUser: jest.fn(async (): Promise<{ user: UserAuthRecord; authToken: string }> => {
          throw new Error('AuthRepoError')
        }),
      })

      authService = new AuthService(authRepo, userService)
      try {
        await authService.signup(signupRequest)
      } catch (error) {
        expect(error).toBeInstanceOf(SignupException)
      }
    })

    it('throwse SignupException and removes auth user if userService.createUser fails', async () => {
      const mockEmail = 'johndoe@gmail.com'
      const signupRequest: SignupDto = {
        email: mockEmail,
        fullname: 'John Doe',
        password: '12345678',
      }
      const mockAuthUser = fakeUserRecord({ email: signupRequest.email })
      const mockAuthToken = faker.datatype.uuid()

      authRepo = createMock<AuthRepo>({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        createUser: jest.fn(async (req: CreateAuthUserReq) => {
          return { user: mockAuthUser, authToken: mockAuthToken }
        }),
      })
      const mockDeleteUser = On(authRepo).get(method('deleteUser'))

      userService = createMock<UserService>({
        createUser: jest.fn(async (): Promise<CreateUserResponseDto> => {
          throw new Error('UserService error')
        }),
      })

      authService = new AuthService(authRepo, userService)
      try {
        await authService.signup(signupRequest)
      } catch (error) {
        expect(error).toBeInstanceOf(SignupException)
      }
      expect(mockDeleteUser).toBeCalled()
    })
  })
})
