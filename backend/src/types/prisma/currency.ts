import { ApiProperty } from '@nestjs/swagger';

export class Currency {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  symbol: string;

  @ApiProperty({ type: Date })
  createdAt: Date;
}
