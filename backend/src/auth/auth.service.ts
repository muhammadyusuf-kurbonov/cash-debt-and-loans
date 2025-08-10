import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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

  async authWithTelegram(telegramId: string, name?: string) {
    let user = await this.prisma.user.findUnique({
      where: { telegram_id: telegramId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegram_id: telegramId,
          name,
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
