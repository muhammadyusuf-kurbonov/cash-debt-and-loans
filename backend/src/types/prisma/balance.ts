import { ApiProperty } from '@nestjs/swagger';

export class Balance {
  @ApiProperty({ type: Number })
  currency_id: number;

  @ApiProperty({ type: Number })
  amount: number;

  @ApiProperty({ type: Number })
  contact_id: number;
}
