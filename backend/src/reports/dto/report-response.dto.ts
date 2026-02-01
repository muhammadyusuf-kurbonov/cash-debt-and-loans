import { ApiProperty } from '@nestjs/swagger';

export class SummaryDto {
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

export class DebtorCreditorDto {
  @ApiProperty()
  contactId: number;

  @ApiProperty()
  contactName: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currencySymbol: string;
}

export class CurrencyBreakdownDto {
  @ApiProperty()
  currencyId: number;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  owed: number;

  @ApiProperty()
  iOwe: number;

  @ApiProperty()
  net: number;
}
