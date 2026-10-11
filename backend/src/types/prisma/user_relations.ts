import { Contact, type Contact as ContactAsType } from './contact';
import {
  Transaction,
  type Transaction as TransactionAsType,
} from './transaction';
import { ApiProperty } from '@nestjs/swagger';

export class UserRelations {
  @ApiProperty({ isArray: true, type: () => Contact })
  contacts: ContactAsType[];

  @ApiProperty({ isArray: true, type: () => Transaction })
  transactions: TransactionAsType[];

  @ApiProperty({ isArray: true, type: () => Contact })
  isContactFor: ContactAsType[];
}
