import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'User display name', example: 'John Doe' })
  name: string | null;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  email: string | null;

  @ApiProperty({ description: 'Telegram ID', example: '123456789' })
  telegram_id: string | null;

  @ApiProperty({ description: 'Account verification status' })
  is_verified: boolean;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;
}
