import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ProfileDto } from './dto/profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async assertUserByTGId(telegram_id: number, name?: string): Promise<User> {
    return await this.prisma.user.upsert({
      where: { telegram_id: telegram_id.toString() },
      create: {
        telegram_id: telegram_id.toString(),
        name,
      },
      update: {
        telegram_id: telegram_id.toString(),
        name,
      },
    });
  }

  async getUserById(user_id: number): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { id: user_id },
    });

    return user;
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        telegram_id: true,
        is_verified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Transform null values to undefined to match DTO expectations
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      telegram_id: user.telegram_id,
      is_verified: user.is_verified,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: number, name?: string, email?: string) {
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new UnauthorizedException('Email is already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        telegram_id: true,
        is_verified: true,
        createdAt: true,
      },
    });

    // Transform null values to undefined to match DTO expectations
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      telegram_id: user.telegram_id,
      is_verified: user.is_verified,
      createdAt: user.createdAt,
    };
  }

  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<ProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User does not have a password set');
    }

    // Verify current password
    const isPasswordValid = user.password
      ? await bcrypt.compare(currentPassword, user.password)
      : true;
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        telegram_id: true,
        is_verified: true,
        createdAt: true,
      },
    });

    // Transform null values to undefined to match DTO expectations
    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      telegram_id: updatedUser.telegram_id,
      is_verified: updatedUser.is_verified,
      createdAt: updatedUser.createdAt,
    };
  }
}
