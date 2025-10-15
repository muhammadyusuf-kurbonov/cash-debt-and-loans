import { Balance } from './balance';
import { Transaction } from './transaction';
import { ApiProperty } from '@nestjs/swagger';

export class CurrencyRelations {
  @ApiProperty({ isArray: true, type: () => Balance })
  balances: Balance[];

  @ApiProperty({ isArray: true, type: () => Transaction })
  transactions: Transaction[];
}
