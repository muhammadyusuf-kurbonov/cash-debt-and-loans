import { ApiProperty } from '@nestjs/swagger';

export class SummaryDto {
  @ApiProperty()
  currencyId: number;

  @ApiProperty()
  currencySymbol: string;

  @ApiProperty()
  owedToMe: number;

  @ApiProperty()
  iOwe: number;

  @ApiProperty()
  netBalance: number;
}

export class TrendItemDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  receivables: number;

  @ApiProperty()
  payables: number;
}
