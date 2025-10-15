import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Transaction {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  contact_id: number;

  @ApiProperty({ type: Number })
  currency_id: number;

  @ApiProperty({ type: Number })
  amount: number;

  @ApiPropertyOptional({ type: String })
  note?: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiPropertyOptional({ type: Date })
  deletedAt?: Date;
}
