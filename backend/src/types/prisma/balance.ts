import { ApiProperty } from '@nestjs/swagger';

export class Balance {
  @ApiProperty({ type: Number })
  currency_id: number;

  @ApiProperty({ type: Number, example: 0 })
  amount: number = 0;

  @ApiProperty({ type: Number })
  contact_id: number;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}
