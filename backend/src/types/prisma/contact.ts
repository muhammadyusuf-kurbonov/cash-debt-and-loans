import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Contact {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiPropertyOptional({ type: String })
  name: string | null;

  @ApiPropertyOptional({ type: Number })
  ref_user_id: number | null;
}
