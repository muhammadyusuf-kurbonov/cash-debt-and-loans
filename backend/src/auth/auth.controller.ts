import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';

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
  @ApiProperty()
  telegram_id: string;
  @ApiPropertyOptional()
  name?: string;
}

class AuthResponseDto {
  token: string;
  user: {
    id: number;
    email?: string;
    telegram_id?: string;
    name?: string;
  };
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
  @ApiHeader({
    name: 'x-telegram-bot-api-key',
    description: 'Telegram bot API key for authentication',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  async telegramSignUp(
    @Headers('x-telegram-bot-api-key') apiKey: string,
    @Body() telegramSignUpDto: TelegramAuthDto,
  ) {
    if (!apiKey || apiKey !== process.env.TELEGRAM_BOT_API_KEY) {
      throw new UnauthorizedException('Invalid API key');
    }

    return this.authService.authWithTelegram(
      telegramSignUpDto.telegram_id,
      telegramSignUpDto.name,
    );
  }
}
