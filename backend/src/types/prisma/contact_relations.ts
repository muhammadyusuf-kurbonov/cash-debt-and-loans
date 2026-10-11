import { User, type User as UserAsType } from './user';
import {
  Transaction,
  type Transaction as TransactionAsType,
} from './transaction';
import { Balance, type Balance as BalanceAsType } from './balance';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactRelations {
  @ApiProperty({ type: () => User })
  user: UserAsType;

  @ApiPropertyOptional({ type: () => User })
  ref_user: UserAsType | null;

  @ApiProperty({ isArray: true, type: () => Transaction })
  Transaction: TransactionAsType[];

  @ApiProperty({ isArray: true, type: () => Balance })
  Balance: BalanceAsType[];
}
