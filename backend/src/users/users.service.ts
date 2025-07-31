import { Injectable } from '@nestjs/common';
import { SignUpWithEmailDto as SignupWithEmailDto } from './dto/signup-with-email.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private client: PrismaService) {}

  signupWithEmail(createUserDto: SignupWithEmailDto) {
    return this.client.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
      },
    });
  }
}
