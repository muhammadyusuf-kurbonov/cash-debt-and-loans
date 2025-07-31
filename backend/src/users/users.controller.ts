import { Body, Controller, Post } from '@nestjs/common';
import { User } from 'generated/prisma';
import { SignUpWithEmailDto } from './dto/signup-with-email.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  async create(@Body() createUserDto: SignUpWithEmailDto): Promise<User> {
    return await this.usersService.signupWithEmail(createUserDto);
  }
}
