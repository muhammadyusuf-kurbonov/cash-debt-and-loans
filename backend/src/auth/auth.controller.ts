import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';

class SignUpDto {
  email: string;
  password: string;
  name?: string;
}

class SignInDto {
  email: string;
  password: string;
}

class TelegramAuthDto {
  @ApiProperty({ description: 'Telegram Web App init data string' })
  initData: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user with email and password' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: AuthResponseDto,
  })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(
      signUpDto.email,
      signUpDto.password,
      signUpDto.name,
    );
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('telegram_sigin')
  @ApiOperation({ summary: 'Sign up a new user through Telegram' })
  @ApiResponse({
    status: 201,
    description: 'User successfully authenticated via Telegram',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid Telegram auth data' })
  async telegramSignUp(@Body() telegramSignUpDto: TelegramAuthDto) {
    return this.authService.authWithTelegram(telegramSignUpDto.initData);
  }
}
