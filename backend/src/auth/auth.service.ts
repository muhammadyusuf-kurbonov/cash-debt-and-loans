import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

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
    // Parse the initData
    const urlParams = new URLSearchParams(initData);
    const authData: Record<string, string> = {};
    
    for (const [key, value] of urlParams) {
      authData[key] = value;
    }

    // Verify the authentication data
    if (!this.validateTelegramAuthData(authData)) {
      throw new UnauthorizedException('Invalid Telegram auth data');
    }

    const telegramId = authData['id'];
    const firstName = authData['first_name'];
    const lastName = authData['last_name'];
    const username = authData['username'];
    
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

  private validateTelegramAuthData(authData: Record<string, string>): boolean {
    const { hash, auth_date, ...requiredData } = authData;

    if (!hash) {
      return false;
    }

    // Check if the auth date is not too old (within 1 hour)
    const authTime = parseInt(authData.auth_date, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authTime > 3600) {  // 1 hour
      return false;
    }

    // Create the data string to verify the hash
    const dataToCheck = Object.entries(requiredData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Calculate the secret key (SHA256 of bot token)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.TELEGRAM_BOT_TOKEN || '')
      .digest();

    // Calculate the hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataToCheck)
      .digest('hex');

    return calculatedHash === hash;
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
