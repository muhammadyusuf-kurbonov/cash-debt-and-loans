import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiPropertyOptional({ type: String })
  email?: string;

  @ApiPropertyOptional({ type: String })
  telegram_id?: string;

  @ApiPropertyOptional({ type: String })
  name?: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: String })
  token: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
