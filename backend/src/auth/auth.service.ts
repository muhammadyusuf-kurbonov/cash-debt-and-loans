import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  validate,
  parse,
  type User as TelegramUser,
} from '@tma.js/init-data-node';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(email: string, password: string, name?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = this.generateToken(user.id);
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  async authWithTelegram(initData: string) {
    // Validate the Telegram init data using the official library
    let telegramUser: TelegramUser;
    try {
      validate(initData, process.env.TELEGRAM_BOT_API_KEY || '');

      const initDataParsed = parse(initData);

      if (!initDataParsed.user) {
        throw new UnauthorizedException('Invalid Telegram auth data');
      }

      // Extract the user information from the validated data
      telegramUser = initDataParsed.user;
    } catch (error) {
      console.error('Error validating Telegram init data:', error);
      throw new UnauthorizedException('Invalid Telegram auth data');
    }

    const telegramId = String(telegramUser.id);
    const firstName = telegramUser.first_name;
    const lastName = telegramUser.last_name || '';
    const username = telegramUser.username || '';

    let user = await this.prisma.user.findUnique({
      where: { telegram_id: telegramId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegram_id: telegramId,
          name: firstName + (lastName ? ` ${lastName}` : ''),
        },
      });
    }

    const token = this.generateToken(user.id);
    return {
      token,
      user: { id: user.id, telegram_id: telegramId, name: user.name },
    };
  }

  async signIn(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id);
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  }

  private generateToken(userId: number) {
    return this.jwtService.sign({
      sub: userId,
    });
  }
}
