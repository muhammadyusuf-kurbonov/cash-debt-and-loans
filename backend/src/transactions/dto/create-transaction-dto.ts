import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ type: Number })
  contact_id: number;

  @ApiProperty({ type: Number })
  currency_id: number;

  @ApiProperty({ type: Number })
  amount: number;

  @ApiPropertyOptional({ type: String })
  note?: string;
}
