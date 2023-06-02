import {
  MeResponseDto,
  ThirdPartyAuthAccountInviteDto,
  ThirdPartyAuthDto,
  ThirdPartyAuthResponseDto,
} from '@razzle/dto'
import { DuplicateUserException, SignupException } from '@razzle/domain'
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Query,
} from '@nestjs/common'
import { ExceptionResponse, UseExceptionResponseHandler } from '../decorators'
import { AuthServiceImpl } from './auth.service-impl'
import { SkipAuth } from './decorators/no-auth.decorator'
import { Principal, PrincipalKey } from './decorators'
import { User } from '@prisma/client'

@UseExceptionResponseHandler()
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  constructor(private readonly authService: AuthServiceImpl) {}

  @ExceptionResponse(
    {
      types: [DuplicateUserException],
      statusCode: HttpStatus.CONFLICT,
      message: 'A user with this email already exists',
    },
    {
      types: [SignupException],
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Signup failed',
    }
  )
  @SkipAuth()
  @Post('third-party')
  thirdPartyAuth(
    @Body() signupDto: ThirdPartyAuthDto
  ): Promise<ThirdPartyAuthResponseDto> {
    return this.authService.thirdPartyAuth(signupDto)
  }

  @ExceptionResponse(
    {
      types: [DuplicateUserException],
      statusCode: HttpStatus.CONFLICT,
      message: 'A user with this email already exists',
    },
    {
      types: [SignupException],
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Signup failed',
    }
  )
  @SkipAuth()
  @Post('third-party/account-invite')
  thirdPartyAuthAccountInvite(
    @Body() signupDto: ThirdPartyAuthAccountInviteDto
  ): Promise<ThirdPartyAuthResponseDto> {
    return this.authService.thirdPartyAuthWithAccountInvite(signupDto)
  }

  @SkipAuth()
  @Get('email/available')
  async isEmailAvailable(@Query('email') email: string): Promise<boolean> {
    return !(await this.authService.isEmailTaken(email))
  }

  @Get('/me')
  async getMe(
    @Principal(PrincipalKey.User) user: User
  ): Promise<MeResponseDto> {
    return {
      userId: user.id,
      authUid: user.authUid,
      user: user,
    }
  }
}
