import { Balance, type Balance as BalanceAsType } from './balance';
import {
  Transaction,
  type Transaction as TransactionAsType,
} from './transaction';
import { ApiProperty } from '@nestjs/swagger';

export class CurrencyRelations {
  @ApiProperty({ isArray: true, type: () => Balance })
  balances: BalanceAsType[];

  @ApiProperty({ isArray: true, type: () => Transaction })
  transactions: TransactionAsType[];
}
