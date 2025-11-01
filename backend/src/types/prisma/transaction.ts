import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Transaction {
  @ApiProperty({ type: Number })
  id: number;

  @ApiPropertyOptional({ type: Number })
  contact_id: number | null;

  @ApiProperty({ type: Number })
  currency_id: number;

  @ApiProperty({ type: Number })
  user_id: number;

  @ApiProperty({ type: Number })
  amount: number;

  @ApiPropertyOptional({ type: String })
  note: string | null;

  @ApiPropertyOptional({ type: String })
  draftId: string | null;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiPropertyOptional({ type: Date })
  deletedAt: Date | null;
}
